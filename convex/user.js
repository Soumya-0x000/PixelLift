import { v } from 'convex/values';
import { mutation, query, internalAction } from './_generated/server';
import { internal } from './_generated/api';
import { STORAGE_LIMITS } from './storageConfig';

export const store = mutation({
    args: {
        plan: v.union(v.literal('apprentice_user'), v.literal('master_user'), v.literal('deity_user')),
    },
    handler: async (ctx, { plan }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('Called storeUser without authentication present');
        }

        // Check if we've already stored this identity before.
        const user = await ctx.db
            .query('users')
            .withIndex('by_token', q => q.eq('tokenIdentifier', identity.tokenIdentifier))
            .unique();

        if (user !== null) {
            // If we've seen this identity before but the name has changed, patch the value.
            if (user.name !== identity.name) {
                await ctx.db.patch(user._id, { name: identity.name });
            }
            return user._id;
        }
        // If it's a new identity, create a new `User`.
        const userPlan = plan || 'apprentice_user';

        return await ctx.db.insert('users', {
            name: identity.name ?? 'Anonymous',
            email: identity.email ?? '',
            imageUrl: identity.pictureUrl ?? '',
            tokenIdentifier: identity.tokenIdentifier,
            plan: userPlan,
            projectsUsed: 0,
            exportsThisMonth: 0,

            // Storage tracking
            totalStorageBytes: 0,
            storageLimit: STORAGE_LIMITS[userPlan],

            createdAt: Date.now(),
            lastActiveAt: Date.now(),
        });
    },
});

export const getCurrentUser = query({
    handler: async ctx => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error('Not authenticated');
        }

        const user = await ctx.db
            .query('users')
            .withIndex('by_token', q => q.eq('tokenIdentifier', identity.tokenIdentifier))
            .unique();

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    },
});

/**
 * Get storage statistics for all users (admin query)
 */
export const getAllUsersStorageStats = query({
    handler: async ctx => {
        const users = await ctx.db.query('users').collect();

        return users.map(user => ({
            userId: user._id,
            name: user.name,
            email: user.email,
            plan: user.plan,
            totalStorageBytes: user.totalStorageBytes,
            storageLimit: user.storageLimit,
            storageUsedPercentage: (user.totalStorageBytes / user.storageLimit) * 100,
            projectsUsed: user.projectsUsed,
            createdAt: user.createdAt,
        }));
    },
});

/**
 * Get total storage used across all users
 */
export const getTotalStorageUsed = query({
    handler: async ctx => {
        const users = await ctx.db.query('users').collect();

        const totalStorage = users.reduce((sum, user) => sum + user.totalStorageBytes, 0);
        const totalLimit = users.reduce((sum, user) => sum + user.storageLimit, 0);

        // Group by plan
        const byPlan = users.reduce((acc, user) => {
            if (!acc[user.plan]) {
                acc[user.plan] = {
                    userCount: 0,
                    totalStorage: 0,
                    totalLimit: 0,
                };
            }
            acc[user.plan].userCount++;
            acc[user.plan].totalStorage += user.totalStorageBytes;
            acc[user.plan].totalLimit += user.storageLimit;
            return acc;
        }, {});

        return {
            totalUsers: users.length,
            totalStorageBytes: totalStorage,
            totalStorageLimit: totalLimit,
            usagePercentage: (totalStorage / totalLimit) * 100,
            byPlan,
            // Human-readable sizes
            totalStorageGB: (totalStorage / 1024 ** 3).toFixed(2),
            totalLimitGB: (totalLimit / 1024 ** 3).toFixed(2),
        };
    },
});

/**
 * Get detailed storage breakdown for a specific user
 */
export const getUserStorageBreakdown = query({
    args: { userId: v.id('users') },
    handler: async (ctx, { userId }) => {
        const user = await ctx.db.get(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Get all user's projects with their storage
        const projects = await ctx.db
            .query('projects')
            .withIndex('by_user', q => q.eq('userId', userId))
            .collect();

        // Get all user's images
        const images = await ctx.db
            .query('images')
            .withIndex('by_user', q => q.eq('userId', userId))
            .collect();

        // Get all prompted images
        const promptedImages = await ctx.db
            .query('promptedImages')
            .withIndex('by_user', q => q.eq('userId', userId))
            .collect();

        const projectsStorage = projects.reduce((sum, p) => sum + p.totalStorageBytes, 0);
        const imagesStorage = images.reduce((sum, img) => sum + img.size, 0);
        const promptedImagesStorage = promptedImages.reduce((sum, img) => sum + img.size, 0);

        return {
            user: {
                name: user.name,
                email: user.email,
                plan: user.plan,
                totalStorageBytes: user.totalStorageBytes,
                storageLimit: user.storageLimit,
            },
            breakdown: {
                projects: {
                    count: projects.length,
                    totalBytes: projectsStorage,
                    totalGB: (projectsStorage / 1024 ** 3).toFixed(2),
                },
                images: {
                    count: images.length,
                    totalBytes: imagesStorage,
                    totalGB: (imagesStorage / 1024 ** 3).toFixed(2),
                },
                promptedImages: {
                    count: promptedImages.length,
                    totalBytes: promptedImagesStorage,
                    totalGB: (promptedImagesStorage / 1024 ** 3).toFixed(2),
                },
            },
            usage: {
                usedBytes: user.totalStorageBytes,
                limitBytes: user.storageLimit,
                usedGB: (user.totalStorageBytes / 1024 ** 3).toFixed(2),
                limitGB: (user.storageLimit / 1024 ** 3).toFixed(2),
                percentage: ((user.totalStorageBytes / user.storageLimit) * 100).toFixed(2),
            },
        };
    },
});

export const updateUser = mutation({
    args: {
        tokenIdentifier: v.string(),
        plan: v.optional(v.union(v.literal('apprentice_user'), v.literal('master_user'), v.literal('deity_user'))),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
    },

    handler: async (ctx, args) => {
        const { tokenIdentifier, plan, name, email, imageUrl } = args;

        const user = await ctx.db
            .query('users')
            .withIndex('by_token', q => q.eq('tokenIdentifier', tokenIdentifier))
            .unique();

        if (!user) {
            throw new Error('User not found in Convex');
        }

        // Build an update object dynamically
        const updates = { lastActiveAt: Date.now() };

        // Update storage limit if plan changes
        if (plan && plan !== user.plan) {
            updates.plan = plan;
            updates.storageLimit = STORAGE_LIMITS[plan];
        }

        if (name && name !== user.name) updates.name = name;
        if (email && email !== user.email) updates.email = email;
        if (imageUrl && imageUrl !== user.imageUrl) updates.imageUrl = imageUrl;

        // Skip patch if nothing changed
        if (Object.keys(updates).length === 1) {
            return user._id;
        }

        await ctx.db.patch(user._id, updates);
        return user._id;
    },
});

export const deleteUser = mutation({
    args: { tokenIdentifier: v.string() },
    handler: async (ctx, { tokenIdentifier }) => {
        const user = await ctx.db
            .query('users')
            .withIndex('by_token', q => q.eq('tokenIdentifier', tokenIdentifier))
            .unique();

        if (!user) {
            console.log(`⚠️ User not found for deletion: ${tokenIdentifier}`);
            return { success: false, message: 'User not found' };
        }

        const userId = user._id;

        // Mark user for deletion
        await ctx.runMutation(internal.helpers.userDeletion.markUserForDeletion, { userId });

        // Schedule background worker to handle deletion
        await ctx.scheduler.runAfter(0, internal.user.userDeletionWorker, { userId });

        console.log(`🗑️ User deletion scheduled for: ${tokenIdentifier}`);

        return { success: true };
    },
});

export const userDeletionWorker = internalAction({
    args: { userId: v.id('users') },
    handler: async (ctx, { userId }) => {
        // Verify user exists
        const user = await ctx.runQuery(internal.helpers.userDeletion.getUserById, { userId });
        if (!user) {
            console.log(`⚠️ User not found for deletion: ${userId}`);
            return { success: false, message: 'User not found' };
        }

        console.log(`🗑️ Starting deletion process for user: ${user.email}`);

        // Delete all images from ImageKit (both regular and prompted images)
        const deletionResults = await ctx.runAction(internal.helpers.userDeletion.deleteUserImagesFromImageKit, { userId });

        console.log(`📊 ImageKit deletion completed:`, deletionResults);

        // Delete all database records
        await ctx.runMutation(internal.helpers.userDeletion.deleteUserRecords, { userId });

        console.log(`✅ User deletion completed for: ${user.email}`);

        return { success: true, deletionResults };
    },
});
