import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CometCard } from '@/components/ui/comet-card';
import { PointerHighlight } from '@/components/ui/pointer-highlight';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { cn } from '@/lib/utils';

const BrandingSection = () => {
    const [showHighlight, setShowHighlight] = useState(false);
    const [sectionInView, setSectionInView] = useState(false);

    // Intersection observer for section
    useEffect(() => {
        const section = document.getElementById('branding-section');
        if (!section) return;

        const observer = new window.IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setSectionInView(true);
                }
            },
            { threshold: 0.3 }
        );
        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    // Delay PointerHighlight by 1s after section is in view
    useEffect(() => {
        if (sectionInView) {
            const timer = setTimeout(() => setShowHighlight(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [sectionInView]);

    return (
        <section
            id="branding-section"
            className="py-32 px-4 relative flex justify-center items-center overflow-hidden"
        >
            <CometCard shouldGlow={false}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 100 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="max-w-6xl mx-auto text-center relative z-10"
                >
                    <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-16 relative overflow-hidden">
                        <div className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent relative z-10 flex flex-col justify-center items-center leading-[5rem] text-center gap-5">
                            READY TO BECOME OMNIPOTENT ?
                        </div>

                        <div className="text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed relative z-10">
                            Join the
                            {showHighlight ? (
                                <PointerHighlight
                                    rectangleClassName="bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700 leading-loose"
                                    pointerClassName="text-yellow-500 h-3 w-3"
                                    containerClassName="inline-block ml-1"
                                >
                                    <span className="relative z-10 px-1">digital deities</span>
                                </PointerHighlight>
                            ) : (
                                <span className="relative z-10 px-1 ml-1">digital deities</span>
                            )}
                            {` `}
                            who have transcended the boundaries of
                            {showHighlight ? (
                                <PointerHighlight
                                    rectangleClassName="bg-pink-100 dark:bg-pink-900 border-pink-300 dark:border-pink-700 leading-loose"
                                    pointerClassName="text-pink-500 h-3 w-3"
                                    containerClassName="inline-block ml-1"
                                >
                                    <span className="relative z-10 px-1">reality itself</span>
                                </PointerHighlight>
                            ) : (
                                <span className="relative z-10 px-1 ml-1">reality itself</span>
                            )}
                            {` .`}
                        </div>

                        <button
                            type="button"
                            className="relative z-10 hover:scale-[1.05] active:scale-[0.95] transition-transform duration-200"
                        >
                            <div className="group w-fit relative mx-auto flex items-center justify-center rounded-full px-7 py-3.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] ">
                                <span
                                    className={cn(
                                        'absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]'
                                    )}
                                    style={{
                                        WebkitMask:
                                            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                        WebkitMaskComposite: 'destination-out',
                                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                        maskComposite: 'subtract',
                                        WebkitClipPath: 'padding-box',
                                    }}
                                />
                                🌟 <hr className="mx-2 h-4 w-px shrink-0 bg-neutral-500" />
                                <AnimatedGradientText className="text-md font-medium">
                                    ASCEND TO GODHOOD
                                </AnimatedGradientText>
                                <ChevronRight className="ml-1 size-4 stroke-neutral-500 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                            </div>
                        </button>
                    </div>
                </motion.div>
            </CometCard>
        </section>
    );
};

export default BrandingSection;
