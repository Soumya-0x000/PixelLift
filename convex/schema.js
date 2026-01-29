import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        imageUrl: v.optional(v.string()),
        tokenIdentifier: v.string(),

        // Plan management
        plan: v.union(v.literal('apprentice_user'), v.literal('master_user'), v.literal('deity_user')),

        //usage tracking
        projectsUsed: v.number(),
        exportsThisMonth: v.number(),

        // Storage tracking
        totalStorageBytes: v.number(),
        storageLimit: v.number(),

        // Timestamps
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

        // Canvas state
        canvasState: v.any(),
        width: v.number(),
        height: v.number(),
        size: v.number(),

        // Version tracking
        currentImageId: v.id('images'),
        originalImageId: v.id('images'),
        totalVersions: v.number(),
        maxVersions: v.number(),

        // Image URLs
        originalImageUrl: v.optional(v.string()),
        currentImageUrl: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        imgKitFileId: v.string(),

        // NEW: Storage info
        totalStorageBytes: v.number(),
        imagekitFolder: v.string(),

        // Transformations
        activeTransformations: v.optional(v.string()),
        backgroundRemoved: v.optional(v.boolean()),

        folderId: v.optional(v.id('folders')),

        deleteStatus: v.optional(v.union(v.literal('none'), v.literal('pending'), v.literal('deleted'), v.literal('failed'))),

        // Deletion tracking
        failedAt: v.optional(v.number()),
        retryCount: v.optional(v.number()),
        maxRetries: v.optional(v.number()),

        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
        lastEditedAt: v.number(),
    })
        .index('by_user', ['userId'])
        .index('by_user_updated', ['userId', 'updatedAt'])
        .index('by_folder', ['folderId'])
        .index('by_deleteStatus', ['deleteStatus']),

    failedProjects: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        userId: v.id('users'),

        canvasState: v.any(),
        width: v.number(),
        height: v.number(),
        size: v.number(),

        originalImageUrl: v.optional(v.string()),
        currentImageUrl: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),

        activeTransformations: v.optional(v.string()),

        backgroundRemoved: v.optional(v.boolean()),

        folderId: v.optional(v.id('folders')),
        imgKitFileId: v.string(),

        deleteStatus: v.optional(v.union(v.literal('deleted'), v.literal('failed'))),
        failedAt: v.optional(v.number()),
        retryCount: v.optional(v.number()),
        maxRetries: v.optional(v.number()),

        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index('by_user', ['userId'])
        .index('by_user_updated', ['userId', 'updatedAt'])
        .index('by_folder', ['folderId'])
        .index('by_deleteStatus', ['deleteStatus'])
        .index('by_failedAt', ['failedAt']),

    folder: defineTable({
        name: v.string(),
        userId: v.id('users'),
        createdAt: v.number(),
    }).index('by_user', ['userId']),
});
