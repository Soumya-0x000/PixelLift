'use client';

import { api } from '@/convex/_generated/api';
import React, { useState } from 'react';
import { useConvexQuery } from '@/hooks/useConvexQuery';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { Button } from '@/components/ui/button';
import { MoonLoader } from 'react-spinners';
import { Sparkles } from 'lucide-react';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { motion } from 'motion/react';
import NewProjectModal from './_components/newProjectModal';

const Dashboard = () => {
    const { data: projectData, loading } = useConvexQuery(api.projects.getUserProjects);
    const {
        hasAccess,
        getRestrictedTools,
        subscriptionData,
        plan,
        planAccess,
        checkLimit,
        isApprenticeUser,
        isMasterUser,
        isDeityUser,
    } = usePlanAccess();
    const [isModalOpen, setIsModalOpen] = useState({
        projectCreate: false,
    });

    return (
        <div className="pt-24 px-4 pb-4 flex flex-col gap-4 h-screen overflow-hidden">
            <div className="flex justify-between items-center ring-1 ring-slate-700/50 rounded-md px-2 py-1.5">
                <div className="flex flex-col">
                    <span className="text-slate-100 font-thin tracking-wide text-[1.1rem]">
                        Your Projects
                    </span>
                    <span className="block text-slate-400 text-[0.7rem]">
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

            <div className=" flex grow ring-1 ring-slate-700/50 rounded-md p-2 relative overflow-auto">
                {loading ? (
                    <div className=" m-auto">
                        <MoonLoader color="#77c2e7" size={80} speedMultiplier={0.9} />
                    </div>
                ) : (
                    <>
                        {projectData?.length < 1 ? (
                            <div className=" w-fit h-fit flex flex-col items-center justify-center ring-1 p-10 m-auto bg-slate-700/10 ring-slate-700/50 rounded-md">
                                <span>No projects found. Create a new project to get started!</span>
                                <span className="mt-1 mb-6 text-[0.85rem] text-slate-500">
                                    Upload an image to start editing with our AI tool.
                                </span>
                                <Button
                                    variant="outline"
                                    className=" text-slate-500"
                                    onClick={() =>
                                        setIsModalOpen({ ...isModalOpen, projectCreate: true })
                                    }
                                >
                                    <AnimatedGradientText className={`flex items-center`}>
                                        No projects yet. Create one!{' '}
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
                        ) : (
                            <div></div>
                        )}
                    </>
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
