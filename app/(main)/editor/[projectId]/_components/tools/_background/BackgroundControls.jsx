import React, { memo, useState } from 'react';
import { useBackgroundChange } from './useBackgroundChnage';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    ColorPicker,
    ColorPickerAlpha,
    ColorPickerEyeDropper,
    ColorPickerFormat,
    ColorPickerHue,
    ColorPickerSelection,
} from '@/components/ui/shadcn-io/color-picker';

const bgTabs = [
    { id: 'color', name: 'Color' },
    { id: 'background', name: 'Background' },
];

const BackgroundControls = memo(() => {
    const { handleBackgroundRemoval, processingMessage, mainImage } = useBackgroundChange();
    const [selectedTab, setSelectedTab] = useState(bgTabs[0]);
    const [canvasBgColor, setCanvasBgColor] = useState('#ffffff');

    return (
        <div className="flex flex-col gap-y-2 relative h-full">
            {/* AI Background Removal Button - Outside of tabs */}
            <div className="flex flex-col pb-2 border-b border-white/10">
                <div>
                    <h3 className="text-sm font-medium text-white mb-2">AI Background Removal</h3>
                    <p className="text-xs text-white/70 mb-4">Automatically remove the background from your image using AI</p>
                </div>

                <Button onClick={handleBackgroundRemoval} disabled={processingMessage || !mainImage} className="w-full" variant="outline">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Image Background
                </Button>

                {!mainImage && <p className="text-xs text-amber-400">Please add an image to the canvas first to remove its background</p>}
            </div>

            <div className=" w-full ring-1 ring-white/10 rounded-md overflow-hidden flex items-center">
                {bgTabs.map(({ id, name }) => (
                    <button
                        key={id}
                        onClick={() => setSelectedTab(prev => ({ ...prev, id }))}
                        className={cn(
                            'relative px-3 py-1 border-none outline-none text-slate-200 hover:text-slate-300 transition-colors ring-1 ring-transparent cursor-pointer flex-1',
                            selectedTab?.id === id && 'text-slate-300 ring-0'
                        )}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {selectedTab?.id === id && (
                            <motion.div
                                layoutId="pilltab1"
                                transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                                className="absolute inset-0 bg-linear-to-r from-slate-800/80 via-slate-700/60 to-slate-800/80 z-0"
                            />
                        )}
                        <span className="relative block z-10">{name}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 ring-1 ring-zinc-800 rounded-md overflow-auto">
                {selectedTab?.id === 'color' && (
                    <ColorPicker
                        className="max-w-sm rounded-md border bg-background p-4 shadow-sm"
                        defaultValue="#ffffff"
                        // onChange={setCanvasBgColor}
                    >
                        <ColorPickerSelection />
                        <div className="flex items-center gap-4">
                            <ColorPickerEyeDropper />
                            <div className="grid w-full gap-1">
                                <ColorPickerHue />
                                <ColorPickerAlpha />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <ColorPickerFormat readOnly={false} />
                            <Button variant="outline" className="py-1">
                                Apply
                            </Button>
                        </div>
                    </ColorPicker>
                )}
            </div>
        </div>
    );
});
BackgroundControls.displayName = 'BackgroundControls';

export default BackgroundControls;
