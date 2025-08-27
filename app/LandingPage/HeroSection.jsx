'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FollowerPointerCard, FollowPointer } from '../../components/ui/following-pointer';
import useStoreUser from '@/hooks/useStoreUser';
import { CometCard } from '../../components/ui/comet-card';
import { PointerHighlight } from '../../components/ui/pointer-highlight';
import BrandingSection from './branding/page';

const useMousePosition = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const updateMousePosition = e => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', updateMousePosition);
        return () => window.removeEventListener('mousemove', updateMousePosition);
    }, []);

    return mousePosition;
};

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

const CustomCursor = ({ mousePosition }) => {
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const handleMouseOver = e => {
            if (e.target.matches('button, a, [role="button"]')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        document.addEventListener('mouseover', handleMouseOver);
        return () => document.removeEventListener('mouseover', handleMouseOver);
    }, []);

    return (
        <motion.div
            className="fixed w-5 h-5 bg-blue-500 rounded-full pointer-events-none z-50 mix-blend-difference"
            animate={{
                x: mousePosition.x - 10,
                y: mousePosition.y - 10,
                scale: isHovering ? 2 : 1,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        />
    );
};

const Noise = () => {
    return (
        <div
            className="absolute inset-0 w-full h-full scale-[1.2] transform opacity-10 [mask-image:radial-gradient(#fff,transparent,75%)]"
            style={{
                backgroundImage: 'url(/noise.webp)',
                backgroundSize: '30%',
            }}
        ></div>
    );
};

const HolographicHero = () => {
    const [glitchText, setGlitchText] = useState('AI IMAGE NEXUS');
    const [isGlitching, setIsGlitching] = useState(false);
    const originalText = 'AI IMAGE NEXUS';
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, -150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    useEffect(() => {
        const glitchChars = '█▓▒░!@#$%^&*()_+-=[]{}|;:,.<>?ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let interval;

        const startGlitch = () => {
            setIsGlitching(true);
            let iterations = 0;
            interval = setInterval(() => {
                setGlitchText(prev =>
                    prev
                        .split('')
                        .map((char, index) => {
                            if (index < iterations) {
                                return originalText[index];
                            }
                            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                        })
                        .join('')
                );

                if (iterations >= originalText.length) {
                    clearInterval(interval);
                    setGlitchText(originalText);
                    setIsGlitching(false);
                }

                iterations += 1 / 2;
            }, 50);
        };

        const glitchInterval = setInterval(startGlitch, 8000);
        const initialGlitch = setTimeout(startGlitch, 2000);

        return () => {
            clearTimeout(initialGlitch);
            clearInterval(glitchInterval);
            clearInterval(interval);
        };
    }, []);

    return (
        <motion.section
            className="h-screen flex items-center justify-center relative overflow-hidden"
            style={{ y, opacity }}
        >
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

                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            transition={{
                                duration: 1.5,
                                delay: 0.5,
                                type: 'spring',
                                stiffness: 100,
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
                                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                transition={{
                                    duration: 1.5,
                                    delay: 0.5,
                                    type: 'spring',
                                    stiffness: 100,
                                }}
                                className="mb-8"
                            >
                                <motion.h1
                                    className={`text-7xl md:text-9xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent ${
                                        isGlitching ? 'animate-pulse' : ''
                                    }`}
                                    style={{
                                        textShadow: isGlitching
                                            ? '0 0 20px rgba(59, 130, 246, 0.5)'
                                            : 'none',
                                        filter: isGlitching ? 'hue-rotate(90deg)' : 'none',
                                    }}
                                    animate={
                                        isGlitching
                                            ? {
                                                  x: [0, -2, 2, -1, 1, 0],
                                                  y: [0, 1, -1, 2, -2, 0],
                                              }
                                            : {}
                                    }
                                    transition={{ duration: 0.1, repeat: isGlitching ? 10 : 0 }}
                                >
                                    {glitchText}
                                </motion.h1>
                            </motion.div>
                        </motion.div>

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
                            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed font-light"
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

const LevitatingFeatureCard = ({ icon, title, description, delay = 0, index }) => {
    const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 100, rotateX: -30 }}
            animate={isIntersecting ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ duration: 1, delay, type: 'spring', stiffness: 100 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="magnetic"
        >
            <Noise />
            <motion.div
                whileHover={{
                    scale: 1.05,
                    rotateY: 5,
                    z: 50,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <Card className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-8 hover:border-white/40 transition-all duration-500 group relative overflow-hidden h-full">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5"
                        animate={
                            isHovered
                                ? {
                                      background: [
                                          'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(6, 182, 212, 0.1))',
                                          'linear-gradient(225deg, rgba(147, 51, 234, 0.1), rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))',
                                          'linear-gradient(315deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
                                      ],
                                  }
                                : {}
                        }
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />

                    <motion.div
                        className="text-6xl mb-6 relative z-10"
                        animate={
                            isHovered
                                ? {
                                      scale: [1, 1.2, 1],
                                      rotate: [0, 10, -10, 0],
                                  }
                                : {}
                        }
                        transition={{ duration: 0.6 }}
                    >
                        {icon}
                    </motion.div>

                    <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{title}</h3>
                    <p className="text-white/80 text-lg leading-relaxed relative z-10">
                        {description}
                    </p>

                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                className="absolute inset-0 pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-1 h-1 bg-blue-400 rounded-full"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                        }}
                                        animate={{
                                            scale: [0, 1, 0],
                                            opacity: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: 1,
                                            delay: i * 0.1,
                                            repeat: Number.POSITIVE_INFINITY,
                                        }}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>
        </motion.div>
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

const HolographicPricingCard = ({ plan, price, features, featured = false, buttonText, index }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className={`relative ${featured ? 'scale-105' : ''}`}
            initial={{ opacity: 0, y: 50, rotateX: -20 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {featured && (
                <motion.div
                    className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold z-10"
                    animate={{
                        y: [0, -5, 0],
                        boxShadow: [
                            '0 0 20px rgba(59, 130, 246, 0.3)',
                            '0 0 30px rgba(147, 51, 234, 0.5)',
                            '0 0 20px rgba(59, 130, 246, 0.3)',
                        ],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                    ⭐ MOST POWERFUL
                </motion.div>
            )}

            <motion.div
                whileHover={{
                    scale: featured ? 1.02 : 1.05,
                    rotateY: 5,
                    z: 50,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <Card
                    className={`backdrop-blur-2xl border-white/20 p-10 h-full relative overflow-hidden magnetic ${
                        featured
                            ? 'bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 border-blue-500/30'
                            : 'bg-gradient-to-br from-white/5 to-white/10'
                    }`}
                >
                    <motion.div
                        className="absolute inset-0 opacity-30"
                        animate={
                            isHovered
                                ? {
                                      background: [
                                          'linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
                                          'linear-gradient(135deg, transparent, rgba(147, 51, 234, 0.1), transparent)',
                                          'linear-gradient(225deg, transparent, rgba(6, 182, 212, 0.1), transparent)',
                                          'linear-gradient(315deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
                                      ],
                                  }
                                : {}
                        }
                        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                    />

                    <div className="text-center relative z-10">
                        <motion.h3
                            className="text-3xl font-black text-white mb-4"
                            animate={isHovered ? { scale: 1.05 } : {}}
                        >
                            {plan}
                        </motion.h3>

                        <motion.div
                            className="text-6xl font-black text-white mb-8"
                            animate={
                                isHovered
                                    ? {
                                          scale: [1, 1.1, 1],
                                          color: ['#ffffff', '#3b82f6', '#8b5cf6', '#ffffff'],
                                      }
                                    : {}
                            }
                            transition={{ duration: 1 }}
                        >
                            ${price}
                            <span className="text-xl text-white/60 font-normal">/month</span>
                        </motion.div>

                        <ul className="space-y-4 mb-10">
                            {features.map((feature, featureIndex) => (
                                <motion.li
                                    key={featureIndex}
                                    className="text-white/90 flex items-center text-lg"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: featureIndex * 0.1 }}
                                >
                                    <motion.span
                                        className="text-green-400 mr-3 text-xl"
                                        animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
                                        transition={{ delay: featureIndex * 0.1 }}
                                    >
                                        ✨
                                    </motion.span>
                                    {feature}
                                </motion.li>
                            ))}
                        </ul>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                className={`w-full py-4 text-lg font-bold magnetic ${
                                    featured
                                        ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 hover:from-blue-600 hover:via-purple-700 hover:to-cyan-600 text-white shadow-2xl'
                                        : 'bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white backdrop-blur-sm'
                                }`}
                            >
                                {buttonText}
                            </Button>
                        </motion.div>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
};

const ParticleField = React.memo(({ count = 150 }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // Only run on client
        const generated = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 20 + 10,
            delay: Math.random() * 5,
        }));
        setParticles(generated);
    }, [count]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map(particle => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                    }}
                    animate={{
                        y: [-20, -100],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    );
});

const HolographicGrid = () => {
    return (
        <motion.div
            className="absolute inset-0 opacity-30"
            style={{
                backgroundImage: `
          linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
        `,
                backgroundSize: '60px 60px',
            }}
            animate={{
                backgroundPosition: ['0px 0px', '60px 60px'],
            }}
            transition={{
                duration: 25,
                repeat: Infinity,
                ease: 'linear',
            }}
        />
    );
};

const ScanLineBgEffect = () => (
    <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
            background: 'linear-gradient(transparent 50%, rgba(0, 255, 255, 0.03) 50%)',
            backgroundSize: '100% 4px',
        }}
        animate={{
            backgroundPositionY: ['0px', '4px'],
        }}
        transition={{
            duration: 0.1,
            repeat: Infinity,
            ease: 'linear',
        }}
    />
);

// Main App Component
export default function HeroSection() {
    const features = [
        {
            icon: '🧠',
            title: 'Neural Quantum Removal',
            description:
                'Harness the power of quantum AI to obliterate backgrounds with subatomic precision, leaving only pure perfection',
            delay: 0.1,
        },
        {
            icon: '⚡',
            title: 'Infinity Upscaling Engine',
            description:
                'Transcend resolution limits with our reality-bending upscaling that creates detail from the quantum foam itself',
            delay: 0.2,
        },
        {
            icon: '🎨',
            title: 'Dimensional Style Fusion',
            description:
                'Merge artistic dimensions in real-time, transforming images through parallel universe style matrices',
            delay: 0.3,
        },
        {
            icon: '🔮',
            title: 'Temporal Object Erasure',
            description:
                'Rewrite visual history by removing objects across spacetime, healing reality with impossible precision',
            delay: 0.4,
        },
        {
            icon: '🌈',
            title: 'Chromatic Harmony Matrix',
            description:
                'Orchestrate color symphonies that resonate with the fundamental frequencies of visual perfection',
            delay: 0.5,
        },
        {
            icon: '✨',
            title: 'Omnipotent Enhancement',
            description:
                'Achieve godlike image perfection with a single quantum click that rewrites the laws of photography',
            delay: 0.6,
        },
    ];

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
        <div className="min-h-screen bg-slate-900/60 text-white overflow-x-hidden relative">
            <ParticleField count={20} />

            <HolographicGrid />

            <ScanLineBgEffect />

            <HolographicHero />
            {/* 

            <section id="features" className="py-32 px-4 relative">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent"
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                />

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="text-center mb-20"
                    >
                        <motion.h2
                            className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent"
                            animate={{
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                            }}
                            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
                        >
                            OMNIPOTENT ABILITIES
                        </motion.h2>
                        <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
                            Wield powers that reshape the very fabric of digital reality itself
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {features.map((feature, index) => (
                            <LevitatingFeatureCard key={index} {...feature} index={index} />
                        ))}
                    </div>
                </div>
            </section>

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
                        <QuantumCounter
                            target={10000000}
                            suffix="+"
                            label="Realities Transformed"
                        />
                        <QuantumCounter target={500000} suffix="+" label="Digital Gods Created" />
                        <QuantumCounter target={100} suffix="%" label="Universe Satisfaction" />
                    </div>
                </div>
            </section>

            <section id="pricing" className="py-32 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                            CHOOSE YOUR DESTINY
                        </h2>
                        <p className="text-2xl text-white/80">
                            Ascend to your rightful place in the digital pantheon
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {pricingPlans.map((plan, index) => (
                            <HolographicPricingCard key={index} {...plan} index={index} />
                        ))}
                    </div>
                </div>
            </section> */}

            <BrandingSection />
        </div>
    );
}
