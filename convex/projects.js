import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { internal } from './_generated/api';

export const create = mutation({
    args: {
        title: v.string(),
        originalImgUrl: v.optional(v.string()),
        currentImgUrl: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        width: v.number(),
        height: v.number(),
        canvasState: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        // get current user
        const user = await ctx.runQuery(internal.users.getCurrentUser);

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
        await ctx.db.insert('projects', {
            title: args.title,
            originalImgUrl: args.originalImgUrl,
            currentImgUrl: args.currentImgUrl,
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
    },
});
