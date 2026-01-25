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
import LoadingFallback from '@/components/Loader/LoadingFallback';

const TitleComponent = ({ title, avatar }) => (
    <div className="flex items-center space-x-2">
        {avatar ? (
            <Image src={avatar} height="20" width="20" alt="thumbnail" className="rounded-full ring-1 ring-white w-6 h-6 object-cover" />
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
    const { user, isLoading } = useStoreUser();
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

                const newUrl = newParams.toString().length > 0 ? `${pathname}?${newParams.toString()}` : pathname;

                router.replace(newUrl, { scroll: false });
            }
        }
    }, [scrollTo]);

    // Show loading state while user data is being fetched
    if (isLoading) {
        return <LoadingFallback />;
    }

    return (
        <div ref={mainRef} className="relative">
            {loadParticles && <ParticleBackground count={50} />}

            <FollowerPointerCard title={<TitleComponent title={user?.username} avatar={user?.imageUrl} />} isMobile={isMobile}>
                <HeroSection />
                <ScrollToTop containerRef={mainRef} />
                <Footer />
            </FollowerPointerCard>
        </div>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <HomeContent />
        </Suspense>
    );
}
