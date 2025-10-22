import { internalAction } from '../_generated/server';
import { internal } from '../_generated/api';
import { v } from 'convex/values';

const MAX_RETRIES = 3;

/**
 * Clean up a single pending project
 */
export const cleanupSingleProject = internalAction({
    args: { project: v.any() },
    handler: async (ctx, { project }) => {
        try {
            const retryCount = project.retryCount ?? 0;

            // Step 1: Check if file exists
            const { exists } = await ctx.runAction(internal.cronHelpers.imageKit.checkFileExists, {
                fileId: project.imgKitFileId,
            });

            console.log(`File ${project.imgKitFileId} exists: ${exists}`);

            // Step 2: If file doesn't exist, just clean up DB
            if (exists === false) {
                await ctx.runMutation(internal.cronHelpers.projectMutations.deleteProjectRecord, {
                    projectId: project._id,
                });
                console.log(`✅ Cleaned up orphaned DB record for ${project._id}`);
                return { success: true, reason: 'file_not_found' };
            }

            // Step 3: Try to delete the file
            const { success: deleted, status } = await ctx.runAction(
                internal.cronHelpers.imageKit.deleteFile,
                { fileId: project.imgKitFileId }
            );

            console.log(`ImageKit deletion for ${project._id}: ${deleted}, status: ${status}`);

            // Step 4: Handle result
            if (deleted || status === 204 || status === 404) {
                // Success or already deleted
                await ctx.runMutation(internal.cronHelpers.projectMutations.deleteProjectRecord, {
                    projectId: project._id,
                });
                console.log(`✅ Successfully deleted ${project._id}`);
                return { success: true, reason: 'deleted' };
            }

            // Step 5: Deletion failed - handle retry logic
            const newRetryCount = retryCount + 1;

            if (newRetryCount >= MAX_RETRIES) {
                // Max retries reached
                await ctx.runMutation(internal.cronHelpers.projectMutations.markProjectFailed, {
                    projectId: project._id,
                });
                console.log(`❌ Max retries reached for ${project._id}`);
                return { success: false, reason: 'max_retries' };
            }

            // Increment retry count
            await ctx.runMutation(internal.cronHelpers.projectMutations.updateRetryCount, {
                projectId: project._id,
                retryCount: newRetryCount,
            });
            console.log(`🔄 Retry ${newRetryCount}/${MAX_RETRIES} for ${project._id}`);
            return { success: false, reason: 'retry_scheduled' };
        } catch (error) {
            console.error(`Failed to cleanup ${project._id}:`, error);
            return { success: false, reason: 'error', error: error.message };
        }
    },
});

/**
 * Audit a single failed project - check if file exists and clean up
 */
export const auditSingleFailedProject = internalAction({
    args: { project: v.any() },
    handler: async (ctx, { project }) => {
        try {
            // Check if file still exists
            const { exists } = await ctx.runAction(internal.cronHelpers.imageKit.checkFileExists, {
                fileId: project.imgKitFileId,
            });

            if (exists === false) {
                // File doesn't exist - remove from failedProjects
                await ctx.runMutation(
                    internal.cronHelpers.projectMutations.deleteFailedProjectRecord,
                    { projectId: project._id }
                );
                console.log(`✅ Cleaned up false-positive ${project._id}`);
                return { cleaned: true, deleted: false };
            }

            if (exists === true) {
                // File exists - try to delete it
                const { success } = await ctx.runAction(internal.cronHelpers.imageKit.deleteFile, {
                    fileId: project.imgKitFileId,
                });

                if (success) {
                    await ctx.runMutation(
                        internal.cronHelpers.projectMutations.deleteFailedProjectRecord,
                        { projectId: project._id }
                    );
                    console.log(`🗑️ Deleted file and cleaned up ${project._id}`);
                    return { cleaned: true, deleted: true };
                }
            }

            return { cleaned: false, deleted: false };
        } catch (error) {
            console.error(`Error auditing ${project._id}:`, error);
            return { cleaned: false, deleted: false, error: error.message };
        }
    },
});
