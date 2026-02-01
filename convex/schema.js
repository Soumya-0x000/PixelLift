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
        currentImageId: v.id('images'), // Points to current version
        originalImageId: v.id('images'), // Points to v0 (never changes)
        totalVersions: v.number(), // Count of versions
        maxVersions: v.number(), // 7 (v0 + 6 edits)

        // Image URLs
        originalImageUrl: v.optional(v.string()),
        currentImageUrl: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        imgKitFileId: v.string(),

        // NEW: Storage info
        totalStorageBytes: v.number(), // Sum of all version sizes
        imagekitFolder: v.string(), // "/pixellift-projects/user123/proj456"

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

        currentImageId: v.id('images'), // Points to current version
        originalImageId: v.id('images'), // Points to v0 (never changes)
        totalVersions: v.number(), // Count of versions
        maxVersions: v.number(), // 7 (v0 + 6 edits)

        originalImageUrl: v.optional(v.string()),
        currentImageUrl: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        imgKitFileId: v.string(),

        totalStorageBytes: v.number(), // Sum of all version sizes
        imagekitFolder: v.string(), // "/pixellift-projects/user123/proj456"

        activeTransformations: v.optional(v.string()),
        backgroundRemoved: v.optional(v.boolean()),

        folderId: v.optional(v.id('folders')),

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

    images: defineTable({
        // Relationships
        projectId: v.id('projects'),
        userId: v.id('users'),

        // Version control
        version: v.number(), // 0, 1, 2, 3, 4, 5, 6
        parentImageId: v.optional(v.id('images')), // Links to previous version
        isCurrentVersion: v.boolean(), // Only one true per project
        isOriginal: v.boolean(), // True only for v0

        // Image classification
        imageType: v.union(
            v.literal('uploaded'), // v0 - original upload
            v.literal('edited'), // v1-v6 - user edits
            v.literal('prompted_bg'), // AI-generated background
            v.literal('prompted_fg') // AI-generated foreground
        ),

        // Edit tracking
        editOperations: v.array(
            v.object({
                type: v.string(), // "crop", "bg-remove", "resize"
                timestamp: v.number(),
                parameters: v.optional(v.any()), // Store edit params
            })
        ),
        lastOperation: v.optional(v.string()), // Quick access to last edit

        // ImageKit storage
        imagekitFileId: v.string(), // For deletion
        imagekitUrl: v.string(), // Full URL
        imagekitPath: v.string(), // Folder path
        fileName: v.string(), // "v1_cropped_1705401345678.jpg"

        // Image metadata
        width: v.number(),
        height: v.number(),
        size: v.number(), // Bytes
        format: v.string(), // "jpg", "png", "webp"
        mimeType: v.string(), // "image/jpeg"

        // Thumbnails
        thumbnailUrl: v.optional(v.string()), // Small preview (100x100)
        previewUrl: v.optional(v.string()), // Medium preview (400x400)

        // AI-generated specific
        prompt: v.optional(v.string()), // For prompted images
        promptHash: v.optional(v.string()), // For deduplication
        aiModel: v.optional(v.string()), // "flux-schnell"

        // Timestamps
        createdAt: v.number(),

        // Soft delete
        isDeleted: v.boolean(),
        deletedAt: v.optional(v.number()),
    })
        .index('by_project', ['projectId'])
        .index('by_project_version', ['projectId', 'version'])
        .index('by_current', ['projectId', 'isCurrentVersion'])
        .index('by_user', ['userId'])
        .index('by_type', ['imageType'])
        .index('by_deleted', ['isDeleted'])
        .index('by_prompt_hash', ['promptHash']),

    versionHistory: defineTable({
        projectId: v.id('projects'),
        userId: v.id('users'),

        // Action tracking
        action: v.union(
            v.literal('created'), // New version created
            v.literal('activated'), // Switched to version (undo/redo)
            v.literal('deleted') // Version deleted
        ),

        // Version info
        fromVersion: v.optional(v.number()), // For undo/redo tracking
        toVersion: v.number(),
        imageId: v.id('images'),

        // Metadata
        operation: v.optional(v.string()), // "crop", "undo", "redo"
        timestamp: v.number(),
    })
        .index('by_project', ['projectId'])
        .index('by_timestamp', ['timestamp']),

    promptedImages: defineTable({
        userId: v.id('users'),

        // Prompt info
        prompt: v.string(),
        promptHash: v.string(), // MD5 hash for deduplication

        // Generation details
        aiModel: v.string(), // "flux-schnell"
        parameters: v.object({
            width: v.number(),
            height: v.number(),
            steps: v.optional(v.number()),
            guidance: v.optional(v.number()),
        }),

        // Storage
        imagekitFileId: v.string(),
        imagekitUrl: v.string(),
        imagekitPath: v.string(),

        // Metadata
        width: v.number(),
        height: v.number(),
        size: v.number(),

        // Usage tracking
        usageCount: v.number(), // How many times used
        lastUsedAt: v.number(),

        // Timestamps
        createdAt: v.number(),

        // Cleanup
        isDeleted: v.boolean(),
    })
        .index('by_user', ['userId'])
        .index('by_hash', ['promptHash'])
        .index('by_usage', ['usageCount']),

    folder: defineTable({
        name: v.string(),
        userId: v.id('users'),
        createdAt: v.number(),
    }).index('by_user', ['userId']),
});
