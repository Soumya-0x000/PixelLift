'use client';

import HeroSection from '@/app/LandingPage/HeroSection';
import { FollowerPointerCard } from '@/components/ui/following-pointer';
import useStoreUser from '@/hooks/useStoreUser';
import Image from 'next/image';
import { Suspense, useEffect, useRef, useState } from 'react';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import ScrollToTop from '@/components/ScrollToTop';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';

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

function HomeContent() {
    const mainRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const [loadParticles, setLoadParticles] = useState(false);
    const { user } = useStoreUser();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const scrollTo = searchParams.get('scrollto');

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

    useEffect(() => {
        if (scrollTo) {
            const element = document.getElementById(scrollTo);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });

                const newParams = new URLSearchParams(searchParams.toString());
                newParams.delete('scrollto');

                const newUrl =
                    newParams.toString().length > 0
                        ? `${pathname}?${newParams.toString()}`
                        : pathname;

                router.replace(newUrl, { scroll: false });
            }
        }
    }, [scrollTo]);

    return (
        <div ref={mainRef} className="relative">
            {loadParticles && <ParticleBackground count={50} />}

            <FollowerPointerCard
                title={<TitleComponent title={user?.username} avatar={user?.imageUrl} />}
                isMobile={isMobile}
            >
                <HeroSection />
                <ScrollToTop containerRef={mainRef} />
                <Footer />
            </FollowerPointerCard>
        </div>
    );
}

const Fallback = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-black">
            {/* Animated rings */}
            <div className="relative w-20 h-20 flex items-center justify-center">
                <motion.span
                    className="absolute block w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
                <motion.span
                    className="absolute block w-10 h-10 border-4 border-t-transparent border-pink-500 rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                />
            </div>

            {/* Subtle text fade animation */}
            <motion.p
                className="mt-6 text-gray-700 dark:text-gray-300 font-semibold text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                Loading...
            </motion.p>
        </div>
    );
};
export default function Home() {
    return (
        <Suspense fallback={<Fallback />}>
            <HomeContent />
        </Suspense>
    );
}
