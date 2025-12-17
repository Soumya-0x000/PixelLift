import React, { memo, useState } from 'react';
import { useImageCrop } from './useImageCrop';
import { Button } from '@/components/ui/button';
import { CheckCheck, Crop, X } from 'lucide-react';
import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { AnimatePresence, motion } from 'motion/react';

const CropContent = memo(() => {
    const { canvasEditor } = useCanvasContext();
    const [showSaveOptions, setShowSaveOptions] = useState(false);

    const {
        ASPECT_RATIOS,
        isCropMode,
        selectedRatio,
        getActiveImage,
        initializeCropMode,
        applyAspectRatio,
        applyCrop,
        cancelCrop,
        saveAsNew,
    } = useImageCrop();
    const activeImage = getActiveImage();

    if (!canvasEditor) {
        return (
            <div className="p-4">
                <p className="text-white/70 text-sm">Canvas not ready</p>
            </div>
        );
    }

    if (!activeImage && !isCropMode) {
        return (
            <div className="p-4">
                <p className="text-white/70 text-sm">Select an image to crop</p>
            </div>
        );
    }

    const handleCropCancel = () => {
        cancelCrop();
        setShowSaveOptions(false);
    };

    return (
        <div className="space-y-6 relative">
            <AnimatePresence mode="wait">
                {/* BEFORE CLICK — Start Cropping Button */}
                {!isCropMode && activeImage && (
                    <motion.button
                        layoutId="crop-ui"
                        onClick={() => initializeCropMode(activeImage)}
                        className="w-full border cursor-pointer rounded-lg p-2 flex items-center justify-center bg-zinc-900 border-white/20 text-white hover:bg-white/10 transition"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Crop className="h-4 w-4 mr-2" />
                        Start Cropping
                    </motion.button>
                )}

                {/* AFTER CLICK — Crop Mode Active Box */}
                {isCropMode && (
                    <motion.div
                        layoutId="crop-ui"
                        className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ type: 'spring', bounce: 0.25, duration: 0.55 }}
                    >
                        <p className="text-cyan-400 text-sm font-medium">Crop Mode Active</p>
                        <p className="text-cyan-300/80 text-xs mt-1">
                            Adjust the blue rectangle to set crop area
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Aspect Ratio Options */}
            <AnimatePresence>
                {isCropMode && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                    >
                        <h3 className="text-sm font-medium text-white mb-3">Crop Aspect Ratios</h3>

                        <div className="grid grid-cols-3 gap-2">
                            {ASPECT_RATIOS?.map(ratio => {
                                const IconComponent = ratio.icon;

                                return (
                                    <motion.button
                                        key={ratio.label}
                                        whileTap={{ scale: 0.93 }}
                                        onClick={() => applyAspectRatio(ratio.value)}
                                        className={`text-center p-3 border rounded-lg cursor-pointer
                                            transition-colors
                                            ${
                                                selectedRatio === ratio.value
                                                    ? 'border-cyan-400 bg-cyan-400/10'
                                                    : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                                            }`}
                                    >
                                        <IconComponent
                                            className={`h-6 w-6 mx-auto mb-2 ${selectedRatio === ratio.value ? 'text-cyan-500' : 'text-white'}`}
                                        />
                                        <div
                                            className={`text-xs ${selectedRatio === ratio.value ? 'text-cyan-500' : 'text-white'}`}
                                        >
                                            {ratio.label}
                                        </div>
                                        {ratio.ratio && (
                                            <div
                                                className={`text-xs ${selectedRatio === ratio.value ? 'text-cyan-700' : 'text-white/70'}`}
                                            >
                                                {ratio.ratio}
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Apply + Cancel */}
            <AnimatePresence>
                {isCropMode && (
                    <motion.div
                        className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-white/10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: 0.25, duration: 0.3 }}
                        layout={true}
                    >
                        {showSaveOptions ? (
                            <motion.div layoutId="save-cropped-img" className="flex">
                                <motion.button
                                    onClick={applyCrop}
                                    className="flex gap-2 flex-1 whitespace-nowrap hover:ring-1 ring-zinc-800 items-center justify-center rounded-md h-9 px-4 py-2 has-[>svg]:px-3"
                                    variant="glass"
                                >
                                    <CheckCheck className="h-4 w-4 mr-2" />
                                    Overwrite current
                                </motion.button>
                                <motion.button
                                    className="flex gap-2 flex-1 whitespace-nowrap hover:ring-1 ring-zinc-800 items-center justify-center rounded-md h-9 px-4 py-2 has-[>svg]:px-3 cursor-pointer"
                                    variant="glass"
                                    onClick={saveAsNew}
                                >
                                    <CheckCheck className="h-4 w-4 mr-2" />
                                    Save as new
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div
                                id="save-cropped-img"
                                onClick={() => setShowSaveOptions(true)}
                                layoutId="save-cropped-img"
                                className="flex gap-2 flex-1 hover:ring-1 ring-zinc-800 items-center justify-center rounded-md h-auto px-4 py-2 has-[>svg]:px-3 cursor-pointer"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                type="button"
                                transition={{ type: 'spring', bounce: 0.25, duration: 0.55 }}
                            >
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Save Image
                            </motion.div>
                        )}

                        <Button
                            onClick={handleCropCancel}
                            className="flex gap-2 flex-1"
                            variant="outline"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instructions */}
            <motion.div layout className="bg-slate-700/30 rounded-lg p-3">
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
            </motion.div>
        </div>
    );
});

export default CropContent;
