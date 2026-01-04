import { cn } from '@/lib/utils';
import React, { memo } from 'react';
import { useState } from 'react';

const LazyLoadImage = memo(({ src, alt, loading = 'lazy', className }) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <img
            src={src}
            alt={alt}
            loading={loading}
            onLoad={() => setLoaded(true)}
            className={cn(
                "w-full h-auto object-cover block transition-all duration-500",
                loaded ? 'blur-0 scale-100 opacity-100' : 'blur-md scale-105 opacity-70',
                className
            )}
        />
    );
});
LazyLoadImage.displayName = 'LazyLoadImage';

export default LazyLoadImage;
