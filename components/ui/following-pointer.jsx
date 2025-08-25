// Core component that receives mouse positions and renders pointer and content

import React, { useEffect, useState } from 'react';

import { motion, AnimatePresence, useMotionValue } from 'motion/react';
import { cn } from '@/lib/utils';

export const FollowerPointerCard = ({ children, className, title, isMobile }) => {
    if (isMobile) {
        return <>{children}</>;
    }

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const ref = React.useRef(null);
    const [rect, setRect] = useState(null);
    const [isInside, setIsInside] = useState(false);
    const [isPointer, setIsPointer] = useState(false);

    const colors = ['#0ea5e9', '#14b8a6', '#22c55e', '#3b82f6', '#ef4444', '#eab308'];
    const [pointerColor, setPointerColor] = useState(colors[0]);

    useEffect(() => {
        if (ref.current) {
            setRect(ref.current.getBoundingClientRect());
        }
    }, []);

    useEffect(() => {
        if (ref.current) {
            setRect(ref.current.getBoundingClientRect());
        }
    }, []);

    const handleMouseMove = e => {
        if (rect) {
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;
            x.set(e.clientX - rect.left + scrollX);
            y.set(e.clientY - rect.top + scrollY);
        }

        // Detect pointer elements
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (
            el &&
            (el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('role') === 'button')
        ) {
            setIsPointer(true);
        } else {
            setIsPointer(false);
        }
    };
    const handleMouseLeave = () => {
        setIsInside(false);
    };

    const handleMouseEnter = () => {
        setIsInside(true);
        setPointerColor(colors[Math.floor(Math.random() * colors.length)]);
    };

    return (
        <div
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            style={{
                cursor: 'none',
            }}
            ref={ref}
            className={cn('relative', className)}
        >
            <AnimatePresence>
                {isInside && (
                    <FollowPointer
                        x={x}
                        y={y}
                        title={title}
                        color={pointerColor}
                        isPointer={isPointer}
                    />
                )}
            </AnimatePresence>
            {children}
        </div>
    );
};

export const FollowPointer = ({ x, y, title, transition, color, isPointer }) => {
    return (
        <motion.div
            className="fixed z-50 h-4 w-4 rounded-full"
            style={{ top: y, left: x, pointerEvents: 'none' }}
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 0, damping: 0 }}
        >
            <AnimatePresence mode="wait">
                {isPointer ? (
                    <motion.svg
                        key="pointer"
                        xmlns="http://www.w3.org/2000/svg"
                        width="34"
                        height="34"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-mouse-pointer-click-icon lucide-mouse-click-pointer -translate-x-[12px] -translate-y-[10px] transform mix-blend-difference"
                        style={{
                            color: color,
                            stroke: color,
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 3000, damping: 100 }}
                    >
                        <path d="M14 4.1 12 6" />
                        <path d="m5.1 8-2.9-.8" />
                        <path d="m6 12-1.9 2" />
                        <path d="M7.2 2.2 8 5.1" />
                        <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z" />
                    </motion.svg>
                ) : (
                    <motion.svg
                        key="normal"
                        xmlns="http://www.w3.org/2000/svg"
                        width="34"
                        height="34"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            color: color,
                            stroke: color,
                        }}
                        className="lucide lucide-mouse-pointer2-icon lucide-mouse-pointer-2 -translate-x-[12px] -translate-y-[10px] transform"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 3000, damping: 100 }}
                    >
                        <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
                    </motion.svg>
                )}
            </AnimatePresence>

            <motion.div
                style={{ backgroundColor: color }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className={
                    'min-w-max rounded-full bg-neutral-200 px-2 py-2 text-xs whitespace-nowrap text-white'
                }
            >
                {title || `PIXELLIFT`}
            </motion.div>
        </motion.div>
    );
};
