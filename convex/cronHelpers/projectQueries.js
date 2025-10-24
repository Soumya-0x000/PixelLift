import { internalMutation } from '../_generated/server';

/**
 * Get all projects with deleteStatus = 'pending'
 */
export const getPendingProjects = internalMutation({
    handler: async ctx => searchDbByDelStatus(ctx, 'projects', 'pending'),
});

/**
 * Get all projects with deleteStatus = 'failed'
 */
export const getFailedProjects = internalMutation({
    handler: async ctx => searchDbByDelStatus(ctx, 'projects', 'failed'),
});

/** Get all active projects' imgKitFileIds
 */
export const getActiveProjects = internalMutation({
    handler: async ctx => searchDbByDelStatus(ctx, 'projects', 'none'),
});

/**
 * Get all projects from failedProjects table
 */
export const getFailedProjectsFromTable = internalMutation({
    handler: async ctx => {
        return await ctx.db.query('failedProjects').collect();
    },
});

const searchDbByDelStatus = async (ctx, tableName, status) => {
    return await ctx.db
        .query(tableName)
        .withIndex('by_deleteStatus', q => q.eq('deleteStatus', status))
        .collect();
};
