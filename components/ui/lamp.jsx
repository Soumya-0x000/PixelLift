'use client';
import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export const LampContainer = ({ children, className }) => {
    return (
        <div
            className={cn(
                'relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate- 950 w-full rounded-md z-0',
                className
            )}
        >
            <div className="relative flex w-full flex-1 scale-y- 125 items-center justify-center isolate z-0 ">
                <motion.div
                    initial={{ width: '8rem' }}
                    whileInView={{ width: '27rem' }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: 'easeInOut',
                    }}
                    className="absolute inset-auto z-30 h-36 w-64 -translate-y-[12rem] rounded-full bg-indigo-400 blur-2xl"
                ></motion.div>
                <motion.div
                    initial={{ width: 0, opacity: 0.7 }}
                    whileInView={{ width: '20rem', opacity: 1 }}
                    transition={{
                        delay: 0.3,
                        duration: 1.2,
                        ease: 'easeInOut',
                    }}
                    className="absolute left-1/2 top-4 -translate-x-1/2 z-40 h-36 rounded-full bg-blue-500 opacity-50 blur-3xl"
                />
                <motion.div
                    initial={{ width: 0, opacity: 0.7 }}
                    whileInView={{ width: '20rem', opacity: 1 }}
                    transition={{
                        delay: 0.3,
                        duration: 1.2,
                        ease: 'easeInOut',
                    }}
                    className="absolute left-1/2 -translate-x-1/2 z-30 h-36 -translate-y-[12rem] rounded-full bg-indigo-400 blur-2xl"
                />

                {/* The glowing bar */}
                <motion.div
                    initial={{ width: '15rem' }}
                    whileInView={{ width: '35rem' }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: 'easeInOut',
                    }}
                    className="absolute left-1/2 -translate-x-1/2 z-50 h-[0.25rem] w-[30rem] -translate-y-[12.82rem] bg-indigo-400"
                />
            </div>
            <div className="relative z-50 flex -translate-y-96 flex-col items-center px-5">
                {children}
            </div>
        </div>
    );
};
