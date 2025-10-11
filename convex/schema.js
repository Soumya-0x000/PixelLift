import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        imageUrl: v.optional(v.string()),
        tokenIdentifier: v.string(),

        plan: v.union(
            v.literal('apprentice_user'),
            v.literal('master_user'),
            v.literal('deity_user')
        ),

        //usage tracking
        projectsUsed: v.number(),
        exportsThisMonth: v.number(),
        createdAt: v.number(),
        lastActiveAt: v.number(),
    })
        .index('by_token', ['tokenIdentifier'])
        .index('by_email', ['email'])
        .searchIndex('search_name', { searchField: 'name' })
        .searchIndex('search_email', { searchField: 'email' }),

    projects: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        userId: v.id('users'),

        canvasState: v.any(),
        width: v.number(),
        height: v.number(),

        originalImageUrl: v.optional(v.string()),
        currentImageUrl: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),

        activeTransformations: v.optional(v.string()),

        backgroundRemoved: v.optional(v.boolean()),

        folderId: v.optional(v.id('folders')),

        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index('by_user', ['userId'])
        .index('by_user_updated', ['userId', 'updatedAt'])
        .index('by_folder', ['folderId']),

    folder: defineTable({
        name: v.string(),
        userId: v.id('users'),
        createdAt: v.number(),
    }).index('by_user', ['userId']),
});
