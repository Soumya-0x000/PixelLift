import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { useState } from 'react';

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const UNSPLASH_URL = process.env.NEXT_PUBLIC_UNSPLASH_URL;

export const useBackgroundChange = () => {
    const { canvasEditor, activeTool, currentProject, setProcessingMessage, setProcessing } = useCanvasContext();
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [searchQuery, setSearchQuery] = useState('');
    const [unsplashImages, setUnsplashImages] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState(null);

    const getMainImage = () => {
        if (!canvasEditor) return null;

        const objects = canvasEditor.getObjects();
        const mainImage = objects.find(obj => obj.type === 'image');
        return mainImage;
    };

    const handleBackgroundRemoval = () => {
        const mainImage = getMainImage();
        if (!mainImage || !currentProject) return;

        try {
            setProcessingMessage('Removing background...');
            setProcessing(true);

            const currentImgUrl = mainImage.get('src');
            const bgRemovedUrl = currentImgUrl.includes('ik.imagekit.io') ? `${currentImgUrl?.split('?')[0]}?tr=e-removedotbg` : currentImgUrl;
            console.log(bgRemovedUrl);

            canvasEditor?.remove();
            canvasEditor?.add(new fabric.Image(bgRemovedUrl));
            canvasEditor?.requestRenderAll();
        } catch {
        } finally {
            setProcessingMessage(null);
            setProcessing(false);
        }
    };

    return {
        UNSPLASH_ACCESS_KEY,
        UNSPLASH_URL,
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
    };
};
