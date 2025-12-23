import { useEffect, useState } from 'react';
import { Maximize, RectangleHorizontal, RectangleVertical, Smartphone, Square } from 'lucide-react';
import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { FabricImage, Rect, Canvas } from 'fabric';
import { useConvexMutation } from '@/hooks/useConvexQuery';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useAPIContext from '@/context/APIcontext/useApiContext';

const ASPECT_RATIOS = [
    { label: 'Freeform', value: null, icon: Maximize },
    { label: 'Square', value: 1, icon: Square, ratio: '1:1' },
    { label: 'Widescreen', value: 16 / 9, icon: RectangleHorizontal, ratio: '16:9' },
    { label: 'Portrait', value: 4 / 5, icon: RectangleVertical, ratio: '4:5' },
    { label: 'Story', value: 9 / 16, icon: Smartphone, ratio: '9:16' },
];

export const useImageCrop = ({ setShowSaveOptions }) => {
    const { canvasEditor, activeTool, currentProject, setProcessingMessage, setProcessing } =
        useCanvasContext();
    const { post } = useAPIContext();
    const { mutate: createProject } = useConvexMutation(api.projects.create);
    const router = useRouter();

    const [selectedImage, setSelectedImage] = useState(null);
    const [isCropMode, setIsCropMode] = useState(false);
    const [selectedRatio, setSelectedRatio] = useState(null);
    const [cropRect, setCropRect] = useState(null);
    const [originalProps, setOriginalProps] = useState(null);

    const getActiveImage = () => {
        if (!canvasEditor) return null;

        const activeObject = canvasEditor.getActiveObject();
        if (activeObject && activeObject.type === 'image') {
            return activeObject;
        }

        const objects = canvasEditor.getObjects();
        return objects.find(object => object.type === 'image') || null;
    };

    useEffect(() => {
        if (activeTool === 'crop' && canvasEditor && isCropMode) {
            const activeImage = getActiveImage();
            if (activeImage) {
                initializeCropMode(activeImage);
            }
        } else if (activeTool !== 'crop' && isCropMode) {
            exitCropMode();
        }
    }, [canvasEditor, activeTool, isCropMode]);

    // Cleanup when component unmounts
    useEffect(() => {
        return () => {
            if (isCropMode) {
                exitCropMode();
            }
        };
    }, []);

    useEffect(() => {
        if (!isCropMode) {
            setShowSaveOptions(false);
        }
        return () => {
            setShowSaveOptions(false);
        };
    }, [isCropMode]);

    const removeAllCropRectangles = () => {
        if (!canvasEditor) return;

        const objects = canvasEditor.getObjects();
        const rectsToRemove = objects.filter(object => object.type === 'rect');

        rectsToRemove.forEach(rect => {
            canvasEditor.remove(rect);
        });

        canvasEditor.requestRenderAll();
    };

    const exitCropMode = () => {
        if (!isCropMode) return;

        removeAllCropRectangles();
        setCropRect(null);

        if (selectedImage && originalProps) {
            selectedImage.set({
                left: originalProps.left,
                top: originalProps.top,
                scaleX: originalProps.scaleX,
                scaleY: originalProps.scaleY,
                angle: originalProps.angle,
                selectable: originalProps.selectable,
                evented: originalProps.evented,
            });

            canvasEditor.setActiveObject(selectedImage);
        }

        setIsCropMode(false);
        setSelectedImage(null);
        setOriginalProps(null);
        setSelectedRatio(null);

        canvasEditor && canvasEditor.requestRenderAll();
    };

    const initializeCropMode = image => {
        if (!image || isCropMode) return;

        removeAllCropRectangles();

        const orginial = {
            left: image.left,
            top: image.top,
            width: image.width,
            height: image.height,
            scaleX: image.scaleX,
            scaleY: image.scaleY,
            angle: image.angle,
            selectable: image.selectable,
            evented: image.evented,
        };

        setOriginalProps(orginial);
        setSelectedImage(image);
        setIsCropMode(true);

        image.set({ selectable: false, evented: false });
        createCropRectangle(image);
        canvasEditor.requestRenderAll();
    };

    const createCropRectangle = image => {
        if (!canvasEditor) return;

        const bounds = image.getBoundingRect();

        const cropRectangle = new Rect({
            left: bounds.left + bounds.width * 0.1,
            top: bounds.top + bounds.height * 0.1,
            width: bounds.width * 0.8,
            height: bounds.height * 0.8,
            fill: 'transparent',
            stroke: '#00bcd4',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            selectable: true,
            evented: true,
            name: 'crop-rectangle',

            // visual styles
            cornerColor: '#00bcd4',
            cornerSize: 12,
            transparentCorners: true,
            cornerStyle: 'circle',
            cornerStrokeColor: '#00bcd4',
            cornerDashArray: [5, 5],
            borderColor: '#00bcd4',
            borderScaleFactor: 1,
            borderOpacity: 0.5,
            borderDashArray: [5, 5],

            // custom property to identify crop rectangle
            isCropRectangle: true,
        });

        cropRectangle.on('scaling', e => {
            const rect = e.target;

            if (selectedRatio && selectedRatio !== null) {
                const currentRatio = (rect.width * rect.scaleX) / (rect.height * rect.scaleY);
                if (Math.abs(currentRatio - selectedRatio) > 0.01) {
                    const newHeight = (rect.height * rect.scaleX) / selectedRatio / rect.scaleY;
                    rect.set({
                        height: newHeight,
                        scaleY: newHeight / rect.height,
                    });
                }
            }
            canvasEditor.requestRenderAll();
        });

        canvasEditor.add(cropRectangle);
        canvasEditor.setActiveObject(cropRectangle);
        setCropRect(cropRectangle);
    };

    const applyAspectRatio = ratio => {
        setSelectedRatio(ratio);

        if (!cropRect || ratio === null) return;

        const currentWidth = cropRect.width * cropRect.scaleX;
        const newHeight = currentWidth / ratio;

        cropRect.set({
            height: newHeight / cropRect.scaleY,
            scaleY: cropRect.scaleX,
        });
        canvasEditor.requestRenderAll();
    };

    const applyCrop = () => {
        if (!selectedImage || !isCropMode) return;

        try {
            setProcessing(true);
            setProcessingMessage('Applying crop...');

            const cropBounds = cropRect.getBoundingRect();
            const imageBounds = selectedImage.getBoundingRect();

            const cropX = Math.max(0, cropBounds.left - imageBounds.left);
            const cropY = Math.max(0, cropBounds.top - imageBounds.top);
            const cropWidth = Math.min(cropBounds.width, imageBounds.width - cropX);
            const cropHeight = Math.min(cropBounds.height, imageBounds.height - cropY);

            const imgScaleX = selectedImage.scaleX || 1;
            const imgScaleY = selectedImage.scaleY || 1;

            const actualCropX = cropX / imgScaleX;
            const actualCropY = cropY / imgScaleY;
            const actualCropWidth = cropWidth / imgScaleX;
            const actualCropHeight = cropHeight / imgScaleY;

            const croppedImage = new FabricImage(selectedImage._element, {
                left: cropBounds.left + cropBounds.width / 2,
                top: cropBounds.top + cropBounds.height / 2,

                originX: 'center',
                originY: 'center',
                selectable: true,
                evented: true,

                cropX: actualCropX,
                cropY: actualCropY,
                width: actualCropWidth,
                height: actualCropHeight,
                scaleX: imgScaleX,
                scaleY: imgScaleY,
            });

            canvasEditor.remove(selectedImage);
            canvasEditor.add(croppedImage);
            canvasEditor.setActiveObject(croppedImage);
            canvasEditor.requestRenderAll();
        } catch (error) {
            toast.error('Failed to apply crop, Please try again!');
            console.error(error);
        } finally {
            setProcessing(false);
            setProcessingMessage(null);
            exitCropMode();
        }
    };

    const saveAsNew = async () => {
        if (!selectedImage || !cropRect || !isCropMode) {
            toast.error('No crop area selected');
            return;
        }

        try {
            setProcessing(true);
            setProcessingMessage('Saving new project...');

            // Get crop bounds
            const cropBounds = cropRect.getBoundingRect();
            const imageBounds = selectedImage.getBoundingRect();

            // Calculate crop coordinates relative to the image
            const cropX = Math.max(0, cropBounds.left - imageBounds.left);
            const cropY = Math.max(0, cropBounds.top - imageBounds.top);
            const cropWidth = Math.min(cropBounds.width, imageBounds.width - cropX);
            const cropHeight = Math.min(cropBounds.height, imageBounds.height - cropY);

            const imgScaleX = selectedImage.scaleX || 1;
            const imgScaleY = selectedImage.scaleY || 1;

            const actualCropX = cropX / imgScaleX;
            const actualCropY = cropY / imgScaleY;
            const actualCropWidth = cropWidth / imgScaleX;
            const actualCropHeight = cropHeight / imgScaleY;

            // Create a new image with the cropped portion
            const croppedImage = new FabricImage(selectedImage._element, {
                left: actualCropWidth / 2,
                top: actualCropHeight / 2,

                originX: 'center',
                originY: 'center',
                
                cropX: actualCropX,
                cropY: actualCropY,
                width: actualCropWidth,
                height: actualCropHeight,
                scaleX: 1,
                scaleY: 1,
            });

            tempCanvas.add(croppedImage);
            tempCanvas.renderAll();

            // Convert canvas to blob
            const dataURL = tempCanvas.toDataURL({
                format: 'png',
                quality: 1,
            });

            // Convert dataURL to blob
            const blob = await (await fetch(dataURL)).blob();

            // Create FormData for upload
            const formData = new FormData();
            const fileName = `${currentProject?.title || 'Untitled'}_cropped_${Date.now()}.png`;
            formData.append('file', blob, fileName);
            formData.append('fileName', fileName);

            // Upload to ImageKit
            const { data: uploadData, status } = await post('/imagekit/upload', formData);

            if (status !== 200 || !uploadData.success) {
                throw new Error('Failed to upload image to ImageKit');
            }

            // Create new project in Convex
            const newProjectId = await createProject({
                title: `${currentProject?.title || 'Untitled'} (Cropped)`,
                description: `Cropped from: ${currentProject?.title || 'Untitled'}`,
                originalImageUrl: uploadData.url,
                currentImageUrl: uploadData.url,
                thumbnailUrl: uploadData.thumbnailUrl,
                width: Math.round(actualCropWidth),
                height: Math.round(actualCropHeight),
                imgKitFileId: uploadData.fileId,
                size: uploadData.size,
                canvasState: null,
            });

            // Clean up temporary canvas
            tempCanvas.dispose();

            toast.success('Cropped image saved as new project!');
            router.push(`/editor/${newProjectId}`);
        } catch (error) {
            console.error('Error saving cropped image:', error);
            toast.error('Failed to save cropped image. Please try again.');
        } finally {
            setProcessing(false);
            setProcessingMessage(null);
            exitCropMode();
        }
    };

    const cancelCrop = () => {
        exitCropMode();
    };

    return {
        ASPECT_RATIOS,
        selectedImage,
        isCropMode,
        selectedRatio,
        getActiveImage,
        removeAllCropRectangles,
        initializeCropMode,
        applyAspectRatio,
        applyCrop,
        cancelCrop,
        saveAsNew,
    };
};
