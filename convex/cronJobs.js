import { internalAction } from './_generated/server';
import { internal } from './_generated/api';

/**
 * Main cleanup job - runs every 10 minutes
 * Processes pending deletions and moves failed projects
 */
export const cleanupPendingProjects = internalAction({
    handler: async ctx => {
        const [pendingProjects, failedProjects] = await Promise.all([
            ctx.runMutation(internal.cronHelpers.projectQueries.getPendingProjects),
            ctx.runMutation(internal.cronHelpers.projectQueries.getFailedProjects),
        ]);

        // Move already-failed projects to archive table
        if (failedProjects.length > 0) {
            await Promise.all(
                failedProjects.map(project =>
                    ctx.runMutation(internal.cronHelpers.projectMutations.moveToFailedProjects, {
                        projectId: project._id,
                    })
                )
            );
        }

        if (!pendingProjects.length) {
            return { success: true, processed: 0, succeeded: 0, failed: 0 };
        }

        // Process each pending project
        const results = await Promise.allSettled(
            pendingProjects.map(project =>
                ctx.runAction(internal.cronHelpers.projectCleanup.cleanupSingleProject, {
                    project,
                })
            )
        );

        // Count successes and failures
        const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.length - succeeded;

        return {
            success: true,
            processed: pendingProjects.length,
            succeeded,
            failed,
        };
    },
});

/**
 * Comprehensive audit - finds and cleans up all orphaned files
 * Handles both active projects and failed projects
 */
export const auditOrphanedFiles = internalAction({
    handler: async ctx => {
        // Get active projects (deleteStatus is undefined/null)
        const activeProjects = await ctx.runMutation(
            internal.cronHelpers.projectQueries.getActiveProjects
        );

        // Get failed projects from archive
        const failedProjects = await ctx.runMutation(
            internal.cronHelpers.projectQueries.getFailedProjectsFromTable
        );

        let dbOrphans = 0; // DB record but no ImageKit file
        let filesDeleted = 0; // ImageKit file deleted

        // Audit active projects
        for (const project of activeProjects) {
            const { exists } = await ctx.runAction(
                internal.cronHelpers.imageKit.checkFileExists,
                { fileId: project.imgKitFileId }
            );

            if (exists === false) {
                // ImageKit file gone - clean up DB
                await ctx.runMutation(
                    internal.cronHelpers.projectMutations.deleteProjectRecord,
                    { projectId: project._id }
                );
                dbOrphans++;
                console.log(`🗑️ Cleaned up active project (no ImageKit file): ${project._id}`);
            }
        }

        // Audit failed projects
        for (const project of failedProjects) {
            const { exists } = await ctx.runAction(
                internal.cronHelpers.imageKit.checkFileExists,
                { fileId: project.imgKitFileId }
            );

            if (exists === false) {
                // ImageKit file already gone - safe to remove from DB
                await ctx.runMutation(
                    internal.cronHelpers.projectMutations.deleteFailedProjectRecord,
                    { projectId: project._id }
                );
                dbOrphans++;
                console.log(`🗑️ Cleaned up failed project (no ImageKit file): ${project._id}`);
            } else if (exists === true) {
                // ImageKit file still exists - delete it
                const { success } = await ctx.runAction(
                    internal.cronHelpers.imageKit.deleteFile,
                    { fileId: project.imgKitFileId }
                );

                if (success) {
                    await ctx.runMutation(
                        internal.cronHelpers.projectMutations.deleteFailedProjectRecord,
                        { projectId: project._id }
                    );
                    filesDeleted++;
                    console.log(`🗑️ Deleted ImageKit file & cleaned failed project: ${project._id}`);
                }
            }
        }

        return {
            audited: activeProjects.length + failedProjects.length,
            dbOrphans,
            filesDeleted,
            totalCleaned: dbOrphans + filesDeleted,
        };
    },
});

/**
 * Daily cleanup - removes old failed projects (60+ days)
 */
export const cleanupOldFailedProjects = internalAction({
    handler: async ctx => {
        const deleted = await ctx.runMutation(
            internal.cronHelpers.projectMutations.deleteOldFailedProjects
        );
        return { deleted };
    },
});
