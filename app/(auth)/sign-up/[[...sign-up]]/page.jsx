'use client';

import React, { useState } from 'react';
import { SignUp, useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const SignUpPage = () => {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        emailAddress: '',
        password: '',
        code: '',
    });

    const handleChange = e => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!isLoaded) return;

        setIsLoading(true);

        try {
            await signUp.create({
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                emailAddress: formData.emailAddress,
                password: formData.password,
            });

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

            setPendingVerification(true);
            toast.success('Verification code sent to your email!');
        } catch (err) {
            console.error('Error:', err);
            toast.error(err.errors?.[0]?.message || 'Something went wrong!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async e => {
        e.preventDefault();
        if (!isLoaded) return;

        setIsLoading(true);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code: formData.code,
            });

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });
                toast.success('Account created successfully!');
                router.push('/dashboard');
            } else {
                console.error('Verification incomplete:', completeSignUp);
                toast.error('Verification failed. Please try again.');
            }
        } catch (err) {
            console.error('Error:', err);
            toast.error(err.errors?.[0]?.message || 'Invalid verification code!');
        } finally {
            setIsLoading(false);
        }
    };

    if (pendingVerification) {
        return (
            <div className="w-full max-w-lg mx-auto p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700"
                >
                    <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                        Verify your email
                    </h1>
                    <p className="text-slate-400 text-center mb-8">We sent a verification code to {formData.emailAddress}</p>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="code">Verification Code</Label>
                            <Input
                                id="code"
                                name="code"
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={formData.code}
                                onChange={handleChange}
                                required
                                maxLength={6}
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
                                    Verifying...
                                </>
                            ) : (
                                'Verify Email'
                            )}
                        </Button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700"
            >
                <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                    Create your account
                </h1>
                <p className="text-slate-400 text-center mb-8">Welcome! Please fill in the details to get started.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First name</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                type="text"
                                placeholder="First name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last name</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                type="text"
                                placeholder="Last name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* <div className="grid grid-cols-2 gap-4"> */}
                        <div className="space-y-2">
                            <Label htmlFor="emailAddress">Email address</Label>
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

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    {/* </div> */}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Continue →'
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

                {/* Google OAuth - Outside the form to avoid CAPTCHA */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                        try {
                            await signUp?.authenticateWithRedirect({
                                strategy: 'oauth_google',
                                redirectUrl: window.location.origin + '/sso-callback',
                                redirectUrlComplete: window.location.origin + '/dashboard',
                            });
                        } catch (err) {
                            console.error('OAuth error:', err);
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
                    Already have an account?{' '}
                    <Link href="/sign-in" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                        Sign in
                    </Link>
                </div>
            </motion.div>

            <SignUp/>
        </div>
    );
};

export default SignUpPage;
