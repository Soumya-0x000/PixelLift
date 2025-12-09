import React from 'react';
import { useImageCrop } from './useImageCrop';
import { Button } from '@/components/ui/button';
import { CheckCheck, Crop, X } from 'lucide-react';
import useCanvasContext from '@/context/canvasContext/useCanvasContext';

const CropContent = () => {
    const { canvasEditor } = useCanvasContext();

    const {
        ASPECT_RATIOS,
        selectedImage,
        isCropMode,
        selectedRatio,
        getActiveImage,
        initializeCropMode,
        applyAspectRatio,
        applyCrop,
        cancelCrop,
    } = useImageCrop(canvasEditor);

    if (!canvasEditor) {
        return (
            <div className="p-4">
                <p className="text-white/70 text-sm">Canvas not ready</p>
            </div>
        );
    }

    const activeImage = getActiveImage();
    if (!activeImage && !isCropMode) {
        return (
            <div className="p-4">
                <p className="text-white/70 text-sm">Select an image to crop</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Crop Mode Status */}
            {isCropMode && (
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                    <p className="text-cyan-400 text-sm font-medium">✂️ Crop Mode Active</p>
                    <p className="text-cyan-300/80 text-xs mt-1">
                        Adjust the blue rectangle to set crop area
                    </p>
                </div>
            )}

            {/* Start Crop Button */}
            {!isCropMode && activeImage && (
                <Button
                    onClick={() => initializeCropMode(activeImage)}
                    className="w-full"
                    variant="primary"
                >
                    <Crop className="h-4 w-4 mr-2" />
                    Start Cropping
                </Button>
            )}

            {/* Aspect Ratio Selection - Only show in crop mode */}
            {isCropMode && (
                <div>
                    <h3 className="text-sm font-medium text-white mb-3">Crop Aspect Ratios</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {ASPECT_RATIOS?.map(ratio => {
                            const IconComponent = ratio.icon;
                            return (
                                <button
                                    key={ratio.label}
                                    onClick={() => applyAspectRatio(ratio.value)}
                                    className={`text-center p-3 border rounded-lg transition-colors cursor-pointer ${
                                        selectedRatio === ratio.value
                                            ? 'border-cyan-400 bg-cyan-400/10'
                                            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                                    }`}
                                >
                                    <IconComponent className="h-6 w-6 mx-auto mb-2 text-white" />
                                    <div className="text-xs text-white">{ratio.label}</div>
                                    {ratio.ratio && (
                                        <div className="text-xs text-white/70">{ratio.ratio}</div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Crop Actions - Only show in crop mode */}
            {isCropMode && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                    <Button onClick={applyCrop} className="w-full" variant="primary">
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Apply Crop
                    </Button>

                    <Button onClick={cancelCrop} variant="outline" className="w-full">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-white/70">
                    <strong>How to crop:</strong>
                    <br />
                    1. Click "Start Cropping"
                    <br />
                    2. Drag the blue rectangle to select crop area
                    <br />
                    3. Choose aspect ratio (optional)
                    <br />
                    4. Click "Apply Crop" to finalize
                </p>
            </div>
        </div>
    );
};

export default CropContent;
