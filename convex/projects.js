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

        const now = Date.now();

        // 3. Create project entry with required fields (placeholder values)
        const projectId = await ctx.db.insert('projects', {
            title: args.title,
            description: args.description,
            userId: user._id,

            // Project status (pending until image upload completes)
            status: 'pending',

            // Required fields with placeholder values (will be updated later)
            canvasState: undefined,
            width: 0,
            height: 0,
            size: 0,
            totalVersions: 0,
            maxVersions: 7,
            imgKitFileId: '',
            totalStorageBytes: 0,
            imagekitFolder: '', // Will be updated below

            // Optional fields
            deleteStatus: 'none',

            // Timestamps
            createdAt: now,
            updatedAt: now,
            lastEditedAt: now,
        });

        // 4. Generate ImageKit folder using real Convex projectId
        const clerkUserId = user.tokenIdentifier.split('|')[1];
        const imagekitFolder = `/pixellift-projects/${clerkUserId}/${projectId}/versions`;

        // 5. Update project with imagekitFolder
        await ctx.db.patch(projectId, {
            imagekitFolder,
        });

        // 6. Return Convex ID and folder path
        return {
            projectId, // Real Convex ID
            imagekitFolder,
            userId: user._id,
            clerkUserId,
        };
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        canvasState: v.optional(v.any()),

        // ImageKit data
        imgKitFileId: v.string(),
        imagekitUrl: v.string(),
        imagekitFolder: v.string(),
        fileName: v.string(),
        thumbnailUrl: v.string(),
        format: v.string(),
        mimeType: v.string(),

        // Image dimensions
        width: v.number(),
        height: v.number(),
        size: v.number(),
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
        const clerkUserId = user.tokenIdentifier.split('|')[1];

        // 4. Create project entry
        const projectId = await ctx.db.insert('projects', {
            title: args.title,
            description: args.description,
            userId: user._id,

            // Canvas state
            canvasState: args.canvasState,
            width: args.width,
            height: args.height,
            size: args.size,

            // Version tracking (will be updated after image creation)
            totalVersions: 1,
            maxVersions: 7,

            // Image URLs
            originalImageUrl: args.imagekitUrl,
            currentImageUrl: args.imagekitUrl,
            thumbnailUrl: args.thumbnailUrl,
            imgKitFileId: args.imgKitFileId,

            // Storage info
            totalStorageBytes: args.size,
            imagekitFolder: args.imagekitFolder || `/pixellift-projects/${clerkUserId}/${projectId}/versions`,

            // Optional fields
            deleteStatus: 'none',

            // Timestamps
            createdAt: now,
            updatedAt: now,
            lastEditedAt: now,
        });

        // 5. Create v0 image record
        const imageId = await ctx.db.insert('images', {
            // Relationships
            projectId: projectId,
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
            previewUrl: args.thumbnailUrl,

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

        // 6. Update project with imageId references
        await ctx.db.patch(projectId, {
            currentImageId: imageId,
            originalImageId: imageId,
        });

        // 7. Create version history entry
        await ctx.db.insert('versionHistory', {
            projectId: projectId,
            userId: user._id,
            action: 'created',
            fromVersion: undefined,
            toVersion: 0,
            imageId: imageId,
            operation: 'upload',
            timestamp: now,
        });

        // 8. Update user storage and project count
        await ctx.db.patch(user._id, {
            projectsUsed: user.projectsUsed + 1,
            totalStorageBytes: newTotalStorage,
            lastActiveAt: now,
        });

        // 9. Return project ID
        return projectId;
    },
});

export const createProjectWithVersion = mutation({
    args: {
        // Project metadata
        title: v.string(),
        description: v.optional(v.string()),
        projectId: v.id('projects'), // Real Convex ID from reserveProjectId

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

        // 2. Verify project exists and belongs to user
        const existingProject = await ctx.db.get(args.projectId);

        if (!existingProject) {
            throw new Error('Project not found');
        }

        if (existingProject.userId !== user._id) {
            throw new Error('Not authorized to update this project');
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
            projectId: args.projectId, // Real Convex ID
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

        // 5. Update project with complete data
        await ctx.db.patch(args.projectId, {
            // Project status (now active and visible in UI)
            status: 'active',

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

            // Timestamps
            updatedAt: now,
            lastEditedAt: now,
        });

        // 6. Create version history entry
        await ctx.db.insert('versionHistory', {
            projectId: args.projectId,
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

        // 7. Update user storage and project count
        await ctx.db.patch(user._id, {
            projectsUsed: user.projectsUsed + 1,
            totalStorageBytes: newTotalStorage,
            lastActiveAt: now,
        });

        // 8. Return complete project data
        return {
            projectId: args.projectId,
            imageId,
            version: 0,
            project: {
                _id: args.projectId,
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

        // Filter out pending projects (not yet fully created)
        return projects.filter(project => project.status === 'active');
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
