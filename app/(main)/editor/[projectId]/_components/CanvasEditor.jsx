import { Input } from '@/components/ui/input';
import {
    ColorPicker,
    ColorPickerAlpha,
    ColorPickerEyeDropper,
    ColorPickerFormat,
    ColorPickerHue,
    ColorPickerOutput,
    ColorPickerSelection,
} from '@/components/ui/shadcn-io/color-picker';
import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { api } from '@/convex/_generated/api';
import { useConvexMutation } from '@/hooks/useConvexQuery';
import { Canvas, FabricImage } from 'fabric';
import React, { use, useCallback, useEffect, useRef, useState } from 'react';
import { RingLoader } from 'react-spinners';
import { toast } from 'sonner';

const CanvasEditor = ({ project }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [canvasBgColor, setCanvasBgColor] = useState('#ffffff');
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const { canvasEditor, setCanvasEditor, activeTool, onToolChange } = useCanvasContext();

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
            backgroundColor: canvasBgColor,
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
    }, [calculateViewportScale, project, setCanvasEditor, canvasBgColor]);

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

    useEffect(() => {
        if (!canvasEditor) return;

        if (typeof canvasEditor.setBackgroundColor === 'function') {
            canvasEditor.setBackgroundColor(canvasBgColor, () => canvasEditor.renderAll());
        } else {
            canvasEditor.backgroundColor = canvasBgColor;
            canvasEditor.requestRenderAll();
        }
    }, [canvasEditor, canvasBgColor]);

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

            {/* <div className="fixed right-6 bottom-6">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    class="lucide lucide-palette-icon lucide-palette"
                >
                    <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                </svg>
                <ColorPicker
                    className="max-w-sm rounded-md border bg-background p-4 shadow-sm"
                    defaultValue={canvasBgColor}
                    onChange={setCanvasBgColor}
                >
                    <ColorPickerSelection />
                    <div className="flex items-center gap-4">
                        <ColorPickerEyeDropper />
                        <div className="grid w-full gap-1">
                            <ColorPickerHue />
                            <ColorPickerAlpha />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ColorPickerOutput />
                        <ColorPickerFormat />
                    </div>
                </ColorPicker>
            </div> */}
        </div>
    );
};

// function CanvasEditor({ project }) {
//     const canvasRef = useRef();
//     const containerRef = useRef();
//     const { canvasEditor, setCanvasEditor, activeTool, onToolChange } = useCanvasContext();
//     const [isLoading, setIsLoading] = useState(true);

//     const { mutate: updateProject } = useConvexMutation(api.projects.updateProject);

//     const calculateViewportScale = () => {
//         if (!containerRef.current || !project) return 1;
//         const container = containerRef.current;
//         const containerWidth = container.clientWidth - 40;
//         const containerHeight = container.clientHeight - 40;
//         const scaleX = containerWidth / project.width;
//         const scaleY = containerHeight / project.height;
//         return Math.min(scaleX, scaleY, 1);
//     };

//     useEffect(() => {
//         if (!canvasRef.current || !project || canvasEditor) return;

//         const initializeCanvas = async () => {
//             setIsLoading(true);

//             const viewportScale = calculateViewportScale();
//             const canvas = new Canvas(canvasRef.current, {
//                 width: project.width,
//                 height: project.height,
//                 backgroundColor: '#ffffff',
//                 preserveObjectStacking: true,
//                 controlsAboveOverlay: true,
//                 selection: true,
//                 hoverCursor: 'move',
//                 moveCursor: 'move',
//                 defaultCursor: 'default',
//                 allowTouchScrolling: false,
//                 renderOnAddRemove: true,
//                 skipTargetFind: false,
//             });

//             // Sync both lower and upper canvas layers
//             canvas.setDimensions(
//                 {
//                     width: project.width * viewportScale,
//                     height: project.height * viewportScale,
//                 },
//                 { backstoreOnly: false }
//             );

//             canvas.setZoom(viewportScale);

//             // High DPI handling (optional, comment if you don’t need)
//             const scaleFactor = window.devicePixelRatio || 1;
//             if (scaleFactor > 1) {
//                 canvas.getElement().width = project.width * scaleFactor;
//                 canvas.getElement().height = project.height * scaleFactor;
//                 canvas.getContext().scale(scaleFactor, scaleFactor);
//             }

//             // Load image
//             if (project.currentImageUrl || project.originalImageUrl) {
//                 try {
//                     const imageUrl = project.currentImageUrl || project.originalImageUrl;
//                     const fabricImage = await FabricImage.fromURL(imageUrl, {
//                         crossOrigin: 'anonymous',
//                     });

//                     const imgAspectRatio = fabricImage.width / fabricImage.height;
//                     const canvasAspectRatio = project.width / project.height;
//                     let scaleX, scaleY;

//                     if (imgAspectRatio > canvasAspectRatio) {
//                         scaleX = project.width / fabricImage.width;
//                         scaleY = scaleX;
//                     } else {
//                         scaleY = project.height / fabricImage.height;
//                         scaleX = scaleY;
//                     }

//                     fabricImage.set({
//                         left: project.width / 2,
//                         top: project.height / 2,
//                         originX: 'center',
//                         originY: 'center',
//                         scaleX,
//                         scaleY,
//                         selectable: true,
//                         evented: true,
//                     });

//                     canvas.add(fabricImage);
//                     canvas.centerObject(fabricImage);
//                 } catch (error) {
//                     console.error('Error loading project image:', error);
//                 }
//             }

//             // Load saved canvas state
//             if (project.canvasState) {
//                 try {
//                     await canvas.loadFromJSON(project.canvasState);
//                     canvas.requestRenderAll();
//                 } catch (error) {
//                     console.error('Error loading canvas state:', error);
//                 }
//             }

//             canvas.calcOffset();
//             canvas.requestRenderAll();
//             setCanvasEditor(canvas);

//             setTimeout(() => {
//                 // workaround for initial resize issues
//                 window.dispatchEvent(new Event('resize'));
//             }, 500);

//             setIsLoading(false);
//         };

//         initializeCanvas();

//         return () => {
//             if (canvasEditor) {
//                 canvasEditor.dispose();
//                 setCanvasEditor(null);
//             }
//         };
//     }, [project]);

//     const saveCanvasState = async () => {
//         if (!canvasEditor || !project) return;

//         try {
//             const canvasJSON = canvasEditor.toJSON();
//             await updateProject({
//                 projectId: project._id,
//                 canvasState: canvasJSON,
//             });
//         } catch (error) {
//             console.error('Error saving canvas state:', error);
//         }
//     };

//     useEffect(() => {
//         if (!canvasEditor) return;
//         let saveTimeout;

//         const handleCanvasChange = () => {
//             clearTimeout(saveTimeout);
//             saveTimeout = setTimeout(() => {
//                 saveCanvasState();
//             }, 2000);
//         };

//         canvasEditor.on('object:modified', handleCanvasChange);
//         canvasEditor.on('object:added', handleCanvasChange);
//         canvasEditor.on('object:removed', handleCanvasChange);

//         return () => {
//             clearTimeout(saveTimeout);
//             canvasEditor.off('object:modified', handleCanvasChange);
//             canvasEditor.off('object:added', handleCanvasChange);
//             canvasEditor.off('object:removed', handleCanvasChange);
//         };
//     }, [canvasEditor]);

//     useEffect(() => {
//         if (!canvasEditor) return;

//         switch (activeTool) {
//             case 'crop':
//                 canvasEditor.defaultCursor = 'crosshair';
//                 canvasEditor.hoverCursor = 'crosshair';
//                 break;
//             default:
//                 canvasEditor.defaultCursor = 'default';
//                 canvasEditor.hoverCursor = 'move';
//         }
//     }, [canvasEditor, activeTool]);

//     useEffect(() => {
//         const handleResize = () => {
//             if (!canvasEditor || !project) return;

//             const newScale = calculateViewportScale();
//             canvasEditor.setDimensions(
//                 {
//                     width: project.width * newScale,
//                     height: project.height * newScale,
//                 },
//                 { backstoreOnly: false }
//             );
//             canvasEditor.setZoom(newScale);
//             canvasEditor.calcOffset();
//             canvasEditor.requestRenderAll();
//         };

//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, [canvasEditor, project]);

//     // Handle automatic tab switching when text is selected
//     useEffect(() => {
//         if (!canvasEditor || !onToolChange) return;

//         const handleSelection = e => {
//             const selectedObject = e.selected?.[0];
//             if (selectedObject && selectedObject.type === 'i-text') {
//                 onToolChange('text');
//             }
//         };

//         canvasEditor.on('selection:created', handleSelection);
//         canvasEditor.on('selection:updated', handleSelection);

//         return () => {
//             canvasEditor.off('selection:created', handleSelection);
//             canvasEditor.off('selection:updated', handleSelection);
//         };
//     }, [canvasEditor, onToolChange]);

//     return (
//         <div
//             ref={containerRef}
//             className="relative flex items-center justify-center bg-secondary w-full h-full overflow-hidden"
//         >
//             <div
//                 className="absolute inset-0 opacity-10 pointer-events-none"
//                 style={{
//                     backgroundImage: `
//             linear-gradient(45deg, #64748b 25%, transparent 25%),
//             linear-gradient(-45deg, #64748b 25%, transparent 25%),
//             linear-gradient(45deg, transparent 75%, #64748b 75%),
//             linear-gradient(-45deg, transparent 75%, #64748b 75%)`,
//                     backgroundSize: '20px 20px',
//                     backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
//                 }}
//             />

//             {isLoading && (
//                 <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 z-10">
//                     <div className="flex flex-col items-center gap-4">
//                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
//                         <p className="text-white/70 text-sm">Loading canvas...</p>
//                     </div>
//                 </div>
//             )}

//             <div className="px-5">
//                 <canvas id="canvas" className="border" ref={canvasRef} />
//             </div>
//         </div>
//     );
// }

export default CanvasEditor;
