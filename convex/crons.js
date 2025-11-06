import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// Every 10 minutes - clean up pending deletions
crons.interval(
    'cleanup pending deletions',
    { minutes: 10 },
    internal.cronJobs.cleanupPendingProjects
);

// Every 24 hours - remove old failed projects
crons.interval(
    'cleanup old failed projects',
    { hours: 24 },
    internal.cronJobs.cleanupOldFailedProjects
);

// Every 7 days - audit for orphaned files
crons.interval('audit orphaned files', { hours: 24 }, internal.cronJobs.auditOrphanedFiles);

export default crons;
