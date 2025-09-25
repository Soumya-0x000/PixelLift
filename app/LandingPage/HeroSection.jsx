'use client';

import Hero from './hero/page';
import Features from './features/page';
import AiBgMagic from './imageCompare/page';
import PricingSection from './pricing/page';
import BrandingSection from './branding/page';

const HeroSection = () => {
    return (
        <div className=" text-white overflow-x-hidden relative">
            {/* <Hero />

            <Features />

            <AiBgMagic /> */}

            <PricingSection />

            {/* <BrandingSection /> */}
        </div>
    );
};

export default HeroSection;
