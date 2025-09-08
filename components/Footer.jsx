'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TextHoverEffect } from './ui/text-hover-effect';
import { AnimatedGradientText } from './magicui/animated-gradient-text';
import { FlipWords } from './ui/flip-words';
import { WordRotate } from './magicui/word-rotate';

const Footer = React.memo(() => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: 'easeOut',
            },
        },
    };

    const socialVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: 'easeOut',
            },
        },
        hover: {
            scale: 1.1,
            transition: {
                duration: 0.2,
            },
        },
    };

    return (
        <motion.footer
            className="bg-gradient-to-t from-black via-black/50 to-transparent pt-16 pb-10 px-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <TextHoverEffect text="PixelLift" duration={0.5} fontsize="text-[3.8rem]" />
            <div className="max-w-6xl mx-auto">
                {/* Bottom Bar */}
                <motion.div
                    className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center"
                    variants={itemVariants}
                >
                    <motion.p
                        className="text-gray-500 text-sm mb-4 md:mb-0"
                        variants={itemVariants}
                    >
                        © 2025 PixelLift. All rights reserved.
                    </motion.p>

                    <motion.div className="flex space-x-6" variants={containerVariants}>
                        <motion.span
                            className="text-gray-500 hover:text-white flex gap-2 items-center w-fit text-sm transition-colors"
                            variants={itemVariants}
                            whileHover={{ y: -2 }}
                        >
                            Built with
                            <WordRotate
                                className={'scale-115'}
                                words={['❤️', '💕', '💖', '💘', '💓', '💗', '💝', '💞', '❣️']}
                                duration={1500}
                                motionProps={{
                                    initial: { opacity: 0, y: -25 },
                                    animate: { opacity: 1, y: 0 },
                                    exit: { opacity: 0, y: 15 },
                                    transition: { duration: 0.25, ease: 'easeOut' },
                                }}
                            />
                            by Soumya
                        </motion.span>
                    </motion.div>
                </motion.div>

                {/* Animated Background Elements */}
                <motion.div
                    className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    viewport={{ once: true }}
                />
            </div>
        </motion.footer>
    );
});

Footer.displayName = 'Footer';

export default Footer;
