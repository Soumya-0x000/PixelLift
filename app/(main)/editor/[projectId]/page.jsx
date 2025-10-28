'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback, memo } from 'react';
import CanvasContext from '@/context/canvasContext/CanvasContext';
import GotoDesktopWarning from '@/components/GotoDesktopWarning';
import { useConvexQuery } from '@/hooks/useConvexQuery';
import { api } from '@/convex/_generated/api';
import { MoonLoader } from 'react-spinners';
import { motion, AnimatePresence } from 'motion/react';

const Editor = memo(() => {
    const { projectId } = useParams();
    const [canvasEditor, setCanvasEditor] = useState(null);
    const [processingMessage, setProcessingMessage] = useState('');
    const [activeTool, setActiveTool] = useState('resize');
    const {
        data: projectData,
        isLoading,
        error,
    } = useConvexQuery(api.projects.getProjectById, { projectId });
    console.log(projectData);
    const contextData = {
        canvasEditor,
        setCanvasEditor,
        processingMessage,
        setProcessingMessage,
        activeTool,
        setActiveTool,
    };

    return (
        <CanvasContext.Provider value={contextData}>
            <div className=" w-full h-screen flex items-center justify-center">
                {isLoading && <MoonLoader color="#77c2e7" size={80} speedMultiplier={0.9} />}
                {!(error || !projectData) && (
                    <AnimatePresence>
                        <motion.div
                            key="error-message"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="mt-2 text-red-500 font-medium text-md"
                        >
                            Error: {error?.message || 'Project not found.'}
                        </motion.div>
                    </AnimatePresence>
                )}{' '}
            </div>
            <div>Editor: {projectId}</div>
            <GotoDesktopWarning />
        </CanvasContext.Provider>
    );
});

Editor.displayName = 'Editor';

export default Editor;
