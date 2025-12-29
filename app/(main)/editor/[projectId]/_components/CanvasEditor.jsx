import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { api } from '@/convex/_generated/api';
import { useConvexMutation } from '@/hooks/useConvexQuery';
import { Canvas, FabricImage } from 'fabric';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RingLoader } from 'react-spinners';
import { toast } from 'sonner';

const CanvasEditor = () => {
    const [isLoading, setIsLoading] = useState(false);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const { canvasEditor, setCanvasEditor, activeTool, currentProject: project } = useCanvasContext();

    const { mutate: updateProject } = useConvexMutation(api.projects.updateProject);

    const calculateViewportScale = useCallback(() => {
        if (!canvasRef.current || !project) return 1;

        const container = containerRef.current;
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;

        const scaleX = containerWidth / project.width;
        const scaleY = containerHeight / project.height;

        return Math.min(scaleX, scaleY, 1);
    }, [project]);

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
            { backstoreOnly: false }
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
                    left: project.width / 2,
                    top: project.height / 2,
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
                console.log(project.canvasState);
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

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 500);

        setIsLoading(false);
    }, [calculateViewportScale, project, setCanvasEditor]);

    useEffect(() => {
        if (!canvasRef.current || !project || canvasEditor) return;

        initializeCanvas();

        return () => {
            if (canvasEditor) {
                canvasEditor.dispose();
                setCanvasEditor(null);
            }
        };
    }, [project, initializeCanvas]);

    useEffect(() => {
        const handleResize = () => {
            if (!canvasEditor || !project) return;

            const newScale = calculateViewportScale();

            canvasEditor.setDimensions(
                {
                    width: project.width * newScale,
                    height: project.height * newScale,
                },
                { backstoreOnly: false }
            );

            canvasEditor.setZoom(newScale);
            canvasEditor.calcOffset();
            canvasEditor.requestRenderAll();
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [canvasEditor, project]);

    const saveCanvasState = useCallback(async () => {
        if (!canvasEditor || !project) return;

        try {
            const canvasJSON = canvasEditor.toJSON();
            await updateProject({
                projectId: project._id,
                canvasState: canvasJSON,
            });
        } catch (error) {
            console.error('Error saving canvas state:', error);
            toast.error('Failed to save canvas state.');
        }
    }, [canvasEditor, project]);

    useEffect(() => {
        if (!canvasEditor) return;

        let timeOut;
        const handleCanvasChange = () => {
            clearTimeout(timeOut);
            timeOut = setTimeout(() => {
                saveCanvasState();
            }, 3000);
        };

        canvasEditor.on('object:modified', handleCanvasChange);
        canvasEditor.on('object:added', handleCanvasChange);
        canvasEditor.on('object:removed', handleCanvasChange);

        return () => {
            clearTimeout(timeOut);
            canvasEditor.off('object:modified', handleCanvasChange);
            canvasEditor.off('object:added', handleCanvasChange);
            canvasEditor.off('object:removed', handleCanvasChange);
        };
    }, [canvasEditor]);

    useEffect(() => {
        if (!canvasEditor) return;

        switch (activeTool) {
            case 'crop':
                canvasEditor.defaultCursor = 'crosshair';
                canvasEditor.hoverCursor = 'crosshair';
                break;
            default:
                canvasEditor.defaultCursor = 'default';
                canvasEditor.hoverCursor = 'move';
        }
    }, [canvasEditor, activeTool]);

    return (
        <div ref={containerRef} className="relative flex items-center justify-center bg-secondary w-full h-full overflow-hidden">
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

            {isLoading && (
                <div className=" absolute top-0 left-0 w-full h-full inset-0 flex items-center justify-center bg-slate-800/80 z-10">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <RingLoader color="#77c2e7" size={100} />
                        <p>Preparing your canvas...</p>
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
