'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import ColorChangingText from '@/components/ui/color-changing-text';
import { Compare } from '@/components/ui/compare';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const mainImg = '/media/cycling.jpg';
const removedBgImg = '/media/yellowbgCycling.jpg';

const AiBgMagic = React.memo(() => {
    return (
        <div className="flex flex-col xl:flex-row items-center justify-center gap-16 2xl:gap-24 my-10  max-w-[93%] mx-auto relative z-10">
            <motion.div
                initial={{ opacity: 0.5, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: 'easeInOut',
                }}
                className="flex flex-col items-center"
            >
                <div className=" bg-gradient-to-br leading-[6rem] from-slate-300 to-slate-500 bg-clip-text text-center text-4xl md:text-7xl font-medium tracking-wide text-transparent">
                    Step into the Future of <br /> AI Image {` `}
                    <ColorChangingText
                        text="Creation"
                        className="text-4xl md:text-7xl lg:text-7xl font-semibold"
                    />
                </div>

                <p className=" text-[1.15rem] max-w-2xl hyphens-auto mt-16 text-center text-slate-400">
                    A Neural Network powered image editing and generation tool that uses the power
                    of the multiverse to bring your imagination to life.
                </p>

                <Button
                    size="lg"
                    variant={'glass'}
                    className="mt-12 border-0 py-4 px-8 text-lg tracking-wider flex items-center justify-center gap-3 font-thin"
                    style={{ backgroundSize: '200% 200%' }}
                >
                    ENTER THE MULTIVERSE <ChevronRight className="w-7 h-7" />
                </Button>
            </motion.div>

            <motion.div
                className="p-4 border rounded-3xl dark:bg-neutral-900 bg-neutral-100  border-neutral-200 dark:border-neutral-800 px-4"
                initial={{ opacity: 0, y: -100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: 'easeInOut',
                }}
            >
                <Compare
                    firstImage={mainImg}
                    secondImage={removedBgImg}
                    firstImageClassName="object-cover object-left-top"
                    secondImageClassname="object-cover object-left-top"
                    className="h-[250px] w-[200px] md:h-[500px] md:w-[500px]"
                    slideMode="drag"
                />
            </motion.div>
        </div>
    );
});

export default AiBgMagic;
