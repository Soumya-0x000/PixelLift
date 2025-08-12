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

    return (
        <header className="bg-slate-700/50 backdrop-blur-3xl rounded-full px-6 py-2.5 fixed top-6 left-1/2 -translate-x-1/2 text-nowrap flex items-center justify-between gap-24 z-50 overflow-hidden">
            <div className=" uppercase text-lg font-semibold tracking-[0.1rem] bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                PixelLift
            </div>

            <nav className="flex gap-x-2">
                {tabs.map(tab => (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={`text-slate-200 hover:text-slate-300 transition-colors ring-1 ring-transparent rounded-xl hover:ring-slate-600 hover:bg-slate-700 ${
                            activeTab.toLowerCase() === tab.name.toLowerCase()
                                ? 'text-slate-300 ring-slate-600 bg-slate-700'
                                : ''
                        } px-3 py-1 border-none outline-none`}
                        onClick={() => setActiveTab(tab.name)}
                    >
                        {tab.name}
                    </Link>
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
        </header>
    );
};

export default Header;
