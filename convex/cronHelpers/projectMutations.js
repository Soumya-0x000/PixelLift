import { internalMutation } from '../_generated/server';
import { v } from 'convex/values';

/**
 * Delete a project record from projects table
 */
export const deleteProjectRecord = internalMutation({
    args: { projectId: v.id('projects') },
    handler: async (ctx, { projectId }) => {
        await ctx.db.delete(projectId);
        return { success: true };
    },
});

/**
 * Mark project as failed (after max retries)
 */
export const markProjectFailed = internalMutation({
    args: { projectId: v.id('projects') },
    handler: async (ctx, { projectId }) => {
        const project = await ctx.db.get(projectId);
        await ctx.db.patch(projectId, {
            deleteStatus: 'failed',
            failedAt: Date.now(),
            retryCount: project?.retryCount ?? 0,
        });
        return { success: true };
    },
});

/**
 * Update retry count for a project
 */
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
        return { success: true };
    },
});

/**
 * Move project from projects table to failedProjects table
 */
export const moveToFailedProjects = internalMutation({
    args: { projectId: v.id('projects') },
    handler: async (ctx, { projectId }) => {
        const project = await ctx.db.get(projectId);

        if (!project) {
            console.warn(`Project ${projectId} not found for moving to failedProjects`);
            return { success: false };
        }

        // Strip Convex internal fields
        const { _id, _creationTime, ...projectData } = project;

        // Insert into failedProjects
        await ctx.db.insert('failedProjects', {
            ...projectData,
            deleteStatus: 'failed',
            failedAt: Date.now(),
        });

        // Delete from projects
        await ctx.db.delete(projectId);

        return { success: true };
    },
});

/**
 * Delete a record from failedProjects table
 */
export const deleteFailedProjectRecord = internalMutation({
    args: { projectId: v.id('failedProjects') },
    handler: async (ctx, { projectId }) => {
        await ctx.db.delete(projectId);
        return { success: true };
    },
});

/**
 * Delete old failed projects (60+ days)
 */
export const deleteOldFailedProjects = internalMutation({
    handler: async ctx => {
        const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
        const oldFailed = await ctx.db
            .query('failedProjects')
            .withIndex('by_failedAt', q => q.lte('failedAt', sixtyDaysAgo))
            .collect();

        for (const project of oldFailed) {
            await ctx.db.delete(project._id);
        }

        console.log(`🗑️ Deleted ${oldFailed.length} old failed projects`);
        return oldFailed.length;
    },
});
