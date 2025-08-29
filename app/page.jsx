'use client';

import Header from '@/components/Header';
import HeroSection from '@/app/LandingPage/HeroSection';
import { FollowerPointerCard } from '@/components/ui/following-pointer';
import useStoreUser from '@/hooks/useStoreUser';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ScrollProgress } from '@/components/magicui/scroll-progress';

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
    const [isMobile, setIsMobile] = useState(false);
    const { user } = useStoreUser();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia('(max-width: 768px)').matches);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div>
            <FollowerPointerCard
                title={<TitleComponent title={user?.username} avatar={user?.imageUrl} />}
                isMobile={isMobile}
            >
                {/* <ScrollProgress className="top-[65px]" /> */}
                <Header />
                <HeroSection />
            </FollowerPointerCard>
        </div>
    );
}
