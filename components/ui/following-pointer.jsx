import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

export const FollowerPointerCard = ({ children, className, title, isMobile }) => {
    if (isMobile) {
        return <>{children}</>;
    }

    // Optimized springs with lower stiffness for better performance
    const x = useSpring(0, { stiffness: 200, damping: 30 });
    const y = useSpring(0, { stiffness: 200, damping: 30 });

    const ref = useRef(null);
    const [isInside, setIsInside] = useState(false);
    const [isPointer, setIsPointer] = useState(false);

    // Performance optimization refs
    const rafId = useRef(null);
    const pointerCheckTime = useRef(0);
    const cachedCursorElements = useRef(new WeakMap());

    const colors = ['#0ea5e9', '#14b8a6', '#22c55e', '#3b82f6', '#ef4444', '#eab308'];
    const [pointerColor, setPointerColor] = useState(colors[0]);

    // Check if element is clickable (with caching)
    const isClickableElement = useCallback(el => {
        if (!el) return false;

        // Check cache first
        if (cachedCursorElements.current.has(el)) {
            return cachedCursorElements.current.get(el);
        }

        const isClickable =
            el.tagName === 'BUTTON' ||
            el.tagName === 'A' ||
            el.getAttribute('role') === 'button' ||
            el.style.cursor === 'pointer' ||
            window.getComputedStyle(el).cursor === 'pointer';

        // Cache the result
        cachedCursorElements.current.set(el, isClickable);
        return isClickable;
    }, []);

    // Optimized mouse move handler using RAF
    const handleMouseMove = useCallback(
        e => {
            // Cancel previous RAF if still pending
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
            }

            // Batch updates using RAF for smooth 60fps
            rafId.current = requestAnimationFrame(() => {
                // Update position immediately for smooth tracking
                x.set(e.clientX);
                y.set(e.clientY);

                const now = Date.now();

                // Throttle pointer detection to every 100ms (reduced frequency)
                if (now - pointerCheckTime.current > 100) {
                    pointerCheckTime.current = now;

                    const el = document.elementFromPoint(e.clientX, e.clientY);
                    const isPointerElement = isClickableElement(el);

                    setIsPointer(isPointerElement);
                }
            });
        },
        [x, y, isClickableElement]
    );

    const handleMouseLeave = useCallback(() => {
        setIsInside(false);
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
        }
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsInside(true);
        setPointerColor(colors[Math.floor(Math.random() * colors.length)]);
    }, []);

    // Cleanup RAF on unmount
    useEffect(() => {
        return () => {
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
            }
        };
    }, []);

    return (
        <div
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            style={{ cursor: 'none' }}
            ref={ref}
            className={cn('relative', className)}
        >
            <AnimatePresence>{isInside && <FollowPointer x={x} y={y} title={title} color={pointerColor} isPointer={isPointer} />}</AnimatePresence>
            {children}
        </div>
    );
};

export const FollowPointer = ({ x, y, title, color, isPointer }) => {
    return (
        <motion.div
            className="fixed z-9999 h-4 w-4 rounded-full"
            style={{
                top: y,
                left: x,
                pointerEvents: 'none',
                willChange: 'transform',
            }}
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
        >
            <AnimatePresence mode="wait">
                {isPointer ? (
                    <motion.svg
                        key="pointer"
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-mouse-pointer-click -translate-x-[12px] -translate-y-[10px]"
                        style={{
                            color: color,
                            stroke: color,
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.1 }}
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
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            color: color,
                            stroke: color,
                        }}
                        className="lucide lucide-mouse-pointer-2 -translate-x-[12px] -translate-y-[10px]"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.1 }}
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
                className={'min-w-max rounded-full bg-neutral-200 px-2 py-2 text-xs whitespace-nowrap text-white'}
            >
                {title || `PIXELLIFT`}
            </motion.div>
        </motion.div>
    );
};
