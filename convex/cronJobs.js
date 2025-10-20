import { internalAction, internalMutation } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';

export const cleanupPendingProjects = internalAction({
    handler: async ctx => {
        // Get all projects that are pending or failed but still eligible for retry
        const pendingProjects = await ctx.runMutation(internal.cronJobs.getPendingProjects);

        let successCount = 0;
        let failCount = 0;

        if (!pendingProjects.length) return { success: true, processed: 0, succeeded: 0, failed: 0 };

        for (const project of pendingProjects) {
            try {
                // Initialize retry count if not set
                const retryCount = project.retryCount ?? 0;
                const maxRetries = project.maxRetries ?? 3;

                // Delete from ImageKit
                const { success: imgDeleted, status } = await ctx.runAction(
                    internal.cronHelpers.deleteImageKitFile.deleteImageKitFile,
                    { fileId: project.imgKitFileId }
                );

                console.log(`ImageKit result for ${project._id}:`, { imgDeleted, status });

                if (imgDeleted || status === 204) {
                    // Successfully deleted, remove from projects
                    await ctx.runMutation(internal.cronJobs.deleteProjectRecord, {
                        projectId: project._id,
                    });
                    successCount++;
                } else {
                    // Increment retry count
                    const newRetryCount = retryCount + 1;

                    if (newRetryCount >= maxRetries) {
                        // Mark as permanently failed
                        await ctx.runMutation(internal.cronJobs.moveToFailedProjects, {
                            projectId: project._id,
                        });
                    } else {
                        // Update retry count and leave deleteStatus as 'pending'
                        await ctx.db.patch(project._id, {
                            retryCount: newRetryCount,
                            failedAt: Date.now(),
                        });
                    }

                    failCount++;
                }
            } catch (error) {
                console.error(
                    `Failed to cleanup project ${project._id} with fileId ${project.imgKitFileId}:`,
                    error
                );
                failCount++;
            }
        }

        return {
            success: true,
            processed: pendingProjects.length,
            succeeded: successCount,
            failed: failCount,
        };
    },
});

// Get pending projects
export const getPendingProjects = internalMutation({
    handler: async ctx => {
        return await ctx.db
            .query('projects')
            .withIndex('by_deleteStatus', q => q.eq('deleteStatus', 'pending'))
            .collect();
    },
});

// Get failed projects
export const getFailedProjects = internalMutation({
    handler: async ctx => {
        return await ctx.db
            .query('projects')
            .withIndex('by_deleteStatus', q => q.eq('deleteStatus', 'failed'))
            .collect();
    },
});

// Mutation to mark project as permanently failed
export const markProjectFailed = internalMutation({
    args: { projectId: v.id('projects') },
    handler: async (ctx, { projectId }) => {
        await ctx.db.patch(projectId, {
            deleteStatus: 'failed',
            failedAt: Date.now(),
            retryCount: ctx.db.get(projectId).retryCount ?? 0,
        });
        return { success: true };
    },
});

// Helper mutation to delete project record
export const deleteProjectRecord = internalMutation({
    args: { projectId: v.id('projects') },
    handler: async (ctx, { projectId }) => {
        await ctx.db.delete(projectId);
        return { success: true };
    },
});

// Move project to failedProjects table and delete from projects
export const moveToFailedProjects = internalMutation({
    args: { projectId: v.id('projects') },
    handler: async (ctx, { projectId }) => {
        const project = await ctx.db.get(projectId);
        if (!project) return { success: false, message: 'Project not found' };

        await ctx.db.insert('failedProjects', {
            ...project,
            deleteStatus: 'failed',
            failedAt: Date.now(),
        });

        await ctx.db.delete(projectId);

        return { success: true };
    },
});

export const cleanupOldFailedProjects = internalMutation({
    handler: async ctx => {
        const twoMonthsAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
        const oldFailed = await ctx.db
            .query('failedProjects')
            .withIndex('by_failedAt', q => q.lte('failedAt', twoMonthsAgo))
            .collect();

        for (const project of oldFailed) {
            await ctx.db.delete(project._id);
        }

        return { deleted: oldFailed.length };
    },
});
