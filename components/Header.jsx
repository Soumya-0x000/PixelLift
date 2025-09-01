'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from './ui/button';
import { LayoutDashboard, LogIn } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';
import useStoreUser from '@/hooks/useStoreUser';
import { BarLoader } from 'react-spinners';
import { Authenticated, Unauthenticated } from 'convex/react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const Header = () => {
    const path = usePathname();
    const { isLoading, isAuthenticated, userId, user } = useStoreUser();

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
        <motion.header
            layout
            className="bg-slate-700/50 backdrop-blur-3xl rounded-full px-6 py-2.5 fixed top-6 left-1/2 -translate-x-1/2 text-nowrap flex items-center justify-between gap-24 z-40 overflow-hidden"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className=" uppercase text-lg font-semibold tracking-[0.1rem] bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                PixelLift
            </div>

            <nav className="flex gap-x-2">
                {tabs.map((tab, idx) => (
                    <button
                        key={tab.name}
                        onClick={e => scrollToSection(e, tab)}
                        className={cn(
                            'relative px-3 py-1 rounded-xl border-none outline-none text-slate-200 hover:text-slate-300 transition-colors ring-1 ring-transparent hover:ring-slate-600 hover:bg-slate-700',
                            activeTab === tab.name && 'text-slate-300 ring-slate-600 bg-slate-700'
                        )}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {activeTab === tab.name && (
                            <motion.div
                                layoutId="clickedbutton"
                                transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                                className="absolute inset-0 bg-slate-700/80 rounded-xl z-0"
                            />
                        )}
                        <span className="relative block z-10">{tab.name}</span>
                    </button>
                ))}
            </nav>

            <div className="flex items-center justify-center gap-x-2 overflow-hidden ">
                {isLoading ? (
                    <div className="w-8 h-8 flex items-center justify-center bg-slate-600 animate-pulse rounded-full" />
                ) : (
                    <>
                        <Authenticated>
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

                            <div className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-full">
                                <UserButton appearance={{ elements: { avatarBox: ' ' } }} />
                            </div>
                        </Authenticated>
                        <Unauthenticated>
                            <SignInButton>
                                <Button variant={'magic'} className={`hidden sm:inline-flex`}>
                                    <LogIn />
                                    Sign In
                                </Button>
                            </SignInButton>
                        </Unauthenticated>
                    </>
                )}
            </div>

            {isLoading && (
                <div className=" w-full flex justify-center fixed bottom-0 left-0">
                    <BarLoader color={'#e67c06'} width={'98%'} />
                </div>
            )}
        </motion.header>
    );
};

export default Header;
