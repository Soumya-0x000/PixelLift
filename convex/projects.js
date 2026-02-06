import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { internal } from './_generated/api';

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

export const create = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        canvasState: v.optional(v.any()),
        
        originalImageUrl: v.optional(v.string()),
        currentImageUrl: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        imgKitFileId: v.string(),
        
        width: v.number(),
        height: v.number(),
        size: v.number(),
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
                throw new Error('Free plan limit reached. Please upgrade to create unlimited projects.');
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

export const createProjectWithVersion = mutation({
    args: {
        // Project metadata
        title: v.string(),
        description: v.optional(v.string()),
        
        // Image dimensions and size
        canvasState: v.optional(v.any()),
        width: v.number(),
        height: v.number(),
        size: v.number(),

        // ImageKit data
        imgKitFileId: v.string(),
        imagekitUrl: v.string(),
        imagekitFolder: v.string(), // e.g., "/pixellift-projects/user123/proj456"
        fileName: v.string(), // e.g., "v0_original_1738410000000.jpg"
        thumbnailUrl: v.string(),
        format: v.string(), // e.g., "jpg", "png"
        mimeType: v.string(), // e.g., "image/jpeg"
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

        // 3. Check storage limits
        const newTotalStorage = user.totalStorageBytes + args.size;
        if (newTotalStorage > user.storageLimit) {
            throw new Error(`Storage limit exceeded. You need ${Math.ceil((newTotalStorage - user.storageLimit) / 1024 / 1024)}MB more space.`);
        }

        const now = Date.now();

        // 4. Create v0 image record
        const imageId = await ctx.db.insert('images', {
            // Relationships
            projectId: null, // Will be updated after project creation
            userId: user._id,

            // Version control
            version: 0,
            parentImageId: undefined,
            isCurrentVersion: true,
            isOriginal: true,

            // Image classification
            imageType: 'uploaded',

            // Edit tracking
            editOperations: [],
            lastOperation: undefined,

            // ImageKit storage
            imagekitFileId: args.imgKitFileId,
            imagekitUrl: args.imagekitUrl,
            imagekitPath: args.imagekitFolder,
            fileName: args.fileName,

            // Image metadata
            width: args.width,
            height: args.height,
            size: args.size,
            format: args.format,
            mimeType: args.mimeType,

            // Thumbnails
            thumbnailUrl: args.thumbnailUrl,
            previewUrl: args.thumbnailUrl, // Same for v0

            // AI-generated specific
            prompt: undefined,
            promptHash: undefined,
            aiModel: undefined,

            // Timestamps
            createdAt: now,

            // Soft delete
            isDeleted: false,
            deletedAt: undefined,
        });

        // 5. Create project record
        const projectId = await ctx.db.insert('projects', {
            title: args.title,
            description: args.description,
            userId: user._id,

            // Canvas state
            canvasState: args.canvasState,
            width: args.width,
            height: args.height,
            size: args.size,

            // Version tracking
            currentImageId: imageId,
            originalImageId: imageId,
            totalVersions: 1, // v0
            maxVersions: 7, // v0 + 6 edits

            // Image URLs
            originalImageUrl: args.imagekitUrl,
            currentImageUrl: args.imagekitUrl,
            thumbnailUrl: args.thumbnailUrl,
            imgKitFileId: args.imgKitFileId,

            // Storage info
            totalStorageBytes: args.size,
            imagekitFolder: args.imagekitFolder,

            // Transformations
            activeTransformations: undefined,
            backgroundRemoved: undefined,

            folderId: undefined,
            deleteStatus: 'none',

            // Deletion tracking
            failedAt: undefined,
            retryCount: undefined,
            maxRetries: undefined,

            // Timestamps
            createdAt: now,
            updatedAt: now,
            lastEditedAt: now,
        });

        // 6. Update image record with projectId
        await ctx.db.patch(imageId, {
            projectId: projectId,
        });

        // 7. Create version history entry
        await ctx.db.insert('versionHistory', {
            projectId: projectId,
            userId: user._id,

            // Action tracking
            action: 'created',

            // Version info
            fromVersion: undefined,
            toVersion: 0,
            imageId: imageId,

            // Metadata
            operation: 'upload',
            timestamp: now,
        });

        // 8. Update user storage and project count
        await ctx.db.patch(user._id, {
            projectsUsed: user.projectsUsed + 1,
            totalStorageBytes: newTotalStorage,
            lastActiveAt: now,
        });

        // 9. Return complete project data
        return {
            projectId,
            imageId,
            version: 0,
            project: {
                _id: projectId,
                title: args.title,
                description: args.description,
                currentImageUrl: args.imagekitUrl,
                thumbnailUrl: args.thumbnailUrl,
                width: args.width,
                height: args.height,
                totalVersions: 1,
                maxVersions: 7,
            },
        };
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
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        currentImageUrl: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        deleteStatus: v.optional(v.union(v.literal('pending'), v.literal('deleted'), v.literal('failed'))),
        activeTransformations: v.optional(v.string()),
        backgroundRemoved: v.optional(v.boolean()),
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

        const updatedData = {
            updatedAt: Date.now(),
            title: args.title ?? project.title,
            description: args.description ?? project.description,
            canvasState: args.canvasState ?? project.canvasState,
            width: args.width ?? project.width,
            height: args.height ?? project.height,
            activeTransformations: args.activeTransformations ?? project.activeTransformations,
            backgroundRemoved: args.backgroundRemoved ?? project.backgroundRemoved,
            currentImageUrl: args.currentImageUrl ?? project.currentImageUrl,
            thumbnailUrl: args.thumbnailUrl ?? project.thumbnailUrl,
            deleteStatus: args.deleteStatus ?? project.deleteStatus,
        };

        await ctx.db.patch(args.projectId, updatedData);
        await ctx.db.patch(user._id, {
            lastActiveAt: Date.now(),
        });

        return { success: true, data: updatedData };
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

export const getProjectById = query({
    args: {
        projectId: v.id('projects'),
    },
    handler: async (ctx, args) => {
        try {
            const identity = await ctx.auth.getUserIdentity();
            if (!identity) {
                return {
                    success: false,
                    error: 'Not authenticated',
                    data: null,
                };
            }

            const user = await ctx.db
                .query('users')
                .withIndex('by_token', q => q.eq('tokenIdentifier', identity.tokenIdentifier))
                .unique();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                    data: null,
                };
            }

            const project = await ctx.db.get(args.projectId);

            if (!project) {
                return {
                    success: false,
                    error: 'Project not found',
                    data: null,
                };
            }

            if (project.userId !== user._id) {
                return {
                    success: false,
                    error: 'Not authorized to access this project',
                    data: null,
                };
            }

            return {
                success: true,
                error: null,
                data: project,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'An error occurred',
                data: null,
            };
        }
    },
});
