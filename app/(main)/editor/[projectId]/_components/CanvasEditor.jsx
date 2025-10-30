import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { api } from '@/convex/_generated/api';
import { useConvexMutation } from '@/hooks/useConvexQuery';
import { Canvas, FabricImage } from 'fabric';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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

    const initializeCanvas = useCallback(async () => {
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

        canvas.setDimensions(
            {
                width: project.width * viewportScale,
                height: project.height * viewportScale,
            },
            { backstoreOnly: true }
        );

        canvas.setZoom(viewportScale);

        const scaleFactor = window.devicePixelRatio || 1;
        if (scaleFactor > 1) {
            canvas.getElement().width = project.width * scaleFactor;
            canvas.getElement().height = project.height * scaleFactor;
            canvas.getContext().scale(scaleFactor, scaleFactor);
        }

        if (project?.currentImageUrl || project?.originalImageUrl) {
            try {
                const imageUrl = project?.currentImageUrl || project?.originalImageUrl;

                const fabricImage = await FabricImage.fromURL(imageUrl, {
                    crossOrigin: 'anonymous',
                });

                const imgAspectRatio = fabricImage.width / fabricImage.height;
                const canvasAspectRatio = project.width / project.height;

                let scaleX, scaleY;
                if (imgAspectRatio >= canvasAspectRatio) {
                    scaleX = project.width / fabricImage.width;
                    scaleY = scaleX;
                } else {
                    scaleY = project.height / fabricImage.height;
                    scaleX = scaleY;
                }

                fabricImage.set({
                    width: project.width / 2,
                    height: project.height / 2,
                    originX: 'center',
                    originY: 'center',
                    scaleX,
                    scaleY,
                    selectable: true,
                    evented: true,
                    hoverCursor: 'default',
                });

                canvas.add(fabricImage);
                canvas.centerObject(fabricImage);
            } catch (error) {
                console.error('Error loading image onto canvas:', error);
                toast.error('Failed to load image onto canvas.');
            }
        }

        if (project?.canvasState) {
            try {
                await canvas.loadFromJSON(project.canvasState);
                canvas.requestRenderAll();
            } catch (error) {
                console.error('Error loading canvas state:', error);
                toast.error('Failed to load canvas state.');
            }
        }

        canvas.calcOffset();
        canvas.requestRenderAll();
        setCanvasEditor(canvas);
        setIsLoading(false);
    }, [project, calculateViewportScale]);

    useEffect(() => {
        if (!canvasRef.current || !project || canvasEditor) return;

        initializeCanvas();

        return () => {
            if (canvasEditor) {
                canvasEditor.dispose();
                setCanvasEditor(null);
            }
        };
    }, [project, canvasRef, initializeCanvas]);

    return (
        <div ref={containerRef}>
            <div className="p-4">
                <canvas id="canvas" className="border" ref={canvasRef} />
            </div>
        </div>
    );
};

export default CanvasEditor;
