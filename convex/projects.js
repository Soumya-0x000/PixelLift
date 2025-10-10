import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { internal } from './_generated/api';

export const create = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        originalImageUrl: v.optional(v.string()),
        currentImageUrl: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        width: v.number(),
        height: v.number(),
        canvasState: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        // get current user
        const user = await ctx.runQuery(internal.user.getCurrentUser);

        // ensure user is authenticated
        if (!user) {
            throw new Error('Not authenticated');
        }

        // enforce free plan limits
        if (user?.plan === 'free') {
            const projectCount = await ctx.db
                .query('projects')
                .withIndex('by_user', q => q.eq('userId', user._id))
                .collect();

            if (projectCount.length >= 3) {
                throw new Error(
                    'Free plan limit reached. Please upgrade to create unlimited projects.'
                );
            }
        }

        // create new project
        const projectId = await ctx.db.insert('projects', {
            title: args.title,
            originalImageUrl: args.originalImageUrl,
            currentImageUrl: args.currentImageUrl,
            thumbnailUrl: args.thumbnailUrl,
            width: args.width,
            height: args.height,
            canvasState: args.canvasState,
            userId: user._id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // update user's project count
        await ctx.db.patch(user._id, {
            projectsUsed: user.projectsUsed + 1,
            lastActiveAt: Date.now(),
        });

        return projectId;
    },
});

export const getUserProjects = query({
    handler: async ctx => {
        const identity = ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query('users')
            .withIndex('by_token', q => q.eq('tokenIdentifier', identity.tokenIdentifier))
            .unique();
        console.log(user)
        // if (!user) return [];

        const projects = await ctx.db
            .query('projects')
            .withIndex('by_user_updated', q => q.eq('userId', user?._id))
            .order('desc')
            .collect();

        return projects;
    },
});

export const deleteProject = mutation({
    args: {
        projectId: v.id('projects'),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(internal.user.getCurrentUser);

        if (!user) {
            throw new Error('Not authenticated');
        }

        if (!args.projectId) {
            throw new Error('Project ID is required');
        }

        const project = await ctx.db.get(args.projectId);

        if (!project) {
            throw new Error('Project not found');
        }

        if (project.userId._id !== user._id) {
            throw new Error('Not authorized to delete this project');
        }

        await ctx.db.delete(args.projectId);
        await ctx.db.patch(user._id, {
            projectsUsed: Math.max(0, user.projectsUsed - 1),
            lastActiveAt: Date.now(),
        });

        return { success: true };
    },
});
