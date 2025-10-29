import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { api } from '@/convex/_generated/api';
import { useConvexMutation } from '@/hooks/useConvexQuery';
import React, { useEffect, useRef, useState } from 'react';

const CanvasEditor = ({ project }) => {
    const [isLoading, setIsLoading] = useState(false);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const { canvasEditor, setCanvasEditor, activeTool, setActiveTool } = useCanvasContext();

    const { mutate: updateProject } = useConvexMutation(api.projects.updateProject);

    useEffect(() => {
        if (!canvasRef.current || !project || canvasEditor) return;
    }, [canvasRef]);

    return (
        <div ref={containerRef}>
            <div className="p-4">
                <canvas id="canvas" className="border" ref={canvasRef} />
            </div>
        </div>
    );
};

export default CanvasEditor;
