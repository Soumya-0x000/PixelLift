'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { forwardRef, useState } from 'react';

const AnimatedSlider = forwardRef(
    ({ className, min, max, step, value, onValueChange, formatLabel, ...props }, ref) => {
        const [isHovered, setIsHovered] = useState(false);
        const [isDragging, setIsDragging] = useState(false);

        const handleValueChange = newValue => {
            if (onValueChange) {
                onValueChange(newValue);
            }
        };

        return (
            <SliderPrimitive.Root
                ref={ref}
                min={min}
                max={max}
                step={step}
                value={[value]}
                onValueChange={vals => handleValueChange(vals[0])}
                onPointerDown={() => setIsDragging(true)}
                onPointerUp={() => setIsDragging(false)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    'relative flex w-full touch-none items-center select-none h-10',
                    className
                )}
                {...props}
            >
                <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/20">
                    <SliderPrimitive.Range className="absolute h-full bg-white" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb
                    className="block h-5 w-5 rounded-full border-2 border-white bg-black ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    asChild
                >
                    <motion.div
                        animate={{
                            scale: isDragging ? 1.2 : isHovered ? 1.1 : 1,
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <AnimatePresence>
                            {(isHovered || isDragging) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: -30, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded border border-white/20 whitespace-nowrap pointer-events-none"
                                >
                                    {formatLabel ? formatLabel(value) : value}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </SliderPrimitive.Thumb>
            </SliderPrimitive.Root>
        );
    }
);
AnimatedSlider.displayName = 'AnimatedSlider';

export { AnimatedSlider };
