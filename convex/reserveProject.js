import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { internal } from './_generated/api';

/**
 * Reserves a project ID and validates user limits before upload
 * This allows us to generate the ImageKit folder path before uploading
 */
export const reserveProjectId = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Get current user
        const user = await ctx.runQuery(internal.user.getCurrentUser);

        if (!user) {
            throw new Error('Not authenticated');
        }

        // 2. Enforce plan limits
        if (user.plan === 'apprentice_user') {
            const projectCount = await ctx.db
                .query('projects')
                .withIndex('by_user', q => q.eq('userId', user._id))
                .collect();

            if (projectCount.length >= 3) {
                throw new Error('Free plan limit reached. Please upgrade to create unlimited projects.');
            }
        }

        // 3. Generate a temporary project ID (we'll use this for the folder structure)
        const tempProjectId = crypto.randomUUID();

        // 4. Return project metadata for upload
        return {
            tempProjectId,
            userId: user._id,
            clerkUserId: user.tokenIdentifier.split('|')[1], // Extract Clerk user ID
            imagekitFolder: `/pixellift-projects/${user.tokenIdentifier.split('|')[1]}/${tempProjectId}/versions`,
            title: args.title,
            description: args.description,
        };
    },
});
