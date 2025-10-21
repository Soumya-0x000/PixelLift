import { internalAction, internalMutation } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';

export const cleanupPendingProjects = internalAction({
    handler: async ctx => {
        const pendingProjects = await ctx.runMutation(internal.cronJobs.getPendingProjects);
        const failedProjects = await ctx.runMutation(internal.cronJobs.getFailedProjects);

        let successCount = 0;
        let failCount = 0;

        // Handle already failed projects (move to failedProjects table)
        if (failedProjects.length > 0) {
            for (const project of failedProjects) {
                await ctx.runMutation(internal.cronJobs.moveToFailedProjects, {
                    projectId: project._id,
                });
            }
        }

        if (!pendingProjects.length) {
            return { success: true, processed: 0, succeeded: 0, failed: 0 };
        }

        for (const project of pendingProjects) {
            try {
                const retryCount = project.retryCount ?? 0;
                const maxRetries = 3;

                // STEP 1: Check if file exists in ImageKit
                const { exists } = await ctx.runAction(internal.cronJobs.checkImageKitFileExists, {
                    fileId: project.imgKitFileId,
                });

                console.log(`File ${project.imgKitFileId} exists:`, exists);

                // STEP 2: Handle based on existence
                if (exists === false) {
                    // File doesn't exist - just clean up DB
                    await ctx.runMutation(internal.cronJobs.deleteProjectRecord, {
                        projectId: project._id,
                    });
                    console.log(`✅ Cleaned up orphaned DB record for ${project._id}`);
                    successCount++;
                    continue;
                }

                // STEP 3: File exists or unknown - try to delete
                const { success: imgDeleted, status } = await ctx.runAction(
                    internal.cronHelpers.deleteImageKitFile.deleteImageKitFile,
                    { fileId: project.imgKitFileId }
                );

                console.log(`ImageKit deletion result for ${project._id}:`, { imgDeleted, status });

                if (imgDeleted || status === 204) {
                    // Successfully deleted
                    await ctx.runMutation(internal.cronJobs.deleteProjectRecord, {
                        projectId: project._id,
                    });
                    successCount++;
                } else if (status === 404 || status === 400) {
                    // File was already deleted (race condition)
                    await ctx.runMutation(internal.cronJobs.deleteProjectRecord, {
                        projectId: project._id,
                    });
                    console.log(`✅ File already deleted, cleaned up DB for ${project._id}`);
                    successCount++;
                } else {
                    // Deletion failed - increment retry
                    const newRetryCount = retryCount + 1;

                    if (newRetryCount >= maxRetries) {
                        // Max retries reached - mark as failed
                        await ctx.runMutation(internal.cronJobs.markProjectFailed, {
                            projectId: project._id,
                        });
                        console.log(`❌ Max retries reached for ${project._id}`);
                    } else {
                        // Increment retry count
                        await ctx.runMutation(internal.cronJobs.updateRetryCount, {
                            projectId: project._id,
                            retryCount: newRetryCount,
                        });
                        console.log(`🔄 Retry ${newRetryCount}/${maxRetries} for ${project._id}`);
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

export const checkImageKitFileExists = internalAction({
    args: { fileId: v.string() },
    handler: async (ctx, { fileId }) => {
        const IMAGEKIT_BASE_URL = 'https://api.imagekit.io/v1/files';
        const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;

        try {
            // Try to get file details
            const res = await fetch(`${IMAGEKIT_BASE_URL}/${fileId}/details`, {
                method: 'GET',
                headers: {
                    Authorization: `Basic ${btoa(`${IMAGEKIT_PRIVATE_KEY}:`)}`,
                },
            });

            if (res.status === 404) {
                return { exists: false }; // File doesn't exist
            }

            // Check for success status codes (200-299)
            if (res.status >= 200 && res.status < 300) {
                return { exists: true }; // File exists
            }

            return { exists: 'unknown', status: res.status }; // Can't determine
        } catch (err) {
            return { exists: 'unknown', error: err.message };
        }
    },
});

export const auditOrphanedFiles = internalAction({
    handler: async ctx => {
        const failedProjects = await ctx.runMutation(internal.cronJobs.getFailedProjectsFromTable);

        let cleanedUp = 0;

        for (const project of failedProjects) {
            // Check if ImageKit file still exists
            const { exists } = await ctx.runAction(internal.cronJobs.checkImageKitFileExists, {
                fileId: project.imgKitFileId,
            });

            if (exists === false) {
                // File doesn't exist - safe to remove from failedProjects
                await ctx.runMutation(internal.cronJobs.deleteFailedProjectRecord, {
                    projectId: project._id,
                });
                cleanedUp++;
                console.log(`✅ Cleaned up false-positive failed project ${project._id}`);
            }
        }

        return { audited: failedProjects.length, cleanedUp };
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
    args: {
        projectId: v.id('projects'),
    },
    handler: async (ctx, { projectId }) => {
        const project = await ctx.db.get(projectId);

        if (!project) {
            throw new Error('Project not found');
        }

        // Create a new document WITHOUT the _id and _creationTime fields
        const { _id, _creationTime, ...projectData } = project;

        // Insert into failedProjects (Convex will generate a new ID)
        await ctx.db.insert('failedProjects', {
            ...projectData,
            deleteStatus: 'failed',
            failedAt: Date.now(),
        });

        // Delete from projects table
        await ctx.db.delete(projectId);

        return { success: true };
    },
});

// Cleanup old failed projects (e.g., older than 60 days)
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

// Update failed project retry count
export const updateRetryCount = internalMutation({
    args: {
        projectId: v.id('projects'),
        retryCount: v.number(),
    },
    handler: async (ctx, { projectId, retryCount }) => {
        await ctx.db.patch(projectId, {
            retryCount,
            failedAt: Date.now(),
        });
    },
});

// Get all failed projects
export const getFailedProjectsFromTable = internalMutation({
    handler: async ctx => {
        return await ctx.db.query('failedProjects').collect();
    },
});

// Helper mutation to delete failed project record
export const deleteFailedProjectRecord = internalMutation({
    args: { projectId: v.id('failedProjects') },
    handler: async (ctx, { projectId }) => {
        await ctx.db.delete(projectId);
        return { success: true };
    },
});
