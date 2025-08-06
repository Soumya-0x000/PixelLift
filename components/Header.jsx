'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from './ui/button';
import { LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

const Header = () => {
    const tabs = [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Contact', href: '#contact' },
    ];

    const [activeTab, setActiveTab] = useState('');

    return (
        <header className="bg-slate-700/50 backdrop-blur-3xl rounded-full px-6 py-2.5 fixed top-6 left-1/2 -translate-x-1/2 text-nowrap flex items-center justify-between gap-24 z-50">
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

            <div className="flex items-center justify-center gap-x-2">
                <Button variant={'glass'}>
                    <LayoutDashboard size={28} strokeWidth={1.5} /> Dashboard
                </Button>
                <div>
                    {/* <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <span className="min-w-[2.8rem] min-h-[2.8rem] flex items-center justify-center cursor-pointer rounded-full">
                                <Image
                                    src="https://avatars.githubusercontent.com/u/80732586?v=4"
                                    alt="Vercel Logo"
                                    className="rounded-full aspect-square "
                                    width={32}
                                    height={32}
                                    priority
                                    sizes="100vw"
                                />
                            </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    Profile
                                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Billing
                                    <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Settings
                                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Keyboard shortcuts
                                    <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>Team</DropdownMenuItem>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuItem>Email</DropdownMenuItem>
                                            <DropdownMenuItem>Message</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>More...</DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuItem>
                                    New Team
                                    <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>GitHub</DropdownMenuItem>
                            <DropdownMenuItem>Support</DropdownMenuItem>
                            <DropdownMenuItem disabled>API</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                Log out
                                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu> */}

                    <SignedOut>
                        <SignInButton>
                            <Button variant={'gradient'}>
                                <LogIn />
                                Sign In
                            </Button>
                        </SignInButton>
                        {/* <SignUpButton>
                            <Button variant={'gradient'} className={`ml-2`} >
                                <LogOut />
                                Sign Up
                            </Button>
                        </SignUpButton> */}
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </div>
        </header>
    );
};

export default Header;
