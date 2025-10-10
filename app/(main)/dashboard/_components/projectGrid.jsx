import React from 'react';
import ProjectCard from './ProjectCard';
import { useRouter } from 'next/navigation';

const ProjectGrid = ({ projects }) => {
    const router = useRouter();

    const handleEditProject = projectId => {
        router.push(`/editor/${projectId}`);
    };

    return (
        <div className="flex flex-wrap gap-4 overflow-auto w-full">
            {projects.map(project => (
                <ProjectCard
                    key={project?._id}
                    project={project}
                    onEditProject={() => handleEditProject(project?._id)}
                />
            ))}
        </div>
    );
};

export default ProjectGrid;
