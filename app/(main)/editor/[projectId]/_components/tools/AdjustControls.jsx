'use client';

import { Button } from '@/components/ui/button';
import { filters } from 'fabric';
import { RotateCcw } from 'lucide-react';
import React, { useState } from 'react';
import { AnimatedSlider } from '@/components/ui/animated-slider';
import useCanvasContext from '@/context/canvasContext/useCanvasContext';

const FILTER_CONFIGS = [
    {
        key: 'brightness',
        label: 'Brightness',
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        filterClass: filters.Brightness,
        valueKey: 'brightness',
        transform: value => value / 100,
    },
    {
        key: 'contrast',
        label: 'Contrast',
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        filterClass: filters.Contrast,
        valueKey: 'contrast',
        transform: value => value / 100,
    },
    {
        key: 'saturation',
        label: 'Saturation',
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        filterClass: filters.Saturation,
        valueKey: 'saturation',
        transform: value => value / 100,
    },
    {
        key: 'vibrance',
        label: 'Vibrance',
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        filterClass: filters.Vibrance,
        valueKey: 'vibrance',
        transform: value => value / 100,
    },
    {
        key: 'blur',
        label: 'Blur',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 0,
        filterClass: filters.Blur,
        valueKey: 'blur',
        transform: value => value / 100,
    },
    {
        key: 'hue',
        label: 'Hue',
        min: -180,
        max: 180,
        step: 1,
        defaultValue: 0,
        filterClass: filters.HueRotation,
        valueKey: 'rotation',
        transform: value => value * (Math.PI / 180),
        suffix: '°',
    },
];

const DEFAULT_VALUES = FILTER_CONFIGS.reduce((acc, config) => {
    acc[config.key] = config.defaultValue;
    return acc;
}, {});

const AdjustControls = () => {
    const [filterValues, setFilterValues] = useState(DEFAULT_VALUES);
    const [applying, setApplying] = useState(false);

    const { canvasEditor } = useCanvasContext();

    const resetFilters = () => {
        setFilterValues(DEFAULT_VALUES);
        applyFilters(DEFAULT_VALUES);
    };

    const applyFilters = value => {
        console.log(value);
    };

    const handleChange = (key, value) => {
        const newValue = { ...filterValues, [key]: Array.isArray(value) ? value[0] : value };
        setFilterValues(newValue);
        applyFilters(newValue);
    };

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
                <span className="text-md font-medium text-white">Image Adjustments</span>
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
                    <FilterControl
                        key={config.key}
                        config={config}
                        value={filterValues[config.key]}
                        onChange={handleChange}
                    />
                ))}
            </div>
        </div>
    );
};

export default AdjustControls;

const FilterControl = ({ config, value, onChange }) => {
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
};
