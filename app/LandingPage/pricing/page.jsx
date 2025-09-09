'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import ColorChangingText from '@/components/ui/color-changing-text';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { useAuth } from '@clerk/nextjs';

const PricingSection = React.memo(() => {
    const { has } = useAuth();
    console.log(has)
    const pricingPlans = [
        {
            plan: 'Apprentice',
            title: 'Apprentice Membership',
            subtitle: 'Begin your journey into the quantum realm',
            price: 1600,
            billing: 'per month',
            features: [
                '500 Quantum Edits each month',
                'Access to basic Reality Filters',
                'Export dimensions in crisp 4K',
                'Neural support from our team',
            ],
            buttonText: 'BEGIN ASCENSION',
            note: 'Invoices and receipts available for easy company reimbursement',
        },
        {
            plan: 'Master',
            title: 'Master Membership',
            subtitle: 'Command advanced multiverse powers',
            price: 4300,
            billing: 'per month',
            features: [
                'Unlimited Quantum Power',
                'Bend advanced layers of reality',
                'Export universes in stunning 8K',
                'Priority access to the Nexus',
                'API-level omnipotence',
            ],
            featured: true,
            buttonText: 'CLAIM DOMINION',
            note: 'Invoices and receipts available for easy company reimbursement',
            planId: 'cplan_32QixVCEdiOSJYuhsXoPJ9D2C4X',
        },
        {
            plan: 'Deity',
            title: 'Deity Membership',
            subtitle: 'Transcend limits, reshape existence',
            price: 13100,
            billing: 'per month',
            features: [
                'Custom-crafted Reality Models',
                'Infinite batch processing power',
                'Godmode export in 16K resolution',
                'Direct hotline to the Creators',
                'Full universe white-label rights',
            ],
            buttonText: 'TRANSCEND REALITY',
            note: 'Invoices and receipts available for easy company reimbursement',
            planId: 'cplan_32QjKxZGqLwXCdqz2s4urBP6Nvs',
        },
    ];

    const [selectedTab, setSelectedTab] = useState(pricingPlans[0].plan);
    const currentPlan = pricingPlans.find(p => p.plan === selectedTab);

    return (
        <section id="pricing" className="py-32 px-4 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.p
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-xl md:text-2xl text-gray-300 font-light"
                    >
                        <ColorChangingText text="PRICING MATRIX" />
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-xl md:text-2xl text-gray-300 font-light"
                    >
                        Ascend to your rightful place in the{' '}
                        <span className="text-cyan-400 font-medium">digital pantheon</span>
                    </motion.p>

                    {/* Status Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center justify-center gap-2 mt-4"
                    >
                        <motion.div
                            className="w-3 h-3 rounded-full bg-cyan-400"
                            animate={{
                                opacity: [1, 0.3, 1],
                                scale: [1, 1.3, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                        <span className="text-cyan-400 font-mono text-sm tracking-wider">
                            PRICING MATRIX LOADED
                        </span>
                    </motion.div>
                </div>

                {/* Pricing tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mb-12 flex items-center justify-center gap-6 ring-1 w-fit mx-auto ring-slate-700/80 rounded-lg p-2 backdrop-blur-sm overflow-hidden"
                >
                    {pricingPlans.map(({ plan }) => (
                        <button
                            key={plan}
                            onClick={() => setSelectedTab(plan)}
                            className={cn(
                                'relative px-3 py-1 rounded-md border-none outline-none text-slate-200 hover:text-slate-300 transition-colors ring-1 ring-transparent hover:ring-slate-700',
                                selectedTab === plan && 'text-slate-300 ring-0 bg-slate-700'
                            )}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {selectedTab === plan && (
                                <motion.div
                                    layoutId="pilltab"
                                    transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                                    className="absolute inset-0 bg-gradient-to-r from-slate-800/80 via-slate-700/60 to-black/30 rounded-md z-0"
                                />
                            )}
                            <span className="relative block z-10">
                                {plan.featured ? <AnimatePresence>{plan} </AnimatePresence> : plan}
                            </span>
                        </button>
                    ))}
                </motion.div>

                {/* Pricing content */}
                <div className="max-w-6xl h-[25rem] mx-auto flex justify-between gap-10 ring-1 ring-slate-800 rounded-2xl bg-slate-900/70 backdrop-blur-sm p-8">
                    {/* Left: Features */}
                    <div className="flex flex-col gap-6 flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentPlan.plan + '-title'}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.4 }}
                                className="w-full h-1/2 pt-4 relative"
                            >
                                {currentPlan.featured && (
                                    <motion.div
                                        className="absolute ring rounded-lg text-sm h-fit flex items-start py-1 px-3 justify-center right-0"
                                        animate={{
                                            boxShadow: [
                                                '0 0 0 1px rgb(236 72 153)',
                                                '0 0 0 1px #ffaa40',
                                                '0 0 0 1px rgb(236 72 153)',
                                            ],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    >
                                        <AnimatedGradientText>Featured</AnimatedGradientText>
                                    </motion.div>
                                )}
                                <h2 className="text-2xl font-semibold text-white">
                                    {currentPlan?.featured ? (
                                        <AnimatedGradientText>
                                            {currentPlan.title}
                                        </AnimatedGradientText>
                                    ) : (
                                        <span>{currentPlan.title}</span>
                                    )}
                                </h2>
                                <p className="text-gray-400 max-w-full pt-6">
                                    Unlock powerful tools and ascend higher with the{' '}
                                    {currentPlan.plan} tier.
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex items-center gap-6">
                            <span className="text-indigo-400 whitespace-nowrap">
                                What&apos;s Included
                            </span>
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '100%' }}
                                transition={{ duration: 1 }}
                                className=" h-0.5 bg-slate-700"
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.ul
                                key={currentPlan.plan + '-features'}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                className="h-1/2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-300 mt-2"
                            >
                                {currentPlan.features.map((feature, idx) => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <span className="text-indigo-400">✓</span> {feature}
                                    </li>
                                ))}
                            </motion.ul>
                        </AnimatePresence>
                    </div>

                    {/* Right: Pricing card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPlan.plan + '-card'}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.4 }}
                            className="bg-slate-950 ring ring-slate-700 rounded-xl p-8 w-[25rem] flex flex-col justify-between"
                        >
                            <div className="h-[45%] pt-3">
                                <motion.p
                                    key={currentPlan.plan + '-subtitle'}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-gray-400 text-sm text-center"
                                >
                                    {currentPlan.subtitle}
                                </motion.p>
                                <motion.div
                                    key={currentPlan.plan + '-price'}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                    className="text-4xl flex items-end justify-center font-bold text-white mt-4 text-center"
                                >
                                    {currentPlan?.featured ? (
                                        <AnimatedGradientText>
                                            ₹{currentPlan.price}
                                            <span className="text-lg font-normal ml-2 mb-1">
                                                {currentPlan.billing}
                                            </span>
                                        </AnimatedGradientText>
                                    ) : (
                                        <>
                                            <span>₹{currentPlan.price}</span>
                                            <span className="text-lg font-normal text-gray-400 ml-2 mb-1">
                                                {currentPlan.billing}
                                            </span>
                                        </>
                                    )}
                                </motion.div>
                            </div>

                            <Button
                                variant={'badge'}
                                className={`w-4/5 mx-auto mt-4 h-12 text-[1rem] flex items-center justify-center font-semibold`}
                            >
                                <motion.span
                                    key={currentPlan.plan + '-button'}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -40 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {currentPlan.buttonText}
                                </motion.span>
                            </Button>

                            <motion.p
                                key={currentPlan.plan + '-note'}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="text-gray-500 text-sm mt-4 text-center"
                            >
                                {currentPlan.note}
                            </motion.p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
});

export default PricingSection;
