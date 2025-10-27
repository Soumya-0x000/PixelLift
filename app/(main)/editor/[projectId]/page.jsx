'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback, memo } from 'react';
import CanvasContext from '@/context/canvasContext/CanvasContext';
import GotoDesktopWarning from '@/components/GotoDesktopWarning';
import { useConvexQuery } from '@/hooks/useConvexQuery';
import { api } from '@/convex/_generated/api';
import { MoonLoader } from 'react-spinners';

const Editor = memo(() => {
    const { projectId } = useParams();
    const [canvasEditor, setCanvasEditor] = useState(null);
    const [processingMessage, setProcessingMessage] = useState('');
    const [activeTool, setActiveTool] = useState('resize');
    const {
        data: projectData,
        isLoading,
        error,
    } = useConvexQuery(api.projects.getProject, { projectId });
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
            {isLoading && <MoonLoader color="#77c2e7" size={80} speedMultiplier={0.9} />}
            {error && <div>Error: {error.message}</div>}
            <div>Editor: {projectId}</div>

            <GotoDesktopWarning />
        </CanvasContext.Provider>
    );
});

Editor.displayName = 'Editor';

export default Editor;
