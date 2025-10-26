'use client';

import { memo, useCallback, useLayoutEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Variants for overlay backdrop
const overlayVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.4,
            ease: 'easeIn',
        },
    },
};

const GotoDesktopWarning = memo(({ screenSize = 1100 }) => {
    const [isDeskTopMode, setIsDeskTopMode] = useState(true);

    const handleResize = useCallback(() => {
        if (window.innerWidth < screenSize) setIsDeskTopMode(false);
        else setIsDeskTopMode(true);
    }, [screenSize]);

    useLayoutEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    return (
        <AnimatePresence>
            {!isDeskTopMode && (
                <motion.div
                    className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900 z-50 flex flex-col items-center justify-center backdrop-blur-xl"
                    variants={overlayVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    {/* Animated gradient orbs in background */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                        <motion.div
                            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
                            animate={{
                                scale: [1.2, 1, 1.2],
                                opacity: [0.5, 0.3, 0.5],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                    </div>

                    {/* Main content */}
                    <div className="relative z-10 flex flex-col items-center">
                        {/* Icon container with gradient border */}
                        <motion.div
                            className="relative p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-white/10"
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                type: 'spring',
                                stiffness: 200,
                                damping: 20,
                                duration: 0.8,
                            }}
                        >
                            {/* Glow effect */}
                            <motion.div
                                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 blur-xl"
                                animate={{
                                    opacity: [0.3, 0.6, 0.3],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />

                            <motion.svg
                                width="200"
                                height="200"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                animate={{
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                opacity={1}
                            >
                                {/* Gradients */}
                                <defs>
                                    <linearGradient
                                        id="monitorGradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="100%"
                                    >
                                        <stop offset="0%" stopColor="#a855f7" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                    <linearGradient
                                        id="checkGradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                    >
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>

                                {/* Monitor rectangle */}
                                <motion.rect
                                    width="20"
                                    height="14"
                                    x="2"
                                    y="3"
                                    rx="1.4"
                                    stroke="url(#monitorGradient)"
                                    strokeWidth="1.5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1.1, opacity: 1 }}
                                    transition={{
                                        pathLength: { duration: 1, ease: 'easeInOut' },
                                        opacity: { duration: 0.3 },
                                    }}
                                    className={`z-10`}
                                />

                                {/* Monitor stand - Combined as single path */}
                                <motion.path
                                    d="M12 17 V22 M7 22 H17"
                                    stroke="url(#monitorGradient)"
                                    strokeWidth="1.5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{
                                        pathLength: {
                                            delay: 0.3,
                                            duration: 0.6,
                                            ease: 'easeInOut',
                                        },
                                        opacity: { delay: 0.3, duration: 0.2 },
                                    }}
                                />

                                {/* Checkmark with gradient */}
                                <motion.path
                                    d="m9 10 2 2 4-4"
                                    stroke="url(#checkGradient)"
                                    strokeWidth="1.5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{
                                        pathLength: {
                                            delay: 0.9,
                                            duration: 0.6,
                                            ease: 'easeInOut',
                                        },
                                        opacity: { delay: 0.9, duration: 0.2 },
                                    }}
                                />

                                {/* Animated scan line effect */}
                                <motion.line
                                    x1="4"
                                    y1="10"
                                    x2="20"
                                    y2="10"
                                    stroke="#06b6d4"
                                    strokeWidth="0.5"
                                    opacity="0.5"
                                    initial={{ y1: 5, y2: 5 }}
                                    animate={{ y1: [5, 15, 5], y2: [5, 15, 5] }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                        delay: 1.2,
                                    }}
                                />
                            </motion.svg>
                        </motion.div>

                        {/* Text content */}
                        <motion.div
                            className="mt-10 text-center px-6 max-w-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 1,
                                duration: 0.6,
                                ease: 'easeOut',
                            }}
                        >
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-3">
                                Desktop Mode Required
                            </h2>
                            <p className="text-slate-300 text-base leading-relaxed">
                                Please switch to a desktop or larger screen to access the full
                                editing experience.
                            </p>
                        </motion.div>

                        {/* Animated arrow indicator */}
                        <motion.div
                            className="mt-8 flex items-center gap-2 text-purple-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                        >
                            <motion.svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                animate={{ x: [-5, 0, -5] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                            </motion.svg>
                            <span className="text-sm font-medium">
                                Minimum width: {screenSize}px
                            </span>
                        </motion.div>
                    </div>

                    {/* Floating particles */}
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 rounded-full"
                            style={{
                                background: i % 2 === 0 ? '#a855f7' : '#3b82f6',
                                left: `${15 + i * 10}%`,
                                top: `${20 + (i % 4) * 15}%`,
                            }}
                            animate={{
                                y: [-30, 30, -30],
                                opacity: [0, 0.8, 0],
                                scale: [0, 1.5, 0],
                            }}
                            transition={{
                                duration: 3 + i * 0.4,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: i * 0.4,
                            }}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
});

GotoDesktopWarning.displayName = 'GotoDesktopWarning';

export default GotoDesktopWarning;
