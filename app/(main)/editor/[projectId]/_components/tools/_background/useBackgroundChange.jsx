'use client';

import { useState, useMemo } from 'react';
import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { removeBackground } from '@imgly/background-removal';
import { FabricImage } from 'fabric';
import { toast } from 'sonner';

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const UNSPLASH_URL = process.env.NEXT_PUBLIC_UNSPLASH_URL;
const HF_MODEL_ID = process.env.NEXT_PUBLIC_HF_MODEL_ID;
const HF_API_URL = process.env.NEXT_PUBLIC_HF_API_URL;

export const useBackgroundChange = () => {
    const { canvasEditor, activeTool, currentProject, setProcessingMessage, setProcessing } = useCanvasContext();
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [searchQuery, setSearchQuery] = useState('');
    const [unsplashImages, setUnsplashImages] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [processedBlob, setProcessedBlob] = useState(null);

    const getMainImage = () => {
        if (!canvasEditor) return null;

        const objects = canvasEditor.getObjects();
        const mainImage = objects.find(obj => obj.type === 'image');
        return mainImage;
    };

    const mainImage = useMemo(() => getMainImage(), [getMainImage]);

    const handleBackgroundRemoval = async () => {
        if (!mainImage || !currentProject) return;

        try {
            setProcessingMessage('Removing background...');
            setProcessing(true);

            const currentImgUrl = mainImage.get('src');
            console.log(currentImgUrl);

            const blob = await removeBackground(currentImgUrl, {
                progress: (key, current, total) => {
                    const percent = Math.round((current / total) * 100);
                    setProcessingMessage(`Removing background: ${percent}%`);
                },
            });

            setProcessedBlob(blob);
            const bgRemovedUrl = URL.createObjectURL(blob);
            console.log('Background removed blob URL:', bgRemovedUrl);

            // Load the new image with background removed
            setProcessingMessage('Loading image...');

            const processedImage = await FabricImage.fromURL(bgRemovedUrl, {
                crossOrigin: 'anonymous',
            });

            const commonProps = {
                left: mainImage.left,
                top: mainImage.top,
                scaleX: mainImage.scaleX,
                scaleY: mainImage.scaleY,
                angle: mainImage.angle,
                originX: mainImage.originX,
                originY: mainImage.originY,
                flipX: mainImage.flipX,
                flipY: mainImage.flipY,
                opacity: mainImage.opacity,
            };

            canvasEditor.remove(mainImage);
            processedImage.set(commonProps);
            canvasEditor.add(processedImage);

            processedImage.setCoords();

            canvasEditor.setActiveObject(processedImage);
            canvasEditor.calcOffset();
            canvasEditor.requestRenderAll();

            toast.success('Background removed successfully!');
            setProcessing(false);
            setProcessingMessage(null);
        } catch (error) {
            console.error('BG Removal Error:', error);
            toast.error('Error removing background');
            setProcessing(false);
            setProcessingMessage(null);
        }
    };

    return {
        UNSPLASH_ACCESS_KEY,
        UNSPLASH_URL,
        HF_MODEL_ID,
        HF_API_URL,
        canvasEditor,
        activeTool,
        currentProject,
        handleBackgroundRemoval,
        getMainImage,
        setProcessingMessage,
        setProcessing,
        backgroundColor,
        setBackgroundColor,
        searchQuery,
        setSearchQuery,
        unsplashImages,
        setUnsplashImages,
        isSearching,
        setIsSearching,
        selectedImageId,
        setSelectedImageId,
        mainImage,
    };
};
