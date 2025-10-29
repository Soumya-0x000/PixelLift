import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { api } from '@/convex/_generated/api';
import { useConvexMutation } from '@/hooks/useConvexQuery';
import { Canvas } from 'fabric';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const CanvasEditor = ({ project }) => {
    const [isLoading, setIsLoading] = useState(false);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const { canvasEditor, setCanvasEditor, activeTool, setActiveTool } = useCanvasContext();

    const { mutate: updateProject } = useConvexMutation(api.projects.updateProject);

    const calculateViewportScale = useCallback(() => {
        if (!canvasRef.current || !project) return;

        const container = containerRef.current;
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;

        const scaleX = containerWidth / project.width;
        const scaleY = containerWidth / project.width;

        return Math.min(scaleX, scaleY, 1);
    }, [canvasRef]);

    useEffect(() => {
        if (!canvasRef.current || !project || canvasEditor) return;

        const initializeCanvas = async () => {
            setIsLoading(true);

            const viewportScale = calculateViewportScale();

            const canvas = new Canvas(canvasRef.current, {
                width: project.width,
                height: project.height,
                backgroundColor: '#ffffff',
                preserveObjectStacking: true,
                controlsAboveOverlay: true,
                selection: true,
                hoverCursor: 'move',
                mouseCursor: 'move',
                defaultCursor: 'default',
                allowTouchScrolling: false,
                renderOnAddRemove: true,
                skipTargetFind: false,
                
            });
        };
    }, [canvasRef, calculateViewportScale]);

    return (
        <div ref={containerRef}>
            <div className="p-4">
                <canvas id="canvas" className="border" ref={canvasRef} />
            </div>
        </div>
    );
};

export default CanvasEditor;
