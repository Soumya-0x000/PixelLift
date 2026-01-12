'use client';

import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import React from 'react';

const ColorChangingText = React.memo(({ text, className, children }) => {
    const content = children ?? text;

    if (!content) return null;

    return (
        <motion.span
            className={cn(
                'text-5xl md:text-7xl lg:text-8xl font-black leading-tight',
                className
            )}
            style={{
                background: 'linear-gradient(45deg, #00ffff, #0080ff, #8000ff, #ff0080, #00ffff)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(0, 255, 255, 0.3)',
            }}
            animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'linear',
            }}
        >

            {content}
        </motion.span>
    );
});

export default ColorChangingText;
