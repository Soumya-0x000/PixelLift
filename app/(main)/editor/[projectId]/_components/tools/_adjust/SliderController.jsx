import { AnimatedSlider } from '@/components/ui/animated-slider';
import { memo } from 'react';

export const SliderController = memo(({ config, value, onChange }) => {
    const { key, label, min, max, step, suffix } = config;

    const handleValueChange = newValue => {
        onChange(key, newValue);
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-white">{label}</label>
                <span className="text-xs text-white/70 font-mono">
                    {value}
                    {suffix || ''}
                </span>
            </div>
            <AnimatedSlider
                min={min}
                max={max}
                step={step}
                value={value}
                onValueChange={handleValueChange}
                formatLabel={val => `${val}${suffix || ''}`}
            />
        </div>
    );
});
SliderController.displayName = 'SliderController';
