'use client';

import { MorphingText } from '@/components/magicui/morphing-text';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useScroll, useTransform, motion, useAnimationControls } from 'motion/react';
import { useRouter } from 'next/navigation';

const Hero = () => {
    const router = useRouter();
    const { scrollY } = useScroll();
    const controls = useAnimationControls();
    const y = useTransform(scrollY, [0, 500], [0, -150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    const revealVariants = {
        hidden: {
            opacity: 0,
            width: 0,
            height: 1,
        },
        visible: {
            opacity: 1,
        },
    };

    const handleNaviagation = e => {
        e.preventDefault();
        router.push('/dashboard');
    };

    const words = [
        'Transform ordinary photos into masterpieces',
        'Unleash impossible visual perfection',
        'Bend reality with quantum precision',
        'Elevate your images to divine quality',
        'Rewrite the rules of modern digital artistry',
    ];

    const handleHoverStart = async () => {
        await controls.start({
            opacity: 1,
            width: '100%',
            transition: {
                duration: 0.5,
                ease: 'easeOut',
            },
        });

        // runs AFTER width animation finishes
        await controls.start({
            height: 200,
            transition: {
                duration: 0.4,
                ease: 'easeOut',
            },
        });
    };

    const handleHoverEnd = async () => {
        await controls.start({
            height: 1,
            transition: {
                duration: 0.3,
                ease: 'easeInOut',
            },
        });

        await controls.start({
            width: 0,
            opacity: 0,
            transition: {
                duration: 0.3,
                ease: 'easeInOut',
            },
        });
    };

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
                <motion.div
                    className="relative group z-50"
                    onHoverStart={handleHoverStart}
                    onHoverEnd={handleHoverEnd}
                >
                    <HoverBorderGradient
                        containerClassName="rounded-full mt-[5rem] tracking-wide text-[0.9rem] p-0"
                        as="button"
                        className="group dark:bg-black bg-white text-slate-800 dark:text-slate-400 flex items-center gap-x-3 cursor-pointer"
                        onClick={handleNaviagation}
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
                            <Sparkles className="w-4 h-4" />
                        </motion.div>
                        <span className=" flex items-center gap-2">
                            Introduction to PixelLift
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-all duration-500 text-gray-500" />
                        </span>
                    </HoverBorderGradient>

                    <motion.div
                        animate={controls}
                        initial="hidden"
                        variants={revealVariants}
                        className="absolute top-11 left-1/2 -translate-x-1/2 overflow-hidden whitespace-nowrap px-4 py-2 rounded-md bg-black text-white pointer-events-none"
                    >
                        <MorphingText texts={words} />
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Main Content */}
            <div className="text-center z-10 relative min-w-7xl">
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
                    className="relative p-12 rounded-3xl backdrop-blur-xl bg-linear-to-br from-white/5 via-white/2 to-transparent border border-cyan-500/20 shadow-2xl "
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
                        className={`h-48 text-[4rem] leading-20 bg-linear-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent`}
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
                        <span className="text-cyan-400 font-medium">Quantum-Enhanced</span> image
                        processing that transcends
                        <br />
                        the boundaries of conventional AI enhancement
                    </motion.p>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default Hero;
