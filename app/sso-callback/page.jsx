'use client';

import React, { useState, useEffect } from 'react';
import { useSignUp, useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function SSOCallback() {
    const { isLoaded: signUpLoaded, signUp, setActive } = useSignUp();
    const { isLoaded: signInLoaded, signIn } = useSignIn();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [needsUsername, setNeedsUsername] = useState(false);
    const [username, setUsername] = useState('');
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            if (!signUpLoaded || !signInLoaded) return;

            try {
                // Check if we have a signup in progress
                if (signUp && signUp.status === 'missing_requirements') {
                    console.log('Missing fields:', signUp.missingFields);
                    console.log('Required fields:', signUp.requiredFields);

                    // Check if username is in the missing fields
                    const missingUsername = signUp.missingFields?.includes('username');

                    // For OAuth signups, we should only need to collect username
                    // If other fields like password are required, there's a Clerk config issue
                    if (missingUsername) {
                        setNeedsUsername(true);
                        setIsProcessing(false);
                    } else {
                        // Username is not missing, but signup is incomplete
                        // This might be a configuration issue
                        console.error('Unexpected missing fields for OAuth signup:', signUp.missingFields);
                        setIsProcessing(false);
                        toast.error('Account setup incomplete. Please contact support.');
                        router.push('/sign-up');
                    }
                } else if (signUp && signUp.status === 'complete') {
                    // Signup is complete, activate session and redirect
                    await setActive({ session: signUp.createdSessionId });
                    router.push('/dashboard');
                } else if (signIn && signIn.status === 'needs_identifier') {
                    setIsProcessing(false);
                    router.push('/sign-up');
                } else {
                    setIsProcessing(false);
                    router.push('/dashboard');
                }
            } catch (error) {
                console.error('OAuth callback error:', error);
                setIsProcessing(false);
                toast.error('Authentication failed. Please try again.');
                router.push('/sign-up');
            }
        };

        handleCallback();
    }, [signUpLoaded, signInLoaded, signUp, setActive, router]);

    const handleUsernameSubmit = async e => {
        e.preventDefault();
        if (!username.trim()) {
            toast.error('Please enter a username');
            return;
        }

        setIsLoading(true);

        try {
            // Update the signup with the username
            await signUp.update({ username: username.trim() });

            // Reload the signup to get the updated status
            // After updating required fields, the signup should be complete
            await signUp.reload();

            if (signUp.status === 'complete') {
                await setActive({ session: signUp.createdSessionId });
                toast.success('Account created successfully!');
                router.push('/dashboard');
            } else {
                console.error('Signup incomplete:', signUp);
                toast.error('Failed to complete signup. Please try again.');
            }
        } catch (err) {
            console.error('Username update error:', err);
            toast.error(err.errors?.[0]?.message || 'Failed to set username. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading state while processing OAuth callback
    if (isProcessing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
                    <p className="text-slate-300 text-lg">Completing authentication...</p>
                </div>
            </div>
        );
    }

    // Show username collection form if needed
    if (needsUsername) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700 w-full max-w-md"
                >
                    <h1 className="text-3xl font-bold text-center mb-2 bg-linear-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                        Fill in missing fields
                    </h1>
                    <p className="text-slate-400 text-center mb-8">Please fill in the remaining details to continue.</p>

                    <form onSubmit={handleUsernameSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="pl-2 text-slate-200">
                                Username
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Choose a username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                autoFocus
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Completing signup...
                                </>
                            ) : (
                                <>
                                    Continue <span className="ml-1">→</span>
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-slate-400 mt-6">
                        Already have an account?{' '}
                        <Link href="/sign-in" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                            Sign in
                        </Link>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <span>Secured by</span>
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L4 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-8-4z" />
                            </svg>
                            <span className="font-semibold">clerk</span>
                        </div>
                        <Link href="#" className="hover:text-slate-400 transition-colors">
                            Terms
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Fallback loading state
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
                <p className="text-slate-300 text-lg">Redirecting...</p>
            </div>
        </div>
    );
}
