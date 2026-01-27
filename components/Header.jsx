'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from './ui/button';
import { LayoutDashboard, LogIn } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import { BarLoader } from 'react-spinners';
import { Authenticated, Unauthenticated } from 'convex/react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { cn } from '@/lib/utils';
import useStoreUser from '@/hooks/useStoreUser';
import useMounted from '@/utils/componentMounted';
import HeaderNav from './HeaderNav';

// Local component for gradient auth buttons
const GradientButton = ({ label, ...props }) => (
    <button
        {...props}
        className="group relative cursor-pointer flex items-center justify-center rounded-full bg-slate-700/80 px-4 py-2 font-medium overflow-hidden active:scale-90 transition-all duration-400 ease-out"
    >
        {/* Background gradient */}
        <span className="pointer-events-none absolute inset-0 -m-[2px] rounded-full bg-linear-to-r from-blue-400 to-indigo-300 scale-0 opacity-0 transition-all duration-200 ease-out group-hover:scale-100 group-hover:opacity-100" />

        {/* Label */}
        <span className="relative z-10 bg-linear-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent transition-colors duration-200 group-hover:text-white group-hover:bg-none">
            {label}
        </span>
    </button>
);

const Header = () => {
    const { scrollY } = useScroll();
    const router = useRouter();
    const path = usePathname();
    const { isLoading, isAuthenticated, userId, user } = useStoreUser();
    const [isScrolled, setIsScrolled] = useState(false);
    const mounted = useMounted();

    useMotionValueEvent(scrollY, 'change', latest => {
        const scrollThreshold = 100;
        setIsScrolled(latest > scrollThreshold);
    });

    if (path.includes('editor') || path.includes('sign-in') || path.includes('sign-up') || path.includes('sso-callback')) {
        return null;
    }

    if (!mounted) {
        return null;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.header
                layout
                className={cn(
                    'bg-slate-700/50 backdrop-blur-3xl px-4 py-2.5 fixed left-1/2 -translate-x-1/2 text-nowrap flex items-center justify-between gap-24 z-20 overflow-hidden',
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
                <Link href="/">
                    <motion.span
                        className="uppercase text-lg font-semibold tracking-[0.1rem] bg-linear-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent cursor-pointer"
                        layout
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                        PixelLift
                    </motion.span>
                </Link>

                <HeaderNav />

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
                                <div className="min-w-44 flex items-center justify-end gap-x-3">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: 0.1 }}
                                    >
                                        <Button variant={'glass'} onClick={() => router.push(isAuthenticated ? '/dashboard' : '/sign-in')}>
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
                                    className="flex items-center justify-center gap-x-3"
                                >
                                    <SignInButton>
                                        <GradientButton label="Sign In" />
                                    </SignInButton>

                                    <SignUpButton>
                                        <GradientButton label="Sign Up" />
                                    </SignUpButton>
                                </motion.div>
                            </Unauthenticated>
                        </>
                    )}
                </motion.div>

                {isLoading && (
                    <div className="w-full flex justify-center fixed bottom-0 left-0">
                        <BarLoader color={'#e67c06'} width={'98%'} />
                    </div>
                )}
            </motion.header>
        </AnimatePresence>
    );
};

export default Header;
