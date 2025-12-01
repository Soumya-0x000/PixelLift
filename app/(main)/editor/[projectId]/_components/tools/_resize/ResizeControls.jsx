import React, { useEffect } from 'react';
import { useImageResize } from './useImageResize';
import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { Button } from '@/components/ui/button';
import { Expand, Lock, Monitor, Unlock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ResizeControls = () => {
    const {
        ASPECT_RATIOS,
        dimensions,
        setDimensions,
        lockAspectRatio,
        setLockAspectRatio,
        selectedPreset,
        setSelectedPreset,
        data,
        isLoading,
    } = useImageResize();

    const {
        canvasEditor,
        setProcessing,
        processing,
        setProcessingMessage,
        processingMessage,
        currentProject,
    } = useCanvasContext();

    useEffect(() => {
        if (!isLoading && data) {
            window.location.reload();
        }
    }, [data, isLoading]);

    if (!canvasEditor || !currentProject) {
        return (
            <div className=" ring-1 ring-slate-800/50 rounded-md bg-slate-900/20 w-full h-full flex items-center justify-center">
                <div>Canvas not ready!</div>
            </div>
        );
    }

    const hasChanges =
        dimensions.newWidth !== currentProject.width ||
        dimensions.newHeight !== currentProject.height;

    const handleDimensionsChange = (value, dimension) => {
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
    };

    // Calculate dimensions for aspect ratio based on original canvas size
    const calculateAspectRatioDimensions = ratio => {
        if (!currentProject) return { width: currentProject.width, height: currentProject.height };

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
    };

    const applyAspectRatio = aspectRatio => {
        const dimensions = calculateAspectRatioDimensions(aspectRatio.ratio);
        setDimensions(prev => ({
            ...prev,
            newWidth: dimensions.width,
            newHeight: dimensions.height,
        }));
        setSelectedPreset(aspectRatio.name);
    };

    // Calculate viewport scale to fit canvas in container
    const calculateViewportScale = () => {
        const container = canvasEditor.getElement().parentNode;
        if (!container) return 1;
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        const scaleX = containerWidth / newWidth;
        const scaleY = containerHeight / newHeight;
        return Math.min(scaleX, scaleY, 1);
    };

    const handleApplyResize = () => {};

    return (
        <div className="flex flex-col gap-y-1.5 h-full">
            {/* Current Size Display */}
            <div className="bg-slate-700/30 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white mb-2">Current Size</h4>
                <div className="text-xs text-white/70">
                    {currentProject.width} × {currentProject.height} pixels
                </div>
            </div>

            {/* Manual Size Input */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">Custom Size</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLockAspectRatio(!lockAspectRatio)}
                        className="text-white/70 hover:text-white p-1"
                    >
                        {lockAspectRatio ? (
                            <Lock className="h-4 w-4" />
                        ) : (
                            <Unlock className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-white/70 mb-1 block">Width</label>
                        <Input
                            type="number"
                            value={dimensions.newWidth}
                            onChange={e => handleDimensionsChange(e.target.value, 'newWidth')}
                            min="100"
                            max="5000"
                            className="bg-slate-700 border-white/20 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-white/70 mb-1 block">Height</label>
                        <Input
                            type="number"
                            value={dimensions.newHeight}
                            onChange={e => handleDimensionsChange(e.target.value, 'newHeight')}
                            min="100"
                            max="5000"
                            className="bg-slate-700 border-white/20 text-white"
                        />
                    </div>
                </div>

                <div className=" text-xs text-white/70 text-right">
                    {lockAspectRatio ? 'Aspect ratio locked' : 'Free resize'}
                </div>
            </div>

            {/* Aspect Ratio Presets */}
            <div className="space-y-3 border-t border-slate-700/20 pt-2">
                <h3 className="text-sm font-medium text-white">Aspect Ratios</h3>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {ASPECT_RATIOS.map(aspectRatio => {
                        const dimensions = calculateAspectRatioDimensions(aspectRatio.ratio);
                        return (
                            <Button
                                key={aspectRatio.name}
                                variant={
                                    selectedPreset === aspectRatio.name ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() => applyAspectRatio(aspectRatio)}
                                className={`text-left justify-between h-auto py-2 ${
                                    selectedPreset === aspectRatio.name
                                        ? 'bg-slate-600/50 hover:bg-slate-700/90 text-zinc-100'
                                        : ''
                                }`}
                            >
                                <div className="flex flex-col gap-y-1">
                                    <div className="font-medium">{aspectRatio.name}</div>
                                    <div className="text-xs opacity-70">
                                        {dimensions.width} × {dimensions.height} (
                                        {aspectRatio.label})
                                    </div>
                                </div>
                                <Monitor className="h-4 w-4" />
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Apply Button */}
            <Button
                onClick={handleApplyResize}
                disabled={!hasChanges || processingMessage}
                className="w-full"
                variant="primary"
            >
                <Expand className="h-4 w-4 mr-2" />
                Apply Resize
            </Button>

            {/* Instructions */}
            <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-white/70">
                    <strong>Resize Canvas:</strong> Changes canvas dimensions.
                    <br />
                    <strong>Aspect Ratios:</strong> Smart sizing based on your current canvas.
                    <br />
                    Objects maintain their size and position.
                </p>
            </div>
        </div>
    );
};

export default ResizeControls;
