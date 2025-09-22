'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TextHoverEffect } from './ui/text-hover-effect';
import { WordRotate } from './magicui/word-rotate';

const Footer = React.memo(() => {
    return (
        <footer className="bg-gradient-to-t from-black via-black/50 to-transparent pt-16 pb-10 px-8 relative overflow-hidden">
            <TextHoverEffect text="PixelLift" duration={0.5} fontsize="text-[3.8rem]" />

            <div className="max-w-6xl mx-auto">
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-gray-400 text-sm">
                        © 2025 PixelLift. All rights reserved.
                    </div>

                    <span className="text-gray-400 hover:text-white flex gap-2 items-center w-fit text-sm transition-colors">
                        Built with
                        <WordRotate
                            className={'scale-115'}
                            words={['❤️', '💕', '💖', '💘', '💓', '💗', '💝', '💞', '❣️']}
                            duration={1500}
                            motionProps={{
                                initial: { opacity: 0, y: -15 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: 10 },
                                transition: { duration: 0.25, ease: 'easeOut' },
                            }}
                        />
                        by Soumya
                    </span>
                </div>

                {/* Animated Background Elements */}
                <motion.div
                    className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    viewport={{ once: true }}
                />
            </div>
        </footer>
    );
});

Footer.displayName = 'Footer';

export default Footer;
