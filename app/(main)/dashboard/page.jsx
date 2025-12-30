'use client';

import { api } from '@/convex/_generated/api';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useConvexQuery } from '@/hooks/useConvexQuery';
import { Button } from '@/components/ui/button';
import { MoonLoader } from 'react-spinners';
import { Sparkles } from 'lucide-react';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { motion } from 'motion/react';
import ProjectGrid from './_components/projectGrid';
import NewProjectModal from './_components/newProjectModal';

const Dashboard = () => {
    const { data: projectData, loading } = useConvexQuery(api.projects.getUserProjects);
    const [isModalOpen, setIsModalOpen] = useState({ projectCreate: false });
    const [projectCreateBtnText, setProjectCreateBtnText] = useState('New Project');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setProjectCreateBtnText(
                window.innerWidth > 640 ? 'No projects yet. Create one!' : 'New Project'
            );
        };

        handleResize(); // run once on load
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useLayoutEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="pt-24 px-4 pb-4 flex flex-col gap-4 h-screen overflow-hidden">
            <div className="flex justify-between items-center ring-1 ring-slate-700/50 rounded-md px-2 py-1.5 w-full gap-3">
                <div className="flex flex-col w-full">
                    <span className="text-slate-100 font-thin tracking-wide text-[1.1rem] line-clamp-1">
                        Your Projects
                    </span>
                    <span className=" text-slate-400 text-[0.7rem] line-clamp-1 w-full">
                        Create and manage your AI-powered image projects
                    </span>
                </div>

                <Button
                    variant="outline"
                    className={`text-slate-300`}
                    onClick={() => setIsModalOpen({ ...isModalOpen, projectCreate: true })}
                >
                    New Project
                </Button>
            </div>

            <div className=" flex grow ring-1 ring-slate-700/50 rounded-md p-3 relative overflow-auto">
                {loading ? (
                    <div className=" m-auto">
                        <MoonLoader color="#77c2e7" size={80} speedMultiplier={0.9} />
                    </div>
                ) : projectData && projectData?.length > 0 ? (
                    <ProjectGrid projects={projectData} />
                ) : (
                    <div className=" w-fit h-fit flex flex-col items-center justify-center ring-1 p-4 xs:p-6 sm:p-10 m-auto bg-slate-700/10 ring-slate-700/50 rounded-md">
                        <span className=" text-sm sm:text-base text-center">
                            No projects found. Create a new project to get started!
                        </span>
                        <span className="mt-3 mb-6 text-xs sm:text-[0.85rem] text-slate-500 text-center">
                            Upload an image to start editing with our AI tool.
                        </span>
                        <Button
                            variant="outline"
                            className=" text-slate-500"
                            onClick={() => setIsModalOpen({ ...isModalOpen, projectCreate: true })}
                        >
                            <AnimatedGradientText
                                className={`flex items-center text-xs sm:text-sm`}
                            >
                                {`${projectCreateBtnText} ${' '}`}
                                <motion.div
                                    animate={{
                                        color: ['#ffaa40', '#9c40ff', '#ff0080', '#ffaa40'],
                                    }}
                                    transition={{
                                        duration: 6,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                >
                                    <Sparkles className="ml-2" />
                                </motion.div>
                            </AnimatedGradientText>
                        </Button>
                    </div>
                )}
            </div>

            <NewProjectModal
                isOpen={isModalOpen.projectCreate}
                onClose={() => setIsModalOpen({ ...isModalOpen, projectCreate: false })}
            />
        </div>
    );
};

export default Dashboard;
