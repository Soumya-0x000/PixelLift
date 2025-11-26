import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { api } from '@/convex/_generated/api';
import { useConvexMutation } from '@/hooks/useConvexQuery';
import { useState } from 'react';

const ASPECT_RATIOS = [
    { name: 'Instagram Story', ratio: [9, 16], label: '9:16' },
    { name: 'Instagram Post', ratio: [1, 1], label: '1:1' },
    { name: 'Youtube Thumbnail', ratio: [16, 9], label: '16:9' },
    { name: 'Portrait', ratio: [2, 3], label: '2:3' },
    { name: 'Facebook Cover', ratio: [851, 315], label: '2.7:1' },
    { name: 'Twitter Header', ratio: [3, 1], label: '3:1' },
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
    };
};
