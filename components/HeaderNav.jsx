'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

const TABS = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
];

const HeaderNav = () => {
    const [hoveredTab, setHoveredTab] = useState(null);
    const [activeTab, setActiveTab] = useState('Features');
    const [isMoving, setIsMoving] = useState(false);
    const [interactionType, setInteractionType] = useState('hover'); // 'hover' or 'click'

    const handleTabClick = (e, tab) => {
        e.preventDefault();
        if (tab.name === activeTab) return;

        setInteractionType('click');
        setIsMoving(true);
        setActiveTab(tab.name);
    };

    return (
        <motion.nav
            className="flex gap-x-2 relative p-1 bg-slate-950 rounded-lg"
            onMouseMove={() => setInteractionType('hover')}
            onMouseLeave={() => setHoveredTab(null)}
        >
            {TABS.map(tab => {
                const isActive = activeTab === tab.name;
                const isHovered = hoveredTab === tab.name;

                // Show border if (Hovering an active tab) OR (Active tab is settled)
                const showBorder = (isActive && !isMoving) || (isHovered && isActive);

                return (
                    <button
                        key={tab.name}
                        onClick={e => handleTabClick(e, tab)}
                        onMouseEnter={() => setHoveredTab(tab.name)}
                        className="relative px-4 py-2 text-sm font-medium outline-none text-slate-400 hover:text-white transition-colors"
                    >
                        {/* 1. THE DARK PILL */}
                        {isActive && (
                            <motion.div
                                layoutId="pill-bg"
                                className="absolute inset-0 bg-slate-900 rounded-md z-0"
                                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                onLayoutAnimationComplete={() => setIsMoving(false)}
                            />
                        )}

                        {/* 2. THE LIQUID ELEMENT (Smart Morph vs Bloom) */}
                        <AnimatePresence mode="popLayout">
                            {(isHovered || isActive) && (
                                <motion.div
                                    layoutId={interactionType === 'hover' ? 'liquid-element' : undefined}
                                    key={interactionType === 'click' && isActive ? 'bloom-active' : 'liquid-hover'}
                                    initial={
                                        interactionType === 'click'
                                            ? {
                                                  opacity: 0,
                                                  scale: 0.5,
                                                  height: '100%',
                                                  inset: 0,
                                                  borderRadius: '6px',
                                              }
                                            : false
                                    }
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        height: showBorder ? '100%' : '2px',
                                        inset: showBorder ? 0 : 'auto',
                                        bottom: 0,
                                        left: showBorder ? 0 : '15%',
                                        right: showBorder ? 0 : '15%',
                                        top: showBorder ? 0 : 'auto',
                                        borderRadius: showBorder ? '6px' : '99px',
                                    }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: interactionType === 'click' ? 500 : 400,
                                        damping: 30,
                                    }}
                                    style={{
                                        position: 'absolute',
                                        zIndex: 10,
                                        pointerEvents: 'none',
                                        background: 'linear-gradient(to right, #60a5fa, #818cf8)',
                                        WebkitMask: showBorder ? 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)' : 'none',
                                        WebkitMaskComposite: showBorder ? 'xor' : 'initial',
                                        padding: showBorder ? '1.5px' : 0,
                                        transformOrigin: 'center',
                                    }}
                                />
                            )}
                        </AnimatePresence>

                        <span className="relative z-20">{tab.name}</span>
                    </button>
                );
            })}
        </motion.nav>
    );
};

export default HeaderNav;
