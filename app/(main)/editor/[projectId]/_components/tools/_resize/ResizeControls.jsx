import React from 'react';
import { useImageResize } from './useImageResize';
import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';

const ResizeControls = () => {
    const {
        ASPECT_RATIOS,
        dimensions,
        setDimensions,
        lockAspectRatio,
        setLockAspectRatio,
        selectedPreset,
        setSelectedPreset,
    } = useImageResize();

    const { canvasEditor, setProcessing, processing, setProcessingMessage, currentProject } =
        useCanvasContext();

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

    return (
        <div className="space-y-6">
            {/* Current Size Display */}
            <div className="bg-slate-700/30 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white mb-2">Current Size</h4>
                <div className="text-xs text-white/70">
                    {currentProject.width} × {currentProject.height} pixels
                </div>
            </div>

            {/* Manual Size Input */}
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
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
            </div>
        </div>
    );
};

export default ResizeControls;
