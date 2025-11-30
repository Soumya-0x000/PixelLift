'use client';

import { Button } from '@/components/ui/button';
import { RotateCcw, Loader2 } from 'lucide-react';
import { memo } from 'react';
import { SliderController } from './SliderController';
import { useImageAdjust, FILTER_CONFIGS } from './useImageAdjust';

const AdjustControls = memo(() => {
    const { filterValues, processing, canvasEditor, resetFilters, handleChange } = useImageAdjust();

    if (!canvasEditor) {
        return (
            <div className="space-y-6">
                <p className="text-white/70">Select an image to apply filters</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center ">
                <div className="flex items-center gap-2">
                    <span className="text-md font-medium text-white">Image Adjustments</span>
                    {processing && <Loader2 className="h-4 w-4 text-white/70 animate-spin" />}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-white/70 hover:text-white"
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                </Button>
            </div>

            <div className="flex flex-col gap-6 ring-1 rounded-md p-3 ring-slate-800/50 bg-slate-900/20">
                {FILTER_CONFIGS.map(config => (
                    <SliderController
                        key={config.key}
                        config={config}
                        value={filterValues[config.key]}
                        onChange={handleChange}
                    />
                ))}
            </div>
        </div>
    );
});

AdjustControls.displayName = 'AdjustControls';

export default AdjustControls;
