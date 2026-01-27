'use client';

import LandingPage from '@/app/LandingPage/LandingPage';
import useStoreUser from '@/hooks/useStoreUser';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import ScrollToTop from '@/components/ScrollToTop';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import LoadingFallback from '@/components/Loader/LoadingFallback';
import { CircleUser } from 'lucide-react';
import dynamic from 'next/dynamic';

/* ------------------ dynamic import ------------------ */

const FollowerPointerCard = dynamic(() => import('@/components/ui/following-pointer').then(m => m.FollowerPointerCard), { ssr: false });

/* ------------------ UI ------------------ */

const TitleComponent = ({ title, avatar }) => (
    <div className="flex items-center space-x-2">
        {avatar ? (
            <Image src={avatar} height={20} width={20} alt="thumbnail" className="rounded-full ring-1 ring-white w-6 h-6 object-cover" />
        ) : (
            <div className="rounded-full ring-1 ring-white w-6 h-6 bg-gray-400 flex items-center justify-center">
                <CircleUser className="w-4 h-4 text-white" />
            </div>
        )}
        <p>{title || 'PIXELLIFT'}</p>
    </div>
);

const FIRST_TIME_FALLBACK_LOAD_TIME = 2000;

/* ------------------ wrapper switch ------------------ */

function Wrapper({ children, enabled, title, isMobile }) {
    if (!enabled) {
        return <>{children}</>;
    }

    return (
        <FollowerPointerCard title={title} isMobile={isMobile}>
            {children}
        </FollowerPointerCard>
    );
}

/* ------------------ page content ------------------ */

function PageContent({ containerRef }) {
    return (
        <>
            <LandingPage />
            <ScrollToTop containerRef={containerRef} />
            <Footer />
        </>
    );
}

/* ------------------ main component ------------------ */

function HomeContent() {
    const mainRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showFirstLoadFallback, setShowFirstLoadFallback] = useState(false);
    const [fpReady, setFpReady] = useState(false);

    const { user, isLoading } = useStoreUser();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const scrollTo = searchParams.get('scrollto');

    /* ---------- first load fallback ---------- */
    useEffect(() => {
        const hasLoadedBefore = sessionStorage.getItem('pixellift_has_loaded');

        if (!hasLoadedBefore) {
            setShowFirstLoadFallback(true);

            const timer = setTimeout(() => {
                setShowFirstLoadFallback(false);
                sessionStorage.setItem('pixellift_has_loaded', 'true');
            }, FIRST_TIME_FALLBACK_LOAD_TIME);

            return () => clearTimeout(timer);
        }
    }, []);

    /* ---------- mobile detection ---------- */
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia('(max-width: 600px)').matches);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    /* ---------- scrollto param ---------- */
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
    }, [scrollTo, pathname, router, searchParams]);

    /* ---------- detect when FollowerPointerCard is loaded ---------- */
    useEffect(() => {
        // dynamic() loads client-side — when component exists, enable wrapper
        if (FollowerPointerCard) {
            setFpReady(true);
        }
    }, []);

    /* ---------- loading states ---------- */
    if (showFirstLoadFallback || isLoading) {
        return <LoadingFallback />;
    }

    return (
        <div ref={mainRef} className="relative z-10">
            <ParticleBackground count={50} />

            <Wrapper enabled={fpReady} isMobile={isMobile} title={<TitleComponent title={user?.username} avatar={user?.imageUrl} />}>
                <PageContent containerRef={mainRef} />
            </Wrapper>
        </div>
    );
}

/* ------------------ export ------------------ */

export default function Home() {
    return <HomeContent />;
}
