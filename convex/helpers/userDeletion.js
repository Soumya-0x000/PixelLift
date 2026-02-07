import { internalAction, internalMutation, internalQuery } from '../_generated/server';
import { internal } from '../_generated/api';
import { v } from 'convex/values';

/**
 * Query to get all user-related data
 */
export const getUserRelatedData = internalQuery({
    args: { userId: v.id('users') },
    handler: async (ctx, { userId }) => {
        // Fetch all related data in parallel
        const [images, promptedImages, projects, versionHistory] = await Promise.all([
            ctx.db
                .query('images')
                .withIndex('by_user', q => q.eq('userId', userId))
                .collect(),
            ctx.db
                .query('promptedImages')
                .withIndex('by_user', q => q.eq('userId', userId))
                .collect(),
            ctx.db
                .query('projects')
                .withIndex('by_user', q => q.eq('userId', userId))
                .collect(),
            ctx.db
                .query('versionHistory')
                .withIndex('by_user', q => q.eq('userId', userId))
                .collect(),
        ]);

        return {
            images,
            promptedImages,
            projects,
            versionHistory,
        };
    },
});

/**
 * Query to get user by ID
 */
export const getUserById = internalQuery({
    args: { userId: v.id('users') },
    handler: async (ctx, { userId }) => {
        return await ctx.db.get(userId);
    },
});

/**
 * Mutation to mark user for deletion
 */
export const markUserForDeletion = internalMutation({
    args: { userId: v.id('users') },
    handler: async (ctx, { userId }) => {
        await ctx.db.patch(userId, {
            deleting: true,
            deleteRequestedAt: Date.now(),
        });
    },
});

/**
 * Mutation to delete all user-related records from database
 */
export const deleteUserRecords = internalMutation({
    args: { userId: v.id('users') },
    handler: async (ctx, { userId }) => {
        const tables = ['images', 'projects', 'versionHistory', 'promptedImages'];

        for (const table of tables) {
            const records = await ctx.db
                .query(table)
                .withIndex('by_user', q => q.eq('userId', userId))
                .collect();

            console.log(`🗑️ Deleting ${records.length} records from ${table}`);

            for (const record of records) {
                await ctx.db.delete(record._id);
            }
        }

        // Finally, delete the user
        await ctx.db.delete(userId);
        console.log(`✅ User ${userId} deleted from database`);
    },
});

/**
 * Action to delete all user images from ImageKit
 * This includes both regular images and prompted images
 */
export const deleteUserImagesFromImageKit = internalAction({
    args: { userId: v.id('users') },
    handler: async (ctx, { userId }) => {
        // Get all user-related data
        const data = await ctx.runQuery(internal.helpers.userDeletion.getUserRelatedData, {
            userId,
        });

        const { images, promptedImages } = data;

        console.log(`🗑️ Deleting ${images.length} images and ${promptedImages.length} prompted images from ImageKit`);

        const deletionResults = {
            images: { success: 0, failed: 0 },
            promptedImages: { success: 0, failed: 0 },
        };

        // Delete regular images from ImageKit
        for (const image of images) {
            if (!image?.imagekitFileId) {
                console.warn(`⚠️ Image ${image._id} has no imagekitFileId`);
                continue;
            }

            try {
                await ctx.runAction(internal.cronHelpers.imageKit.deleteFile, {
                    fileId: image.imagekitFileId,
                });
                deletionResults.images.success++;
                console.log(`✅ Deleted image ${image.imagekitFileId} from ImageKit`);
            } catch (error) {
                deletionResults.images.failed++;
                console.error(`❌ Failed to delete image ${image.imagekitFileId}:`, error);
            }
        }

        // Delete prompted images from ImageKit
        for (const promptedImage of promptedImages) {
            if (!promptedImage?.imagekitFileId) {
                console.warn(`⚠️ Prompted image ${promptedImage._id} has no imagekitFileId`);
                continue;
            }

            try {
                await ctx.runAction(internal.cronHelpers.imageKit.deleteFile, {
                    fileId: promptedImage.imagekitFileId,
                });
                deletionResults.promptedImages.success++;
                console.log(`✅ Deleted prompted image ${promptedImage.imagekitFileId} from ImageKit`);
            } catch (error) {
                deletionResults.promptedImages.failed++;
                console.error(`❌ Failed to delete prompted image ${promptedImage.imagekitFileId}:`, error);
            }
        }

        console.log(`📊 ImageKit deletion results:`, deletionResults);
        return deletionResults;
    },
});
