'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

const ParticleBackground = React.memo(({ count = 100, creationDelay = 50 }) => {
    const [particles, setParticles] = useState([]);
    const intervalRef = useRef();

    useEffect(() => {
        let i = 0;
        intervalRef.current = setInterval(() => {
            if (i < count) {
                setParticles(prev => [
                    ...prev,
                    {
                        id: `${Date.now()}-${Math.random()}`,
                        x: Math.random() * 100,
                        y: Math.random() * 100,
                        size: Math.random() * 3 + 1,
                        duration: Math.random() * 20 + 10,
                        delay: Math.random() * 5,
                    },
                ]);
                i++;
            } else {
                clearInterval(intervalRef.current);
            }
        }, creationDelay);
        return () => clearInterval(intervalRef.current);
    }, [count]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {particles.map(particle => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                    }}
                    animate={{
                        y: [-20, -100],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    );
});
ParticleBackground.displayName = 'ParticleBackground';

export default ParticleBackground;
