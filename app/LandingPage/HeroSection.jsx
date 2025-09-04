'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FollowerPointerCard, FollowPointer } from '../../components/ui/following-pointer';
import useStoreUser from '@/hooks/useStoreUser';
import { CometCard } from '../../components/ui/comet-card';
import { PointerHighlight } from '../../components/ui/pointer-highlight';
import BrandingSection from './branding/page';
import { FlipWords } from '@/components/ui/flip-words';
import { MorphingText } from '@/components/magicui/morphing-text';
import { CardSpotlight } from '@/components/ui/card-spotlight';
import {
    Wand2,
    Expand,
    Layers,
    Eraser,
    Palette,
    Sparkles,
    MoveRight,
    ChevronRight,
    File,
    Settings,
    Search,
    Image,
    Crop,
    Filter,
    Download,
    Upload,
    Zap,
    Eye,
    Brush,
    Scissors,
    RotateCcw,
    Maximize,
} from 'lucide-react';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { cn } from '@/lib/utils';
import { OrbitingCircles } from '@/components/magicui/orbiting-circles';

const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [options]);

    return [ref, isIntersecting];
};

const HolographicHero = () => {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, -150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    const words = [
        'Transform ordinary photos into masterpieces',
        'Unleash impossible visual perfection',
        'Bend reality with quantum precision',
        'Elevate your images to divine quality',
        'Rewrite the rules of modern digital artistry',
    ];

    return (
        <motion.section
            className="h-screen flex flex-col gap-10 items-center justify-center relative overflow-hidden"
            style={{ y, opacity }}
        >
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 10,
                    delay: 0.6,
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                }}
                className="z-10"
            >
                <HoverBorderGradient
                    containerClassName="rounded-full mt-[5rem] tracking-wide text-[0.9rem] p-0"
                    as="button"
                    className="group dark:bg-black bg-white text-slate-800 dark:text-slate-400 flex items-center gap-x-3"
                >
                    <motion.div
                        animate={{
                            color: ['#00ffff', '#0080ff', '#8000ff', '#ff0080', '#00ffff'],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        className=" border-r-2 border-gray-600 pr-3 flex items-center justify-center"
                    >
                        <Sparkles className="w-[1rem] h-[1rem]" />
                    </motion.div>
                    <span className=" flex items-center gap-2">
                        Introduction to PixelLift
                        <ChevronRight className="w-[1.2rem] h-[1.2rem] group-hover:translate-x-2 transition-all duration-500 text-gray-500" />
                    </span>
                </HoverBorderGradient>
            </motion.div>

            <div className="text-center z-10 relative">
                {/* Main Content */}
                <div className="text-center z-10 relative min-w-[80rem] w-[78vw">
                    {/* Holographic Frame */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 1.2,
                            delay: 0.3,
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                        }}
                        layout
                        className="relative p-12 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-white/5 via-white/2 to-transparent border border-cyan-500/20 shadow-2xl "
                    >
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-400 rounded-tl-3xl"></div>
                        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-400 rounded-tr-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-400 rounded-bl-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-400 rounded-br-3xl"></div>

                        {/* Pulsing Border Effect */}
                        <motion.div
                            className="absolute inset-0 rounded-3xl border border-cyan-400/30"
                            animate={{
                                boxShadow: [
                                    '0 0 20px rgba(0, 255, 255, 0.3)',
                                    '0 0 40px rgba(0, 255, 255, 0.6)',
                                    '0 0 20px rgba(0, 255, 255, 0.3)',
                                ],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />

                        <MorphingText
                            texts={words}
                            morphTime={1.5}
                            cooldownTime={0.9}
                            className={`h-48 text-[4rem] leading-[5rem] bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent`}
                        />

                        {/* Status Indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="flex items-center justify-center gap-2 mb-6"
                        >
                            <motion.div
                                className="w-3 h-3 rounded-full bg-green-400"
                                animate={{
                                    opacity: [1, 0.3, 1],
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />
                            <span className="text-green-400 font-mono text-sm tracking-wider">
                                NEURAL NETWORK ONLINE
                            </span>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1 }}
                            className="text-xl md:text-2xl text-gray-400 mb-8 max-w-4xl mx-auto leading-relaxed font-light"
                        >
                            <span className="text-cyan-400 font-medium">Quantum-Enhanced</span>{' '}
                            image processing that transcends
                            <br />
                            the boundaries of conventional AI enhancement
                        </motion.p>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
};

const QuantumCounter = ({ target, duration = 2000, suffix = '', label }) => {
    const [count, setCount] = useState(0);
    const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.5 });
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (!isIntersecting) return;

        let startTime;
        const animate = currentTime => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            setCount(Math.floor(progress * target));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                const newParticles = Array.from({ length: 20 }, (_, i) => ({
                    id: Date.now() + i,
                    angle: (i / 20) * 360,
                    distance: Math.random() * 100 + 50,
                }));
                setParticles(newParticles);
                setTimeout(() => setParticles([]), 2000);
            }
        };

        requestAnimationFrame(animate);
    }, [isIntersecting, target, duration]);

    return (
        <div ref={ref} className="text-center relative">
            {/* Particle explosion */}
            {particles.map(particle => (
                <motion.div
                    key={particle.id}
                    className="absolute w-2 h-2 bg-blue-400 rounded-full top-1/2 left-1/2"
                    initial={{
                        x: 0,
                        y: 0,
                        opacity: 1,
                        scale: 1,
                    }}
                    animate={{
                        x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
                        y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
                        opacity: 0,
                        scale: 0,
                    }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                />
            ))}

            <motion.div
                className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2"
                animate={{
                    scale: count === target ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.5 }}
            >
                {count.toLocaleString()}
                {suffix}
            </motion.div>
            <p className="text-white/80 text-lg font-medium">{label}</p>
        </div>
    );
};

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
                <ColorChangingTextAnimation text="OMNIPOTENT ABILITIES" />
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
                                className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 p-5 transition-all duration-500 group overflow-hidden relative h-full"
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

const Counter = React.memo(({ from = 0, to, duration = 2000, suffix = '' }) => {
    return (
        <section className="py-32 px-4 relative">
            <motion.div
                className="absolute inset-0"
                animate={{
                    background: [
                        'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                        'radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
                        'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
                    ],
                }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
            />

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        REALITY STATISTICS
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <QuantumCounter target={10000000} suffix="+" label="Realities Transformed" />
                    <QuantumCounter target={500000} suffix="+" label="Digital Gods Created" />
                    <QuantumCounter target={100} suffix="%" label="Universe Satisfaction" />
                </div>
            </div>
        </section>
    );
});

const HolographicPricingCard = ({ plan, price, features, featured, buttonText, index }) => {
    const [isHovered, setIsHovered] = useState(false);

    const cardVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.8,
                delay: index * 0.2,
                type: 'spring',
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{
                scale: featured ? 1.05 : 1.03,
                y: -10,
                rotateY: 5,
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={`relative group ${featured ? 'md:scale-110' : ''}`}
        >
            {/* Floating Particles for each card */}
            {/* <FloatingParticles count={featured ? 20 : 15} /> */}

            {/* Holographic Border Effect */}
            <motion.div
                className={`absolute inset-0 rounded-3xl ${
                    featured
                        ? 'bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-blue-500/20'
                        : 'bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10'
                }`}
                animate={{
                    boxShadow: isHovered
                        ? featured
                            ? [
                                  '0 0 30px rgba(0, 255, 255, 0.4)',
                                  '0 0 60px rgba(147, 51, 234, 0.6)',
                                  '0 0 30px rgba(0, 255, 255, 0.4)',
                              ]
                            : [
                                  '0 0 20px rgba(0, 255, 255, 0.3)',
                                  '0 0 40px rgba(0, 255, 255, 0.5)',
                                  '0 0 20px rgba(0, 255, 255, 0.3)',
                              ]
                        : featured
                          ? [
                                '0 0 20px rgba(0, 255, 255, 0.3)',
                                '0 0 40px rgba(147, 51, 234, 0.4)',
                                '0 0 20px rgba(0, 255, 255, 0.3)',
                            ]
                          : '0 0 10px rgba(0, 255, 255, 0.2)',
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Main Card Content */}
            <div
                className={`relative backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border ${
                    featured ? 'border-cyan-400/40' : 'border-cyan-500/20'
                } rounded-3xl p-8 h-full transition-all duration-500`}
            >
                {/* Featured Badge */}
                {featured && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.2 }}
                        className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                    >
                        <div className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold tracking-wider shadow-lg">
                            <motion.span
                                animate={{
                                    textShadow: [
                                        '0 0 10px rgba(0, 255, 255, 0.8)',
                                        '0 0 20px rgba(147, 51, 234, 0.8)',
                                        '0 0 10px rgba(0, 255, 255, 0.8)',
                                    ],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                MOST POPULAR
                            </motion.span>
                        </div>
                    </motion.div>
                )}

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-cyan-400/60 rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="text-center">
                    {/* Plan Name */}
                    <motion.h3
                        className={`text-2xl font-black mb-4 ${
                            featured
                                ? 'bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent'
                                : 'text-cyan-400'
                        }`}
                        animate={
                            featured
                                ? {
                                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                                  }
                                : {}
                        }
                        style={featured ? { backgroundSize: '200% 200%' } : {}}
                        transition={
                            featured
                                ? {
                                      duration: 3,
                                      repeat: Infinity,
                                      ease: 'linear',
                                  }
                                : {}
                        }
                    >
                        {plan.toUpperCase()}
                    </motion.h3>

                    {/* Price */}
                    <div className="mb-8">
                        <motion.div
                            className="flex items-baseline justify-center gap-2"
                            whileHover={{ scale: 1.05 }}
                        >
                            <span className="text-6xl font-black text-white">${price}</span>
                            <span className="text-gray-400 font-mono">/month</span>
                        </motion.div>

                        {/* Price Glow Effect */}
                        <motion.div
                            className={`absolute left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full blur-xl opacity-20 ${
                                featured
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500'
                                    : 'bg-cyan-500'
                            }`}
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.3, 0.1],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                    </div>

                    {/* Features List */}
                    <div className="mb-8 space-y-4">
                        {features.map((feature, featureIndex) => (
                            <motion.div
                                key={featureIndex}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + index * 0.2 + featureIndex * 0.1 }}
                                className="flex items-center gap-3 text-left"
                            >
                                <motion.div
                                    className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex-shrink-0"
                                    animate={{
                                        boxShadow: [
                                            '0 0 5px rgba(0, 255, 255, 0.5)',
                                            '0 0 15px rgba(0, 255, 255, 0.8)',
                                            '0 0 5px rgba(0, 255, 255, 0.5)',
                                        ],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: featureIndex * 0.3,
                                    }}
                                />
                                <span className="text-gray-300 font-medium">{feature}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group/button"
                    >
                        <Button
                            size="lg"
                            className={`w-full relative overflow-hidden ${
                                featured
                                    ? 'bg-gradient-to-r from-cyan-500 via-purple-600 to-cyan-500 hover:from-cyan-400 hover:via-purple-500 hover:to-cyan-400'
                                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
                            } text-white border-0 py-4 text-lg font-bold rounded-2xl transition-all duration-300 shadow-lg`}
                            style={featured ? { backgroundSize: '200% 200%' } : {}}
                        >
                            {/* Button Shine Effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/button:opacity-100"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.6 }}
                            />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <motion.span
                                    animate={
                                        featured
                                            ? {
                                                  backgroundPosition: [
                                                      '0% 50%',
                                                      '100% 50%',
                                                      '0% 50%',
                                                  ],
                                              }
                                            : {}
                                    }
                                    transition={
                                        featured
                                            ? {
                                                  duration: 2,
                                                  repeat: Infinity,
                                                  ease: 'linear',
                                              }
                                            : {}
                                    }
                                >
                                    {buttonText}
                                </motion.span>
                                <motion.span
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="text-xl"
                                >
                                    ⚡
                                </motion.span>
                            </span>
                        </Button>
                    </motion.div>

                    {/* Usage Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 1 + index * 0.2 }}
                        className="mt-6 pt-6 border-t border-cyan-500/20"
                    >
                        <div className="flex justify-between text-sm text-gray-400 font-mono">
                            <span>NEURAL CORES</span>
                            <span className="text-cyan-400">{featured ? '∞' : index + 2}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400 font-mono mt-2">
                            <span>QUANTUM SPEED</span>
                            <span className="text-cyan-400">
                                {featured ? 'LIGHT' : `${(index + 1) * 2}x`}
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

const ColorChangingTextAnimation = React.memo(({ text, className }) => {
    return (
        <motion.span
            className={cn(
                'text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight',
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
            {text}
        </motion.span>
    );
});

const PricingSection = React.memo(() => {
    const pricingPlans = [
        {
            plan: 'Apprentice',
            price: 19,
            features: [
                '500 Quantum Edits/month',
                'Basic Reality Filters',
                '4K Dimensional Export',
                'Neural Support',
            ],
            buttonText: 'BEGIN ASCENSION',
        },
        {
            plan: 'Master',
            price: 49,
            features: [
                'Unlimited Quantum Power',
                'Advanced Reality Bending',
                '8K Multiverse Export',
                'Priority Nexus Access',
                'API Omnipotence',
            ],
            featured: true,
            buttonText: 'CLAIM DOMINION',
        },
        {
            plan: 'Deity',
            price: 149,
            features: [
                'Custom Reality Models',
                'Infinite Batch Processing',
                '16K Godmode Export',
                'Direct Creator Hotline',
                'Universe Whitelabel',
            ],
            buttonText: 'TRANSCEND REALITY',
        },
    ];

    return (
        <section id="pricing" className="py-32 px-4 relative   overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <ColorChangingTextAnimation text="PRICING MATRIX" />

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-xl md:text-2xl text-gray-300 font-light"
                    >
                        Ascend to your rightful place in the{' '}
                        <span className="text-cyan-400 font-medium">digital pantheon</span>
                    </motion.p>

                    {/* Status Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center justify-center gap-2 mt-6"
                    >
                        <motion.div
                            className="w-3 h-3 rounded-full bg-cyan-400"
                            animate={{
                                opacity: [1, 0.3, 1],
                                scale: [1, 1.3, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                        <span className="text-cyan-400 font-mono text-sm tracking-wider">
                            PRICING MATRIX LOADED
                        </span>
                    </motion.div>
                </motion.div>

                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {pricingPlans.map((plan, index) => (
                        <HolographicPricingCard key={index} {...plan} index={index} />
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="text-center mt-16"
                >
                    <p className="text-gray-400 font-mono text-sm mb-4">
                        ALL PLANS INCLUDE • QUANTUM ENCRYPTION • 99.9% UPTIME • MULTIVERSE SUPPORT
                    </p>
                    <div className="flex justify-center gap-8 text-cyan-400/60 text-xs font-mono">
                        <span>NO SETUP FEES</span>
                        <span>•</span>
                        <span>30-DAY NEURAL TRIAL</span>
                        <span>•</span>
                        <span>CANCEL ANYTIME</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
});

export default function HeroSection() {
    const outerOrbit = [
        { Icon: Wand2, colors: ['#8b5cf6', '#3b82f6', '#06b6d4', '#8b5cf6'], duration: 4, size: 7 },
        {
            Icon: Palette,
            colors: ['#f43f5e', '#ec4899', '#be185d', '#f43f5e'],
            duration: 3.1,
            size: 7,
        },
        {
            Icon: Image,
            colors: ['#06b6d4', '#14b8a6', '#10b981', '#06b6d4'],
            duration: 3.5,
            size: 7,
        },
        {
            Icon: Sparkles,
            colors: ['#ec4899', '#8b5cf6', '#f59e0b', '#ec4899'],
            duration: 3,
            size: 7,
        },
    ];

    const middleOrbit = [
        {
            Icon: Brush,
            colors: ['#f97316', '#ef4444', '#dc2626', '#f97316'],
            duration: 3.2,
            size: 6,
        },
        {
            Icon: Crop,
            colors: ['#10b981', '#059669', '#047857', '#10b981'],
            duration: 2.8,
            size: 6,
        },
        {
            Icon: Filter,
            colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#3b82f6'],
            duration: 3.7,
            size: 6,
        },
        {
            Icon: Eraser,
            colors: ['#eab308', '#f59e0b', '#d97706', '#eab308'],
            duration: 2.5,
            size: 6,
        },
    ];

    const innerOrbit = [
        {
            Icon: Expand,
            colors: ['#8b5cf6', '#a855f7', '#9333ea', '#8b5cf6'],
            duration: 2.2,
            size: 5,
        },
        {
            Icon: Layers,
            colors: ['#06b6d4', '#0891b2', '#0e7490', '#06b6d4'],
            duration: 2.7,
            size: 5,
        },
        { Icon: Zap, colors: ['#14b8a6', '#0d9488', '#0f766e', '#14b8a6'], duration: 1.8, size: 5 },
    ];

    return (
        <div className="min-h-screen text-white overflow-x-hidden relative">
            <HolographicHero />

            <Features />

            {/* <Counter to={1000000} suffix="+" /> */}

            {/* <PricingSection /> */}
            <div className="flex flex-col xl:flex-row">
                <motion.div
                    initial={{ opacity: 0.5, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: 'easeInOut',
                    }}
                    className="flex flex-col items-center px-4 max-w-4xl mx-auto mt-[13 rem]"
                >
                    <div className=" bg-gradient-to-br leading-[6rem] from-slate-300 to-slate-500 bg-clip-text text-center text-4xl md:text-7xl font-medium tracking-wide text-transparent">
                        Step into the Future of <br /> AI Image{' '}
                        <ColorChangingTextAnimation
                            text="Creation"
                            className="text-4xl md:text-7xl lg:text-7xl font-semibold"
                        />
                    </div>

                    <p className=" text-[1.15rem] max-w-2xl hyphens-auto mt-16 text-center text-slate-400">
                        A Neural Network powered image editing and generation tool that uses the
                        power of the multiverse to bring your imagination to life.
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

                <div className="relative flex h-[40rem] w-full flex-col items-center justify-center overflow-hidden">
                    <OrbitingCircles radius={280} speed={1.8}>
                        {outerOrbit.map((icon, i) => (
                            <OrbitingIcon key={i} {...icon} circleSize="h-14" />
                        ))}
                    </OrbitingCircles>

                    <OrbitingCircles radius={190} reverse duration={35}>
                        {middleOrbit.map((icon, i) => (
                            <OrbitingIcon key={i} {...icon} circleSize="h-10" />
                        ))}
                    </OrbitingCircles>

                    <OrbitingCircles radius={100} speed={2.5}>
                        {innerOrbit.map((icon, i) => (
                            <OrbitingIcon key={i} {...icon} circleSize="h-8" />
                        ))}
                    </OrbitingCircles>
                </div>
            </div>

            <BrandingSection />
        </div>
    );
}
