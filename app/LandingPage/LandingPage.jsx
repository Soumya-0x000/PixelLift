'use client';

import { Suspense, lazy, useEffect, useRef, useState } from 'react';

// Lazy load all sections except Hero (which should load immediately)
import Hero from './hero/page';
const Features = lazy(() => import('./features/page'));
const AiBgMagic = lazy(() => import('./imageCompare/page'));
const PricingSection = lazy(() => import('./pricing/page'));
const BrandingSection = lazy(() => import('./branding/page'));

// Lazy section wrapper component with Intersection Observer
const LazySection = ({ children, minHeight = '400px' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    // Load the section when it's about to enter viewport
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                // Start loading 200px before the section enters viewport
                rootMargin: '200px',
                threshold: 0,
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <div ref={sectionRef} style={{ minHeight: isVisible ? 'auto' : minHeight }}>
            {isVisible && (
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center" style={{ minHeight }}>
                            <div className="animate-pulse text-gray-400">Loading...</div>
                        </div>
                    }
                >
                    {children}
                </Suspense>
            )}
        </div>
    );
};

const LandingPage = () => {
    return (
        <div className="text-white overflow-x-hidden relative">
            {/* Hero loads immediately */}
            <Hero />

            {/* All other sections load lazily as user scrolls */}
            <LazySection minHeight="600px">
                <Features />
            </LazySection>

            <LazySection minHeight="500px">
                <AiBgMagic />
            </LazySection>

            <LazySection minHeight="700px">
                <PricingSection />
            </LazySection>

            <LazySection minHeight="400px">
                <BrandingSection />
            </LazySection>
        </div>
    );
};

export default LandingPage;
