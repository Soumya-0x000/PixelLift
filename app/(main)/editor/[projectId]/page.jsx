'use client';

import { CanvasProvider } from '@/context/canvasContext/CanvasContext';
import { useParams } from 'next/navigation';
import React from 'react';

const Editor = () => {
    const { projectId } = useParams();
    return <CanvasProvider>Editor: {projectId}</CanvasProvider>;
};

export default Editor;
