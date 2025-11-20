'use client';

import { Button } from '@/components/ui/button';
import { filters } from 'fabric';
import { RotateCcw } from 'lucide-react';
import React, { useState } from 'react';

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
    const [loading, setLoading] = useState(false);

    const resetFilters = () => {
        setFilterValues(DEFAULT_VALUES);
        // applyFilters(DEFAULT_VALUES);
    };

    const handleChange = (key, value) => {
        setFilterValues({ ...filterValues, [key]: value });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-white">Image Adjustments</h3>
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

            <div className="flex flex-col gap-4">
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
    const { key, label, min, max, step, defaultValue, filterClass, valueKey, transform, suffix } =
        config;

    const handleChange = e => {
        const { value } = e.target;
        onChange(key, value);
    };

    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-white">{label}</label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                className="mt-2 w-full"
            />
            <span className="text-xs text-white/70">
                {value}
                {suffix || ''}
            </span>
        </div>
    );
};
