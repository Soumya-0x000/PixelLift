import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { useState } from 'react';

export const useBackgroundChange = () => {
    const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
    const UNSPLASH_URL = process.env.NEXT_PUBLIC_UNSPLASH_URL;
    const { canvasEditor, activeTool, currentProject, setProcessingMessage, setProcessing } =
        useCanvasContext();
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [searchQuery, setSearchQuery] = useState('');
    const [unsplashImages, setUnsplashImages] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState(null);

    return {
        UNSPLASH_ACCESS_KEY,
        UNSPLASH_URL,
        canvasEditor,
        activeTool,
        currentProject,
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
