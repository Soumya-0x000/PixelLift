'use client';

import { api } from '@/convex/_generated/api';
import React from 'react';
import { useConvexQuery } from '@/hooks/useConvexQuery';
import { usePlanAccess } from '@/hooks/usePlanAccess';

const Dashboard = () => {
    const { data: projectData, loading } = useConvexQuery(api.projects.getUserProjects);

    console.log(projectData, loading, usePlanAccess());
    return <div>Dashboard</div>;
};

export default Dashboard;
