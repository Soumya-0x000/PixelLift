import { useEffect, useState, useCallback } from 'react';
import { filters } from 'fabric';
import useCanvasContext from '@/context/canvasContext/useCanvasContext';

export const FILTER_CONFIGS = [
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

export const useImageAdjust = () => {
    const [filterValues, setFilterValues] = useState(DEFAULT_VALUES);
    const { canvasEditor, setApplying, applying } = useCanvasContext();

    /**
     * Get the active image object from the canvas
     */
    const getActiveImage = useCallback(() => {
        if (!canvasEditor) return null;

        const activeObject = canvasEditor.getActiveObject();
        if (activeObject && activeObject.type === 'image') return activeObject;

        const objects = canvasEditor.getObjects();
        return objects.find(obj => obj.type === 'image') || null;
    }, [canvasEditor]);

    /**
     * Extract existing filter values from an image object
     */
    const extractExistingValues = useCallback(imgObj => {
        if (imgObj?.filters?.length > 0) {
            const extractedValues = { ...DEFAULT_VALUES };

            imgObj?.filters?.forEach(filter => {
                const config = FILTER_CONFIGS.find(
                    config => config.filterClass?.name === filter?.constructor?.name
                );
                if (config) {
                    const filterValue = filter[config.valueKey];

                    config.key === 'hue'
                        ? (extractedValues[config.key] = Math.round(filterValue * (180 / Math.PI)))
                        : (extractedValues[config.key] = Math.round(filterValue * 100));
                }
            });

            return extractedValues;
        }
        return DEFAULT_VALUES;
    }, []);

    /**
     * Apply filters to the active image
     */
    const applyFilters = useCallback(
        async data => {
            const imageObject = getActiveImage();
            if (!imageObject || applying) return;

            setApplying(true);
            try {
                const filtersToApply = [];

                FILTER_CONFIGS.forEach(config => {
                    const value = data[config?.key];
                    if (value === undefined) return;

                    if (value !== config.defaultValue) {
                        const transformedValue = config.transform(value);
                        const filter = new config.filterClass();
                        filter[config.valueKey] = transformedValue;
                        filtersToApply.push(filter);
                    }
                });

                imageObject.filters = filtersToApply;
                await new Promise(resolve => {
                    imageObject.applyFilters();
                    canvasEditor.requestRenderAll();
                    setTimeout(resolve, 50);
                });

                // Manually fire the 'object:modified' event to trigger auto-save
                canvasEditor.fire('object:modified', { target: imageObject });
            } catch (error) {
                console.error('Error applying filters:', error);
            } finally {
                setTimeout(() => {
                    setApplying(false);
                }, 300);
            }
        },
        [canvasEditor, getActiveImage, applying]
    );

    /**
     * Reset all filters to default values
     */
    const resetFilters = useCallback(() => {
        setFilterValues(DEFAULT_VALUES);
        applyFilters(DEFAULT_VALUES);
    }, [applyFilters]);

    /**
     * Handle filter value change
     */
    const handleChange = useCallback(
        (key, value) => {
            const newValue = { ...filterValues, [key]: Array.isArray(value) ? value[0] : value };
            setFilterValues(newValue);
            applyFilters(newValue);
        },
        [filterValues, applyFilters]
    );

    /**
     * Load existing filter values when canvas or image changes
     */
    useEffect(() => {
        const imgObj = getActiveImage();
        if (!imgObj) return;
        if (imgObj?.filters) {
            const existingValues = extractExistingValues(imgObj);
            setFilterValues(existingValues);
        }
    }, [canvasEditor, getActiveImage, extractExistingValues]);

    return {
        filterValues,
        canvasEditor,
        resetFilters,
        handleChange,
    };
};
