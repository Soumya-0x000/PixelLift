'use client';

import { useParallax } from '@/hooks/useParallax';
import React from 'react';

const FloatingShapes = () => {
    const scrollY = useParallax();

    const shapes = [
        {
            id: 1,
            size: 'w-72 h-72',
            position: 'top-20 left-10',
            gradient: 'from-blue-500 to-purple-600',
            translateY: scrollY * 0.9,
        },
        {
            id: 2,
            size: 'w-96 h-96',
            position: 'top-1/3 right-10',
            gradient: 'from-cyan-400 to-blue-500',
            translateY: scrollY * 0.3,
        },
        {
            id: 3,
            size: 'w-64 h-64',
            position: 'bottom-20 left-1/4',
            gradient: 'from-pink-500 to-red-500',
            translateY: scrollY * 0.6,
        },
        {
            id: 4,
            size: 'w-80 h-80',
            position: 'bottom-1/4 right-1/4',
            gradient: 'from-yellow-400 to-orange-500',
            translateY: scrollY * 0.7,
        },
    ];

    return (
        <div className="fixed inset-0 pointer-events-none">
            {shapes.map(shape => (
                <div
                    key={shape.id}
                    className={`absolute ${shape.size} ${shape.position} bg-gradient-to-br ${shape.gradient} rounded-full animate-pulse blur-[5rem]`}
                    style={{
                        transform: `translateY(${shape.translateY}px) rotate(${scrollY * 0.1}deg)`,
                        zIndex: -1,
                    }}
                />
            ))}
        </div>
    );
};

export default FloatingShapes;
