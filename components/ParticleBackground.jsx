'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';

function Particles({ count }) {
    const pointsRef = useRef(null);
    const materialRef = useRef(null);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

    const MAX_COUNT = Math.floor(isMobile ? count * 0.45 : count);

    // visibility mask (no re-render per frame)
    const visibleRef = useRef(0);
    const [, force] = useState(0); // only to trigger spawn redraw

    // spawn particles gradually (NOT per frame)
    useEffect(() => {
        const interval = setInterval(() => {
            if (visibleRef.current < MAX_COUNT) {
                visibleRef.current += 1;
                force(v => v + 1);
            }
        }, 40);

        return () => clearInterval(interval);
    }, [MAX_COUNT]);

    const positions = useMemo(() => {
        const arr = new Float32Array(MAX_COUNT * 3);
        for (let i = 0; i < MAX_COUNT; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 20;
            arr[i * 3 + 1] = Math.random() * 20 - 10;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        return arr;
    }, [MAX_COUNT]);

    const speeds = useMemo(
        () =>
            Float32Array.from(
                { length: MAX_COUNT },
                () => Math.random() * 0.8 + 0.4 // units per second
            ),
        [MAX_COUNT]
    );

    useFrame((_, delta) => {
        if (!pointsRef.current) return;

        const pos = pointsRef.current.geometry.attributes.position.array;

        for (let i = 0; i < visibleRef.current; i++) {
            pos[i * 3 + 1] += speeds[i] * delta;

            if (pos[i * 3 + 1] > 12) {
                pos[i * 3 + 1] = -12;
            }
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;

        if (materialRef.current) {
            materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, 0.6, 0.06);
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" array={positions} count={visibleRef.current} itemSize={3} />
            </bufferGeometry>

            <pointsMaterial
                ref={materialRef}
                size={0.05}
                transparent
                opacity={0}
                color="#67e8f9"
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

export default function ParticleBackground({ count = 150 }) {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 8], fov: 75 }} gl={{ alpha: true }}>
                <Particles count={count} />
            </Canvas>
        </div>
    );
}
