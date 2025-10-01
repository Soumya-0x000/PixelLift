'use client';

import { api } from '@/convex/_generated/api';
import React from 'react';
import { useConvexQuery } from '@/hooks/useConvexQuery';

const Dashboard = () => {
    const { data: projectData, loading } = useConvexQuery(api.projects.getUserProjects);

    console.log(projectData, loading);
    return <div>Dashboard</div>;
};

export default Dashboard;
