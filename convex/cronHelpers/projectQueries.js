import { internalMutation } from '../_generated/server';

/**
 * Get all projects with deleteStatus = 'pending'
 */
export const getPendingProjects = internalMutation({
    handler: async ctx => {
        return await ctx.db
            .query('projects')
            .withIndex('by_deleteStatus', q => q.eq('deleteStatus', 'pending'))
            .collect();
    },
});

/**
 * Get all projects with deleteStatus = 'failed'
 */
export const getFailedProjects = internalMutation({
    handler: async ctx => {
        return await ctx.db
            .query('projects')
            .withIndex('by_deleteStatus', q => q.eq('deleteStatus', 'failed'))
            .collect();
    },
});

/**
 * Get all projects from failedProjects table
 */
export const getFailedProjectsFromTable = internalMutation({
    handler: async ctx => {
        return await ctx.db.query('failedProjects').collect();
    },
});
