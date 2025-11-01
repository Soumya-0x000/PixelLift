import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { api } from '@/convex/_generated/api';
import { useConvexMutation } from '@/hooks/useConvexQuery';
import { Canvas, FabricImage } from 'fabric';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RingLoader } from 'react-spinners';
import { toast } from 'sonner';

const CanvasEditor = ({ project }) => {
    const [isLoading, setIsLoading] = useState(false);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const isInitializedRef = useRef(false); // ✅ Add this to track initialization
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
    }, [project]); // ✅ Fixed dependency

    const initializeCanvas = useCallback(async () => {
        // ✅ Prevent double initialization
        if (isInitializedRef.current) return;

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
        isInitializedRef.current = true; // ✅ Mark as initialized
        setIsLoading(false);
    }, [project, calculateViewportScale, setCanvasEditor]);

    useEffect(() => {
        if (!canvasRef.current || !project || canvasEditor) return;

        initializeCanvas();

        return () => {
            if (canvasEditor) {
                canvasEditor.dispose();
                setCanvasEditor(null);
                isInitializedRef.current = false; // ✅ Reset on cleanup
            }
        };
    }, [project, canvasEditor, initializeCanvas, setCanvasEditor]);

    return (
        <div
            ref={containerRef}
            className="relative flex items-center justify-center bg-secondary w-full h-full overflow-hidden"
        >
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(45deg, #64748b 25%, transparent 25%),
                        linear-gradient(-45deg, #64748b 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #64748b 75%),
                        linear-gradient(-45deg, transparent 75%, #64748b 75%)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                }}
            />

            {!isLoading && (
                <div className=" absolute inset-0 flex items-center justify-center bg-slate-800/80 z-10">
                    <div className="flex flex-col items-center justify-center">
                        <RingLoader color="#77c2e7" size={80} />
                        <p>Loading your canvas...</p>
                    </div>
                </div>
            )}

            <div className="p-4">
                <canvas id="canvas" className="border" ref={canvasRef} />
            </div>
        </div>
    );
};

export default CanvasEditor;
