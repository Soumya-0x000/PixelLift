'use client';

import Header from '@/components/Header';
import HeroSection from '@/app/LandingPage/HeroSection';
import { FollowerPointerCard } from '@/components/ui/following-pointer';
import useStoreUser from '@/hooks/useStoreUser';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import ScrollToTop from '@/components/ScrollToTop';
import { useScroll, motion, useTransform } from 'motion/react';

const TitleComponent = ({ title, avatar }) => (
    <div className="flex items-center space-x-2">
        {avatar ? (
            <Image
                src={avatar}
                height="20"
                width="20"
                alt="thumbnail"
                className="rounded-full ring-1 ring-white w-6 h-6 object-cover"
            />
        ) : (
            <div className="rounded-full ring-1 ring-white w-6 h-6 bg-gray-400 flex items-center justify-center">
                <span className="text-xs text-white">?</span>
            </div>
        )}
        <p>{title}</p>
    </div>
);

export default function Home() {
    const mainRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const [loadParticles, setLoadParticles] = useState(false);
    const { user } = useStoreUser();

    // Track window scroll progress (0 -> 1 across the page)
    const { scrollYProgress } = useScroll();

    // Map scroll progress to circle dash offset
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = useTransform(scrollYProgress, [0, 1], [circumference, 0]);

    // Debug scroll progress
    useEffect(() => {
        const unsubscribe = scrollYProgress.onChange(latest => {
            console.log('Scroll progress:', latest);
        });
        return unsubscribe;
    }, [scrollYProgress]);

    useEffect(() => {
        setTimeout(() => {
            setLoadParticles(true);
        }, 1000);
    }, []);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia('(max-width: 600px)').matches);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div ref={mainRef} className="relative min-h-screen">
            {loadParticles && <ParticleBackground count={50} />}

            {/* Fixed position scroll indicator */}
            <div className="fixed top-5 right-5 z-50">
                <svg id="progress" width="80" height="80" viewBox="0 0 100 100">
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="50%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>

                    {/* Background ring */}
                    <circle
                        cx="50"
                        cy="50"
                        r="30"
                        fill="none"
                        stroke="rgba(255,255,255,0.25)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                    />

                    {/* Animated progress ring */}
                    <motion.circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="url(#progressGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                        style={{
                            strokeDasharray: circumference,
                            strokeDashoffset: dashOffset,
                        }}
                    />
                </svg>
            </div>

            <FollowerPointerCard
                title={<TitleComponent title={user?.username} avatar={user?.imageUrl} />}
                isMobile={isMobile}
            >
                <Header />
                <HeroSection />
                <ScrollToTop containerRef={mainRef} />
                <Footer />
            </FollowerPointerCard>
        </div>
    );
}
