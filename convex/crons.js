import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval(
    'cleanup pending deletions',
    { minutes: 1 },
    internal.cronJobs.cleanupPendingProjects
);

crons.interval(
    'cleanup failed projects',
    { hours: 24 },
    internal.cronJobs.cleanupOldFailedProjects
);

crons.interval('reset monthly usage', { hours: 15 * 24 }, internal.cronJobs.auditOrphanedFiles);

export default crons;
