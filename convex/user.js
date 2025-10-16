import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const store = mutation({
    args: {
        plan: v.union(
            v.literal('apprentice_user'),
            v.literal('master_user'),
            v.literal('deity_user')
        ),
    },
    handler: async (ctx, { plan }) => {
        console.log(plan);
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
        return await ctx.db.insert('users', {
            name: identity.name ?? 'Anonymous',
            email: identity.email ?? '',
            imageUrl: identity.pictureUrl ?? '',
            tokenIdentifier: identity.tokenIdentifier,
            plan: plan || 'apprentice_user',
            projectsUsed: 0,
            exportsThisMonth: 0,
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
        plan: v.optional(
            v.union(v.literal('apprentice_user'), v.literal('master_user'), v.literal('deity_user'))
        ),
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

        if (plan && plan !== user.plan) updates.plan = plan;
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

        if (user) {
            await ctx.db.delete(user._id);
            console.log(`🗑️ User deleted from Convex: ${tokenIdentifier}`);
        } else {
            console.log(`⚠️ User not found for deletion: ${tokenIdentifier}`);
        }
    },
});
