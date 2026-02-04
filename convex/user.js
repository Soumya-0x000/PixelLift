import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
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
            return;
        }

        const userId = user._id;
        const userProjects = await ctx.db
            .query('projects')
            .withIndex('by_user', q => q.eq('userId', userId));
        console.log(user, 'user');
        console.log(userProjects, 'userProjects');
        if (userProjects.length > 0) {
            console.log(`⚠️ User has projects and cannot be deleted: ${tokenIdentifier}`);
            return;
        }

        // await ctx.db.delete(user._id);
        console.log(`🗑️ User deleted from Convex: ${tokenIdentifier}`);
    },
});
