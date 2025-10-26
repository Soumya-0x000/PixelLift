'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback, memo } from 'react';
import CanvasContext from '@/context/canvasContext/CanvasContext';
import GotoDesktopWarning from '@/components/GotoDesktopWarning';

const Editor = memo(() => {
    const { projectId } = useParams();
    const [canvasEditor, setCanvasEditor] = useState(null);
    const [processingMessage, setProcessingMessage] = useState('');
    const [activeTool, setActiveTool] = useState('resize');

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
            <div>Editor: {projectId}</div>

            <GotoDesktopWarning />
        </CanvasContext.Provider>
    );
});

Editor.displayName = 'Editor';

export default Editor;
