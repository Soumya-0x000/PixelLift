import { useState } from 'react';
import { Maximize, RectangleHorizontal, RectangleVertical, Smartphone, Square } from 'lucide-react';

const ASPECT_RATIOS = [
    { label: 'Freeform', value: null, icon: Maximize },
    { label: 'Square', value: 1, icon: Square, ratio: '1:1' },
    {
        label: 'Widescreen',
        value: 16 / 9,
        icon: RectangleHorizontal,
        ratio: '16:9',
    },
    { label: 'Portrait', value: 4 / 5, icon: RectangleVertical, ratio: '4:5' },
    { label: 'Story', value: 9 / 16, icon: Smartphone, ratio: '9:16' },
];

export const useImageCrop = canvasEditor => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [isCropMode, setIsCropMode] = useState(false);
    const [selectedRatio, setSelectedRatio] = useState(null);

    const getActiveImage = () => {
        if (!canvasEditor) return null;

        const activeObject = canvasEditor.getActiveObject();
        if (activeObject && activeObject.type === 'image') {
            return activeObject;
        }

        const objects = canvasEditor.getObjects();
        return objects.find(object => object.type === 'image') || null;
    };

    const removeAllCropRectangles = () => {
        if (!canvasEditor) return;

        const objects = canvasEditor.getObjects();
        const rectsToRemove = objects.filter(object => object.type === 'rect');

        rectsToRemove.forEach(rect => {
            canvasEditor.remove(rect);
        });

        canvasEditor.requestRenderAll();
    };

    const initializeCropMode = image => {
        if (!image || !canvasEditor) return;

        setSelectedImage(image);
        setIsCropMode(true);
        setSelectedRatio(null);

        // TODO: Create crop rectangle overlay
        // This would typically create a fabric.Rect with specific properties
        // for visual crop area selection
    };

    const applyAspectRatio = ratio => {
        setSelectedRatio(ratio);

        if (!selectedImage || !canvasEditor) return;

        // TODO: Adjust crop rectangle to match the selected aspect ratio
        // This would modify the existing crop rectangle's dimensions
        // while maintaining the aspect ratio
    };

    const applyCrop = () => {
        if (!selectedImage || !canvasEditor) return;

        // TODO: Apply the crop to the image
        // This would:
        // 1. Get the crop rectangle dimensions
        // 2. Crop the image based on those dimensions
        // 3. Update the canvas
        // 4. Clean up crop mode

        removeAllCropRectangles();
        setIsCropMode(false);
        setSelectedImage(null);
        setSelectedRatio(null);
    };

    const cancelCrop = () => {
        removeAllCropRectangles();
        setIsCropMode(false);
        setSelectedImage(null);
        setSelectedRatio(null);
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
    };
};
