'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

export const TextHoverEffect = ({
    text,
    duration,
    fontsize = 'text-7xl',
    color = 'text-cyan-400',
}) => {
    const svgRef = useRef(null);
    const [hovered, setHovered] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [animationKey, setAnimationKey] = useState(0); // Key to force re-animation

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                const inView = entry.isIntersecting;
                setIsInView(inView);

                // Increment animation key when coming into view to restart animation
                if (inView) {
                    setAnimationKey(prev => prev + 1);
                }
            },
            {
                threshold: 0.2,
            }
        );

        if (svgRef.current) {
            observer.observe(svgRef.current);
        }
        return () => observer.disconnect();
    }, []);

    // Motion values for cx, cy
    const cx = useMotionValue('50%');
    const cy = useMotionValue('50%');

    const handleMouseMove = e => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const cxPercentage = ((e.clientX - rect.left) / rect.width) * 100;
        const cyPercentage = ((e.clientY - rect.top) / rect.height) * 100;
        cx.set(`${cxPercentage}%`);
        cy.set(`${cyPercentage}%`);
    };

    // Animation variants for better control
    const drawingAnimation = {
        hidden: {
            strokeDashoffset: 1000,
            strokeDasharray: 1000,
            opacity: 0,
        },
        visible: {
            strokeDashoffset: 0,
            strokeDasharray: 1000,
            opacity: 1,
        },
    };

    return (
        <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 300 100"
            xmlns="http://www.w3.org/2000/svg"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onMouseMove={handleMouseMove}
            className="select-none"
            style={{ opacity: isInView ? 1 : 0 }} // Hide when out of view
        >
            <defs>
                <linearGradient id="textGradient" gradientUnits="userSpaceOnUse">
                    {hovered && (
                        <>
                            <stop offset="0%" stopColor="#eab308" />
                            <stop offset="25%" stopColor="#ef4444" />
                            <stop offset="50%" stopColor="#3b82f6" />
                            <stop offset="75%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </>
                    )}
                </linearGradient>

                <motion.radialGradient
                    id="revealMask"
                    gradientUnits="userSpaceOnUse"
                    r="20%"
                    cx={cx}
                    cy={cy}
                    transition={{
                        duration: duration ?? 0,
                        ease: 'easeOut',
                        type: 'spring',
                        stiffness: 300,
                        damping: 50,
                    }}
                >
                    <stop offset="0%" stopColor="white" />
                    <stop offset="100%" stopColor="black" />
                </motion.radialGradient>

                <mask id="textMask">
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)" />
                </mask>
            </defs>

            {/* Stroke base - only visible when in view */}
            {isInView && (
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    strokeWidth="0.3"
                    className={cn(
                        'fill-transparent stroke-neutral-200 font-[helvetica] font-bold dark:stroke-neutral-800',
                        fontsize
                    )}
                    style={{ opacity: hovered ? 1 : 0 }}
                >
                    {text}
                </text>
            )}

            {/* Drawing animation - restarts each time component comes into view */}
            <motion.text
                key={animationKey} // Force re-mount to restart animation
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                stroke="currentColor"
                strokeWidth="0.3"
                className={cn(
                    'fill-transparent font-[helvetica] font-bold text-neutral-200 dark:text-neutral-800',
                    fontsize
                )}
                variants={drawingAnimation}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                transition={{
                    duration: 4,
                    ease: 'easeInOut',
                    opacity: { duration: 0.3 }, // Faster opacity transition
                }}
            >
                {text}
            </motion.text>

            {/* Gradient reveal - only visible when in view */}
            {isInView && (
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    stroke="url(#textGradient)"
                    strokeWidth="0.3"
                    mask="url(#textMask)"
                    className={cn('fill-transparent font-[helvetica] font-bold', fontsize)}
                >
                    {text}
                </text>
            )}
        </svg>
    );
};
