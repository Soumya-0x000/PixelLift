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
        imgKitFileId: v.string(),
        size: v.number(),
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
        if (user?.plan === 'apprentice_user') {
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
            description: args.description,
            originalImageUrl: args.originalImageUrl,
            currentImageUrl: args.currentImageUrl,
            thumbnailUrl: args.thumbnailUrl,
            width: args.width,
            height: args.height,
            imgKitFileId: args.imgKitFileId,
            size: args.size,
            canvasState: args.canvasState,
            userId: user._id,
            deleteStatus: 'none',
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
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query('users')
            .withIndex('by_token', q => q.eq('tokenIdentifier', identity.tokenIdentifier))
            .unique();
        if (!user) return [];

        const projects = await ctx.db
            .query('projects')
            .withIndex('by_user_updated', q => q.eq('userId', user?._id))
            .order('desc')
            .collect();

        return projects;
    },
});

export const updateProject = mutation({
    args: {
        projectId: v.id('projects'),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        canvasState: v.optional(v.any()),
        currentImageUrl: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        deleteStatus: v.optional(
            v.union(v.literal('pending'), v.literal('deleted'), v.literal('failed'))
        ),
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

        if (project.userId !== user._id) {
            throw new Error('Not authorized to update this project');
        }

        await ctx.db.patch(args.projectId, {
            title: args.title ?? project.title,
            description: args.description ?? project.description,
            canvasState: args.canvasState ?? project.canvasState,
            currentImageUrl: args.currentImageUrl ?? project.currentImageUrl,
            thumbnailUrl: args.thumbnailUrl ?? project.thumbnailUrl,
            deleteStatus: args.deleteStatus ?? project.deleteStatus,
        });

        return { success: true };
    },
});

export const deleteProject = mutation({
    args: {
        projectId: v.id('projects'),
    },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.projectId);

        if (!project) {
            throw new Error('Project not found');
        }

        if (project.deleteStatus !== 'pending') {
            throw new Error('Delete must be pending before final removal');
        }

        const user = await ctx.runQuery(internal.user.getCurrentUser);

        if (!user) {
            throw new Error('Not authenticated');
        }

        if (!args.projectId) {
            throw new Error('Project ID is required');
        }

        if (project.userId !== user._id) {
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
