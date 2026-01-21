'use client';

import React, { useState, useEffect } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2, Mail, Clock, Edit } from 'lucide-react';

const SignInPage = () => {
    const { isLoaded, signIn } = useSignIn();
    const [isLoading, setIsLoading] = useState(false);
    const [emailLinkSent, setEmailLinkSent] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [formData, setFormData] = useState({emailAddress: ''});

    const handleChange = e => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Countdown timer effect
    useEffect(() => {
        if (emailLinkSent && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [emailLinkSent, timeRemaining]);

    // Open Gmail in new tab
    const openGmail = () => {
        window.open('https://mail.google.com', '_blank');
    };

    const openGmailToast = (openFor = 6000) => {
        toast.success('Link sent!', {
            description: 'Check your email — expires in 60s',
            action: {
                label: 'Open Gmail',
                onClick: openGmail
            },
            duration: openFor
        });
    };

    // Sign in with email verification link (magic link)
    const handleEmailLinkSignIn = async e => {
        e.preventDefault();
        if (!isLoaded) return;

        setIsLoading(true);

        try {
            // Create a sign-in attempt with email link strategy
            await signIn.create({
                identifier: formData.emailAddress,
            });

            // Prepare the first factor (email link)
            const { emailAddressId } = signIn.supportedFirstFactors.find(
                ff => ff.strategy === 'email_link' && ff.emailAddressId
            );

            await signIn.prepareFirstFactor({
                strategy: 'email_link',
                emailAddressId,
                redirectUrl: window.location.origin + '/dashboard',
            });

            setEmailLinkSent(true);
            setTimeRemaining(60); // Reset timer
            
            // Show custom toast with "Open Gmail" button
            openGmailToast();
        } catch (err) {
            console.error('Error:', err);
            toast.error(err.errors?.[0]?.message || 'Failed to send verification link!');
        } finally {
            setIsLoading(false);
        }
    };

    // Resend email link
    const handleResend = async () => {
        setIsLoading(true);
        try {
            // Create a new sign-in attempt
            await signIn.create({
                identifier: formData.emailAddress,
            });

            const { emailAddressId } = signIn.supportedFirstFactors.find(
                ff => ff.strategy === 'email_link' && ff.emailAddressId
            );

            await signIn.prepareFirstFactor({
                strategy: 'email_link',
                emailAddressId,
                redirectUrl: window.location.origin + '/dashboard',
            });

            setTimeRemaining(60); // Reset timer
            openGmailToast();
        } catch (err) {
            console.error('Error:', err);
            toast.error(err.errors?.[0]?.message || 'Failed to resend link!');
        } finally {
            setIsLoading(false);
        }
    };

    // Edit email and go back
    const handleEditEmail = () => {
        setEmailLinkSent(false);
        setTimeRemaining(60);
    };

    // Format time as MM:SS
    const formatTime = seconds => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Email link sent confirmation screen
    if (emailLinkSent) {
        return (
            <div className="w-116 p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700"
                >
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                            <Mail className="w-8 h-8 text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                            Check your email
                        </h1>
                        <p className="text-slate-400 mb-4">
                            We sent a verification link to{' '}
                            <button
                                onClick={openGmail}
                                className="text-white font-semibold hover:text-blue-400 transition-colors underline decoration-dotted cursor-pointer"
                            >
                                {formData.emailAddress}
                            </button>
                        </p>
                        <p className="text-slate-500 text-sm mb-8">
                            Click the link in the email to sign in to your account.
                        </p>

                        {/* Timer Display */}
                        {timeRemaining > 0 ? (
                            <div className="mb-6">
                                <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">Please wait</span>
                                </div>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={timeRemaining}
                                        initial={{ scale: 1.2, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                        className="text-4xl font-bold text-blue-400 mb-2"
                                    >
                                        {formatTime(timeRemaining)}
                                    </motion.div>
                                </AnimatePresence>
                                <p className="text-slate-500 text-sm">
                                    You can resend or edit your email after the timer expires
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 mb-6">
                                <p className="text-slate-400 text-sm mb-4">Didn't receive the email?</p>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleResend}
                                        disabled={isLoading}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Resending...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Resend
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleEditEmail}
                                        variant="outline"
                                        className="flex-1 bg-slate-700/50 hover:bg-slate-700 border-slate-600 text-white"
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Email
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Open Gmail Button - Always visible */}
                        <div className="mt-6 pt-6 border-t border-slate-700">
                            <Button
                                onClick={openGmail}
                                variant="outline"
                                className="w-full bg-slate-700/50 hover:bg-slate-700 border-slate-600 text-white"
                            >
                                <Mail className="mr-2 h-4 w-4" />
                                Open Gmail
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full min-w-100 max-w-xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700"
            >
                <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                    Welcome back
                </h1>
                <p className="text-slate-400 text-center mb-8">Sign in to your account to continue</p>

                <form onSubmit={handleEmailLinkSignIn} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="emailAddress" className="text-slate-400 pl-1">Email address</Label>
                        <Input
                            id="emailAddress"
                            name="emailAddress"
                            type="email"
                            placeholder="Enter your email address"
                            value={formData.emailAddress}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending link...
                            </>
                        ) : (
                            <>
                                <Mail className="mr-2 h-4 w-4" />
                                Send verification link
                            </>
                        )}
                    </Button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-800 text-slate-400">or</span>
                        </div>
                    </div>
                </form>

                {/* Google OAuth - Outside the form */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                        try {
                            await signIn?.authenticateWithRedirect({
                                strategy: 'oauth_google',
                                redirectUrl: window.location.origin + '/sso-callback',
                                redirectUrlComplete: window.location.origin + '/dashboard',
                            });
                        } catch (err) {
                            console.error('OAuth error:', err);
                            toast.error('Failed to sign in with Google');
                        }
                    }}
                    className="w-full bg-slate-700/50 hover:bg-slate-700 border-slate-600 text-white"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Continue with Google
                </Button>

                <div className="text-center text-slate-400 mt-6">
                    Don't have an account?{' '}
                    <Link href="/sign-up" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                        Sign up
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default SignInPage;
