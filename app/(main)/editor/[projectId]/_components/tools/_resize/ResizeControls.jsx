import React, { useEffect } from 'react';
import { useImageResize } from './useImageResize';
import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { Button } from '@/components/ui/button';
import { Expand, Lock, Monitor, RefreshCw, Unlock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

const ResizeControls = () => {
    const {
        ASPECT_RATIOS,
        dimensions,
        lockAspectRatio,
        setLockAspectRatio,
        selectedPreset,
        hasChanges,
        calculateAspectRatioDimensions,
        handleDimensionsChange,
        applyAspectRatio,
        handleApplyResize,
        handleRestoreOriginalSize,
        data,
        isLoading,
    } = useImageResize();

    const { canvasEditor, currentProject } = useCanvasContext();
    const router = useRouter();

    // Reload page after successful update
    useEffect(() => {
        if (!isLoading && data) {
            router.refresh();
        }
    }, [data, isLoading]);

    // Dispatch resize event after update
    useEffect(() => {
        if (!isLoading && data) {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
                window.location.reload();
            }, 500);
        }
    }, [isLoading, data]);

    if (!canvasEditor || !currentProject) {
        return (
            <div className="ring-1 ring-slate-800/50 rounded-md bg-slate-900/20 w-full h-full flex items-center justify-center">
                <div>Canvas not ready!</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-y-1.5 h-auto">
            {/* Current Size Display */}
            <div className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between">
                <div className="flex flex-col items-start justify-center w-fit">
                    <h4 className="text-sm font-medium text-white mb-2">Current Size</h4>
                    <div className="text-xs text-white/70">
                        {currentProject.width} × {currentProject.height} pixels
                    </div>
                </div>

                <div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleRestoreOriginalSize}
                        className="text-white/70 hover:text-white p-1 group hover:bg-slate-950"
                    >
                        <RefreshCw className="group-hover:animate-spin" />
                    </Button>
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

                <div className="text-xs text-white/70 text-right">
                    {lockAspectRatio ? 'Aspect ratio locked' : 'Free resize'}
                </div>
            </div>

            {/* Aspect Ratio Presets */}
            <div className="space-y-3 border-t border-slate-700/20 pt-2">
                <h3 className="text-sm font-medium text-white">Aspect Ratios</h3>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {ASPECT_RATIOS.map(aspectRatio => {
                        const calculatedDimensions = calculateAspectRatioDimensions(
                            aspectRatio.ratio
                        );
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
                                        {calculatedDimensions.width} × {calculatedDimensions.height}{' '}
                                        ({aspectRatio.label})
                                    </div>
                                </div>
                                <Monitor className="h-4 w-4" />
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* New Size Preview */}
            {hasChanges && (
                <motion.div
                    initial={{ opacity: 0, y: 150 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-700/30 rounded-lg p-3 mt-4"
                >
                    <h4 className="text-sm font-medium text-white mb-2">New Size Preview</h4>
                    <div className="text-xs text-white/70">
                        <div>
                            New Canvas: {dimensions.newWidth} × {dimensions.newHeight} pixels
                        </div>
                        <div className="text-cyan-400">
                            {dimensions.newWidth > currentProject.width ||
                            dimensions.newHeight > currentProject.height
                                ? 'Canvas will be expanded'
                                : 'Canvas will be cropped'}
                        </div>
                        <div className="text-white/50 mt-1">
                            Objects will maintain their current size and position
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Apply Button */}
            <Button onClick={handleApplyResize} className="w-fit my-4" variant="default">
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
