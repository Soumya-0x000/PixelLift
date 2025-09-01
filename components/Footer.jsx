"use client";

import React from 'react';
import { TextHoverEffect } from './ui/text-hover-effect';

const Footer = React.memo(() => {
    return (
        <div>
            <TextHoverEffect text="PixelLift" duration={0.5} fontsize='text-[3.8rem]' />
        </div>
    );
});
Footer.displayName = 'Footer';

export default Footer;
