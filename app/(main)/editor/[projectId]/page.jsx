'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback, memo } from 'react';
import CanvasContext from '@/context/canvasContext/CanvasContext';
import GotoDesktopWarning from '@/components/GotoDesktopWarning';
import { api } from '@/convex/_generated/api';
import { MoonLoader } from 'react-spinners';
import { motion, AnimatePresence } from 'motion/react';
import { useConvex } from 'convex/react';
import { Loader } from 'lucide-react';

const Editor = memo(() => {
    const { projectId } = useParams();
    const convex = useConvex();

    const [canvasEditor, setCanvasEditor] = useState(null);
    const [processingMessage, setProcessingMessage] = useState('');
    const [activeTool, setActiveTool] = useState('resize');

    const [isLoading, setIsLoading] = useState(true);
    const [projectData, setProjectData] = useState(null);
    const [error, setError] = useState(null);

    const fetchProject = useCallback(async () => {
        if (!projectId) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await convex.query(api.projects.getProjectById, { projectId });
            if (!data) throw new Error('Project not found.');
            setProjectData(data);
        } catch (err) {
            console.error('Error fetching project:', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [convex, projectId]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    const contextData = {
        canvasEditor,
        setCanvasEditor,
        processingMessage,
        setProcessingMessage,
        activeTool,
        setActiveTool,
    };

    const showLoader = isLoading;
    const showError = !isLoading && (error || !projectData);
    const showEditor = !isLoading && projectData && !error;

    return (
        <CanvasContext.Provider value={contextData}>
            {/* Loader */}
            {showLoader && (
                <div className="w-full h-screen flex items-center justify-center fixed top-0 left-0 z-50 bg-white/5 backdrop-blur-md">
                    <MoonLoader color="#77c2e7" size={80} speedMultiplier={0.9} />
                </div>
            )}

            {/* Error Message */}
            {showError && (
                <AnimatePresence>
                    <motion.div
                        key="error-message"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-white/10 backdrop-blur-md z-50 text-red-500 font-semibold text-lg text-center"
                    >
                        Error: {error?.message || 'Project not found.'}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Main Editor Section */}
            {showEditor && (
                <div className="hidden preXl:block min-h-screen">
                    <div className="">
                        {processingMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ damping: 15, stiffness: 200 }}
                                className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-md z-50 shadow-md flex flex-col items-center gap-2"
                            >
                                <div>
                                    <Loader className="inline-block mr-2 animate-spin" size={18} />
                                    {processingMessage}
                                </div>
                                <span className='text-sm'>
                                    Please wait! Do not close or navigate away from this page.
                                </span>
                            </motion.div>
                        )}

                        <div>
                            {/* topbar */}
                            <div>
                                {/* sidebar */}
                                <div>{/* canvas */}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <GotoDesktopWarning />
        </CanvasContext.Provider>
    );
});

Editor.displayName = 'Editor';
export default Editor;
