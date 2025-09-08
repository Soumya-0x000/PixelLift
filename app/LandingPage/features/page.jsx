'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Eraser, Expand, Layers, Palette, Sparkles, Wand2 } from 'lucide-react';
import { CardSpotlight } from '@/components/ui/card-spotlight';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import ColorChangingText from '@/components/ui/color-changing-text';

const Features = React.memo(() => {
    const [hoverIndex, setHoverIndex] = useState(null);
    const [hasEverHovered, setHasEverHovered] = useState(false);

    const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.2 });

    useEffect(() => {
        if (!isIntersecting) setHasEverHovered(false);
    }, [isIntersecting]);

    const featureGridVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.25,
            },
        },
    };

    const featureCardVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
    };

    const features = [
        {
            title: 'Neural Quantum Removal',
            description:
                'Harness the power of quantum AI to obliterate backgrounds with subatomic precision, leaving only pure perfection',
            delay: 0.1,
            icon: <Wand2 size={27} />,
            iconColor: 'text-cyan-400',
        },
        {
            title: 'Infinity Upscaling Engine',
            description:
                'Transcend resolution limits with our reality-bending upscaling that creates detail from the quantum foam itself',
            delay: 0.2,
            icon: <Expand size={27} />,
            iconColor: 'text-purple-400',
        },
        {
            title: 'Dimensional Style Fusion',
            description:
                'Merge artistic dimensions in real-time, transforming images through parallel universe style matrices',
            delay: 0.3,
            icon: <Layers size={27} />,
            iconColor: 'text-blue-400',
        },
        {
            title: 'Temporal Object Erasure',
            description:
                'Rewrite visual history by removing objects across spacetime, healing reality with impossible precision',
            delay: 0.4,
            icon: <Eraser size={27} />,
            iconColor: 'text-pink-400',
        },
        {
            title: 'Chromatic Harmony Matrix',
            description:
                'Orchestrate color symphonies that resonate with the fundamental frequencies of visual perfection',
            delay: 0.5,
            icon: <Palette size={27} />,
            iconColor: 'text-green-400',
        },
        {
            title: 'Omnipotent Enhancement',
            description:
                'Achieve godlike image perfection with a single quantum click that rewrites the laws of photography',
            delay: 0.6,
            icon: <Sparkles size={27} />,
            iconColor: 'text-yellow-400',
        },
    ];

    return (
        <section id="features" className="py-32 px-4 max-w-7xl mx-auto relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-center mb-20"
            >
                <ColorChangingText text="OMNIPOTENT ABILITIES" />
                <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
                    Wield powers that reshape the very fabric of digital reality itself
                </p>
            </motion.div>

            <motion.div
                ref={ref}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                variants={featureGridVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
            >
                {features.map((feature, index) => {
                    const isHovered = hoverIndex === index;

                    return (
                        <motion.div
                            key={index}
                            variants={featureCardVariants}
                            onMouseEnter={() => {
                                setHoverIndex(index);
                                if (!hasEverHovered) setHasEverHovered(true);
                            }}
                            onMouseLeave={() => setHoverIndex(null)}
                            className={`${hasEverHovered ? 'transition-all duration-300' : ''} ${
                                isHovered ? '' : hoverIndex !== null ? 'scale-95 opacity-70' : ''
                            }`}
                        >
                            <CardSpotlight
                                className="backdrop-blur-2xl bg-gradient-to-br from-slate-800/40 to-black/30 p-5 transition-all duration-500 group overflow-hidden relative h-full"
                                color={feature?.iconColor}
                            >
                                <div
                                    className={`mb-4 ${hoverIndex === index ? feature?.iconColor : 'text-slate-500'}`}
                                >
                                    {feature?.icon}
                                </div>

                                <h3
                                    className={`text-[1.4rem] font-semibold text-white mb-3 relative transition-all duration-500 z-10`}
                                >
                                    {feature?.title}
                                </h3>

                                <p className="text-white/80 text-md leading-relaxed relative z-10 hyphens-auto">
                                    {feature?.description}
                                </p>
                            </CardSpotlight>
                        </motion.div>
                    );
                })}
            </motion.div>
        </section>
    );
});

export default Features;
