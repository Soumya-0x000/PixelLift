import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const store = mutation({
    args: {},
    handler: async ctx => {
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
            plan: 'apprentice',
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

export const updateUserPlan = mutation({
    args: {
        tokenIdentifier: v.string(),
        plan: v.union(v.literal('apprentice'), v.literal('master'), v.literal('deity')),
    },
    handler: async (ctx, args) => {
        const { tokenIdentifier, plan } = args;

        const user = await ctx.db
            .query('users')
            .withIndex('by_token', q => q.eq('tokenIdentifier', tokenIdentifier))
            .unique();

        if (!user) {
            throw new Error('User not found in Convex');
        }

        return await ctx.db.patch(user._id, {
            plan,
            lastActiveAt: Date.now(),
        });
    },
});
