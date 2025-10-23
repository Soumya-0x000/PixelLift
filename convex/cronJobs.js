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
 * Weekly audit - finds and cleans up orphaned files
 */
export const auditOrphanedFiles = internalAction({
    handler: async ctx => {
        const failedProjects = await ctx.runMutation(
            internal.cronHelpers.projectQueries.getFailedProjectsFromTable
        );

        if (!failedProjects.length) {
            return { audited: 0, cleanedUp: 0, filesDeleted: 0 };
        }

        let cleanedUp = 0;
        let filesDeleted = 0;

        for (const project of failedProjects) {
            const result = await ctx.runAction(
                internal.cronHelpers.projectCleanup.auditSingleFailedProject,
                { project }
            );

            if (result.cleaned) cleanedUp++;
            if (result.deleted) filesDeleted++;
        }

        return { audited: failedProjects.length, cleanedUp, filesDeleted };
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
