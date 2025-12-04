import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import useAPIContext from '@/context/APIcontext/useApiContext';
import { api } from '@/convex/_generated/api';
import { useConvexMutation } from '@/hooks/useConvexQuery';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

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
    const { canvasEditor, setProcessing, setProcessingMessage, currentProject } =
        useCanvasContext();
    const { get } = useAPIContext();

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

    // Calculate dimensions for aspect ratio based on original canvas size
    const calculateAspectRatioDimensions = useCallback(
        ratio => {
            if (!currentProject)
                return { width: currentProject.width, height: currentProject.height };

            const [ratioW, ratioH] = ratio;
            const originalArea = currentProject.width * currentProject.height;

            // Calculate new dimensions maintaining the same area approximately
            const aspectRatio = ratioW / ratioH;
            const newHeight = Math.sqrt(originalArea / aspectRatio);
            const newWidth = newHeight * aspectRatio;

            return {
                width: Math.round(newWidth),
                height: Math.round(newHeight),
            };
        },
        [currentProject]
    );

    // Handle dimension changes with aspect ratio locking
    const handleDimensionsChange = useCallback(
        (value, dimension) => {
            const parsedValue = parseInt(value, 10) || 0;
            if (!isNaN(parsedValue)) {
                setDimensions(prev => ({ ...prev, [dimension]: parsedValue }));
            }

            if (lockAspectRatio && currentProject) {
                const ratio = currentProject.width / currentProject.height;
                const modifiedValue = Math.round(parsedValue * ratio);
                setDimensions(prev => {
                    const key = dimension === 'newWidth' ? 'newHeight' : 'newWidth';
                    return {
                        ...prev,
                        [key]: modifiedValue,
                    };
                });
            }
            setSelectedPreset(null);
        },
        [lockAspectRatio, currentProject]
    );

    // Apply aspect ratio preset
    const applyAspectRatio = useCallback(
        aspectRatio => {
            const calculatedDimensions = calculateAspectRatioDimensions(aspectRatio.ratio);
            setDimensions(prev => ({
                ...prev,
                newWidth: calculatedDimensions.width,
                newHeight: calculatedDimensions.height,
            }));
            setSelectedPreset(aspectRatio.name);
        },
        [calculateAspectRatioDimensions]
    );

    // Calculate viewport scale to fit canvas in container
    const calculateViewportScale = useCallback(() => {
        if (!canvasEditor) return 1;
        const container = canvasEditor.getElement().parentNode;
        if (!container) return 1;
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        const scaleX = containerWidth / dimensions?.newWidth;
        const scaleY = containerHeight / dimensions?.newHeight;
        return Math.min(scaleX, scaleY, 1);
    }, [canvasEditor, dimensions]);

    // Apply resize to canvas
    const handleApplyResize = useCallback(async () => {
        if (
            !canvasEditor ||
            !currentProject ||
            dimensions.newWidth === currentProject.width ||
            dimensions.newHeight === currentProject.height
        ) {
            return;
        }

        setProcessing(true);
        setProcessingMessage('Resizing canvas...');

        try {
            canvasEditor.setWidth(dimensions.newWidth);
            canvasEditor.setHeight(dimensions.newHeight);

            // Calculate and apply viewport scale
            const viewportScale = calculateViewportScale();

            canvasEditor.setDimensions(
                {
                    width: dimensions.newWidth * viewportScale,
                    height: dimensions.newHeight * viewportScale,
                },
                { backstoreOnly: false }
            );

            canvasEditor.setZoom(viewportScale);
            canvasEditor.calcOffset();
            canvasEditor.requestRenderAll();

            await updateProject({
                projectId: currentProject._id,
                width: dimensions.newWidth,
                height: dimensions.newHeight,
                canvasState: canvasEditor.toJSON(),
            });
        } catch (error) {
            console.error('Failed to resize canvas', error);
            toast.error('Failed to resize canvas');
        } finally {
            setProcessing(false);
            setProcessingMessage(null);
        }
    }, [
        canvasEditor,
        currentProject,
        dimensions,
        calculateViewportScale,
        updateProject,
        setProcessing,
        setProcessingMessage,
    ]);

    // Restore original image dimensions
    const handleRestoreOriginalSize = useCallback(async () => {
        const imgKitFileId = currentProject?.imgKitFileId;

        if (!imgKitFileId) {
            toast.error('Image ID not found');
            return;
        }

        try {
            setProcessing(true);
            setProcessingMessage('Fetching original dimensions...');

            const response = await get(`imagekit/get_image_details/${imgKitFileId}`);

            if (!response?.data?.success || response.status !== 200) {
                throw new Error(response.error || 'Failed to fetch image details');
            }

            const { width, height } = response?.data?.data;

            setDimensions({
                newWidth: width,
                newHeight: height,
            });

            toast.success('Original dimensions restored', {
                action: {
                    label: 'Apply',
                    onClick: handleApplyResize,
                },
            });
        } catch (error) {
            console.error('Failed to restore original size', error);
            toast.error('Failed to restore original size');
        } finally {
            setProcessing(false);
            setProcessingMessage(null);
        }
    }, [currentProject, get, setProcessing, setProcessingMessage, handleApplyResize]);

    // Check if there are changes
    const hasChanges =
        currentProject &&
        (dimensions.newWidth !== currentProject.width ||
            dimensions.newHeight !== currentProject.height);

    return {
        // Constants
        ASPECT_RATIOS,

        // State
        dimensions,
        setDimensions,
        lockAspectRatio,
        setLockAspectRatio,
        selectedPreset,
        setSelectedPreset,

        // Computed values
        hasChanges,

        // Functions
        calculateAspectRatioDimensions,
        handleDimensionsChange,
        applyAspectRatio,
        handleApplyResize,
        handleRestoreOriginalSize,

        // Mutation state
        data,
        isLoading,
    };
};
