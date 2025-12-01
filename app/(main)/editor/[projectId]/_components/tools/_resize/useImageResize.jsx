import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { api } from '@/convex/_generated/api';
import { useConvexMutation } from '@/hooks/useConvexQuery';
import { useState } from 'react';

const ASPECT_RATIOS = [
    { name: 'Instagram Story', ratio: [9, 16], label: '9 : 16' },
    { name: 'Instagram Post', ratio: [1, 1], label: '1 : 1' },
    { name: 'Youtube Thumbnail', ratio: [16, 9], label: '16 : 9' },
    { name: 'Facebook Cover', ratio: [851, 315], label: '2.7 : 1' },
    { name: 'Twitter Header', ratio: [3, 1], label: '3 : 1' },
    { name: 'Facebook Post', ratio: [4, 5], label: '4 : 5' },
    { name: 'Pinterest Pin', ratio: [2, 3], label: '2 : 3' },
    { name: 'LinkedIn Banner', ratio: [4, 1], label: '4 : 1' },
    { name: 'Ultra-Wide', ratio: [21, 9], label: '21 : 9' },
    { name: 'A4 Paper', ratio: [210, 297], label: '1 : 1.41' },
    { name: 'Business Card (Standard)', ratio: [3.5, 2], label: '3.5 : 2' },
    { name: 'Poster (24x36)', ratio: [2, 3], label: '2 : 3' },
    { name: 'iPhone Wallpaper', ratio: [19.5, 9], label: '19.5 : 9' },
    { name: 'Android Wallpaper', ratio: [18, 9], label: '18 : 9' },
    { name: 'Cinematic', ratio: [2.39, 1], label: '2.39 : 1' },
    { name: 'Classic Film', ratio: [4, 3], label: '4 : 3' },
];

export const useImageResize = () => {
    const { canvasEditor, setProcessing, processing, setProcessingMessage, currentProject } =
        useCanvasContext();
    const initialDimension = {
        newWidth: currentProject?.width || 800,
        newHeight: currentProject?.height || 600,
    };

    const [dimensions, setDimensions] = useState(initialDimension);
    const [lockAspectRatio, setLockAspectRatio] = useState(true);
    const [selectedPreset, setSelectedPreset] = useState(null);

    const {
        mutate: updateProject,
        data,
        isLoading,
    } = useConvexMutation(api.projects.updateProject);

    return {
        ASPECT_RATIOS,
        dimensions,
        setDimensions,
        lockAspectRatio,
        setLockAspectRatio,
        selectedPreset,
        setSelectedPreset,
        data,
        isLoading,
    };
};
