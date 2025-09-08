'use client';

import React, { useEffect, useState } from 'react';
import { easeInOut, motion, useScroll, useTransform } from 'motion/react';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
    const { scrollYProgress } = useScroll();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollThreshold = 100;
            const scrollY = window.scrollY;
            console.log('Scroll Y:', scrollY);
            setIsVisible(scrollY > scrollThreshold);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
console.log(isVisible)
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const circumference = 2 * Math.PI * 22; // radius of 22
    const strokeDashoffset = useTransform(scrollYProgress, [0, 1], [circumference, 0]);

    const pathVariants = {
        hidden: {
            opacity: 0,
            pathLength: 0,
        },
        visible: {
            opacity: 1,
            pathLength: 1,
            transition: {
                pathLength: { delay: 0.5, type: 'spring', duration: 1.5, bounce: 0 },
                opacity: { delay: 0.5, duration: 0.01 },
            },
        },
    };

    return (
        <motion.div
            className="fixed right-10 bottom-10 z-50"
            // initial={{ opacity: 0, scale: 0.8 }}
            // animate={{
            //     opacity: isVisible ? 1 : 0,
            //     scale: isVisible ? 1 : 0.8,
            // }}
            transition={{ duration: 0.3 }}
        >
            <div className="relative">
                {/* Animated border circle */}
                <svg className="absolute inset-0 w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    {/* Background circle */}
                    <circle
                        cx="24"
                        cy="24"
                        r="22"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="2"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx="24"
                        cy="24"
                        r="22"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        // strokeDasharray={circumference}
                        // style={{ strokeDashoffset }}
                        variants={pathVariants}
                    />
                    {/* Gradient definition */}
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="50%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>
                </svg>

                <motion.button
                    className="cursor-pointer bg-black/90 rounded-full p-3"
                    onClick={scrollToTop}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-arrow-big-up-icon lucide-arrow-big-up text-cyan-400 "
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.path
                            variants={pathVariants}
                            strokeWidth={2}
                            size={5}
                            d="M9 13a1 1 0 0 0-1-1H5.061a1 1 0 0 1-.75-1.811l6.836-6.835a1.207 1.207 0 0 1 1.707 0l6.835 6.835a1 1 0 0 1-.75 1.811H16a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"
                        />
                    </motion.svg>
                </motion.button>
            </div>
        </motion.div>
    );
};

export default ScrollToTop;
