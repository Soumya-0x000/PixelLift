'use client';

import { motion } from 'motion/react';
import { CometCard } from '@/components/ui/comet-card';
import { PointerHighlight } from '@/components/ui/pointer-highlight';
import { Button } from '@/components/ui/button';

const BrandingSection = () => {
    return (
        <section className="py-32 px-4 relative flex justify-center items-center overflow-hidden">
            <CometCard shouldGlow={false}>
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-16 relative overflow-hidden"
                    >
                        <motion.div
                            className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent relative z-10 flex flex-col justify-center items-center leading-[5rem] text-center gap-5"
                            animate={{
                                scale: [1, 1.02, 1],
                            }}
                            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                        >
                            READY TO BECOME OMNIPOTENT ?
                        </motion.div>

                        <div className="text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed relative z-10">
                            Join the
                            <PointerHighlight
                                rectangleClassName="bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700 leading-loose"
                                pointerClassName="text-yellow-500 h-3 w-3"
                                containerClassName="inline-block ml-1"
                            >
                                <span className="relative z-10 px-1">digital deities</span>
                            </PointerHighlight>
                            {` `}who have transcended the boundaries of
                            <PointerHighlight
                                rectangleClassName="bg-pink-100 dark:bg-pink-900 border-pink-300 dark:border-pink-700 leading-loose"
                                pointerClassName="text-pink-500 h-3 w-3"
                                containerClassName="inline-block ml-1"
                            >
                                <span className="relative z-10 px-1">reality itself</span>
                            </PointerHighlight>
                            {` .`}
                        </div>

                        <div className="relative z-10 hover:scale-[1.05] active:scale-[0.95] transition-transform duration-200">
                            <Button
                                size="lg"
                                variant={'gradient'}
                                className="magnetic bg-gradient-to-r from-blue-500 via-p urple-600 to-cyan-500 text-white border-0 px-16 py-8 text-2xl font-black shadow-2xl"
                            >
                                <span className="flex items-center gap-4 font-poppins">
                                    🌟 ASCEND TO GODHOOD
                                </span>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </CometCard>
        </section>
    );
};

export default BrandingSection;
