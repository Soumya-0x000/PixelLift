'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { LayoutDashboard, LogIn } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';
import useStoreUser from '@/hooks/useStoreUser';
import { BarLoader } from 'react-spinners';
import { Authenticated, Unauthenticated } from 'convex/react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { cn } from '@/lib/utils';

const Header = () => {
    const { scrollY } = useScroll();
    const path = usePathname();
    const { isLoading, isAuthenticated, userId, user } = useStoreUser();
    const [isScrolled, setIsScrolled] = useState(false);

    useMotionValueEvent(scrollY, 'change', latest => {
        const scrollThreshold = 100;
        setIsScrolled(latest > scrollThreshold);
    });

    const tabs = [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Contact', href: '#contact' },
    ];

    const [activeTab, setActiveTab] = useState('');

    if (path.includes('editor')) {
        return null;
    }

    const scrollToSection = (event, tab) => {
        event.preventDefault();
        setActiveTab(tab.name);
        const section = document.querySelector(tab.href);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.header
                layout
                className={cn(
                    'bg-slate-700/50 backdrop-blur-3xl px-6 py-2.5 fixed left-1/2 -translate-x-1/2 text-nowrap flex items-center justify-between gap-24 z-20 overflow-hidden',
                    isScrolled ? 'top-2 w-[60%] bg-slate-700/30' : 'top-6'
                )}
                initial={{ opacity: 0, y: -20 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    width: isScrolled ? '60%' : 'auto',
                    top: isScrolled ? '0.5rem' : '1.5rem',
                    borderRadius: '0.75rem',
                }}
                transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                    mass: 0.8,
                    opacity: { duration: 0.3 },
                    y: { duration: 0.3 },
                }}
                layoutTransition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    mass: 0.6,
                }}
            >
                <motion.div
                    className="uppercase text-lg font-semibold tracking-[0.1rem] bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent"
                    layout
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                    PixelLift
                </motion.div>

                <motion.nav
                    className="flex gap-x-2"
                    layout
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                    {tabs.map((tab, idx) => (
                        <motion.button
                            key={tab.name + idx}
                            onClick={e => scrollToSection(e, tab)}
                            className={cn(
                                'relative px-3 py-1 rounded-xl border-none outline-none text-slate-200 hover:text-slate-300 transition-colors ring-1 ring-transparent hover:ring-slate-600 hover:bg-slate-700',
                                activeTab === tab.name &&
                                    'text-slate-300 ring-slate-600 bg-slate-700'
                            )}
                            style={{ transformStyle: 'preserve-3d' }}
                            layout
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 30,
                                scale: { duration: 0.2 },
                            }}
                        >
                            {activeTab === tab.name && (
                                <motion.div
                                    layoutId="clickedbutton"
                                    transition={{
                                        type: 'spring',
                                        bounce: 0.2,
                                        duration: 0.5,
                                        ease: [0.4, 0, 0.2, 1],
                                    }}
                                    className="absolute inset-0 bg-slate-700/80 rounded-xl z-0"
                                />
                            )}
                            <span className="relative block z-10">{tab.name}</span>
                        </motion.button>
                    ))}
                </motion.nav>

                <motion.div
                    className="flex items-center justify-center gap-x-2 overflow-hidden"
                    layout
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                    {isLoading ? (
                        <motion.div
                            className="w-8 h-8 flex items-center justify-center bg-slate-600 animate-pulse rounded-full"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        />
                    ) : (
                        <>
                            <Authenticated>
                                <div className="min-w-[11rem] flex items-center justify-end gap-x-3">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: 0.1 }}
                                    >
                                        <Button
                                            variant={'glass'}
                                            onClick={() =>
                                                toast('Event has been created', {
                                                    description: new Date().toLocaleString(),
                                                    action: {
                                                        label: 'Undo',
                                                        onClick: () => console.log('Undo'),
                                                    },
                                                })
                                            }
                                        >
                                            <LayoutDashboard size={28} strokeWidth={1.5} />
                                            <span className="hidden sm:flex">Dashboard</span>
                                        </Button>
                                    </motion.div>

                                    <motion.div
                                        className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-full"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, delay: 0.2 }}
                                    >
                                        <UserButton appearance={{ elements: { avatarBox: ' ' } }} />
                                    </motion.div>
                                </div>
                            </Authenticated>
                            <Unauthenticated>
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                >
                                    <SignInButton>
                                        <Button
                                            variant={'magic'}
                                            className={`hidden sm:inline-flex`}
                                        >
                                            <LogIn />
                                            Sign In
                                        </Button>
                                    </SignInButton>
                                </motion.div>
                            </Unauthenticated>
                        </>
                    )}
                </motion.div>

                {isLoading && (
                    <motion.div
                        className="w-full flex justify-center fixed bottom-0 left-0"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <BarLoader color={'#e67c06'} width={'98%'} />
                    </motion.div>
                )}
            </motion.header>
        </AnimatePresence>
    );
};

export default Header;
