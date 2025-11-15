'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import ColorChangingText from '@/components/ui/color-changing-text';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import { BorderBeam } from '@/components/ui/border-beam';
import {
    CheckoutButton,
    PlanDetailsButton,
    usePlans,
    useSubscription,
} from '@clerk/nextjs/experimental';

function formatDate(inputDate) {
    const date = new Date(inputDate);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

const PricingSection = React.memo(
    ({ showHeader = true, className = '', tabsPosition = 'center' }) => {
        const { data: pricingData = [] } = usePlans();
        const { user } = useUser();
        const { data: subscriptionData } = useSubscription();
        const [mergedPlans, setMergedPlans] = useState([]);
        const [showDurationTabs, setShowDurationTabs] = useState(false);

        // Base plan structure
        const basePricingPlans = [
            {
                plan: 'Apprentice',
                id: 'apprentice_user',
                title: 'Apprentice Membership',
                subtitle: 'Begin your journey into the quantum realm',
                billing: '/month',
                features: [
                    '3 projects maximum',
                    '5 exports / month',
                    'Basic crop & resize',
                    'Color adjustments',
                    'Standard quality exports',
                ],
                buttonText: 'BEGIN ASCENSION',
                note: 'Invoices and receipts available for easy company reimbursement',
                planId: 'cplan_32QhQ98KSbfwLZYr53kse70Il1x',
            },
            {
                plan: 'Master',
                id: 'master_user',
                title: 'Master Membership',
                subtitle: 'Command advanced multiverse powers',
                billing: '/month',
                features: [
                    'All Apprentice features',
                    '20 exports / month',
                    'Unlimited projects',
                    'All editing tools',
                    'AI background removal',
                ],
                featured: true,
                buttonText: 'CLAIM DOMINION',
                note: 'Invoices and receipts available for easy company reimbursement',
                planId: 'cplan_32QixVCEdiOSJYuhsXoPJ9D2C4X',
            },
            {
                plan: 'Deity',
                id: 'deity_user',
                title: 'Deity Membership',
                subtitle: 'Transcend limits, reshape existence',
                billing: '/month',
                features: [
                    'All Master features',
                    'Unlimited exports',
                    'Color adjustments',
                    'Standard quality exports',
                    'AI Extender',
                    'Retouch, Upscaler & more',
                ],
                buttonText: 'TRANSCEND REALITY',
                note: 'Invoices and receipts available for easy company reimbursement',
                planId: 'cplan_32QjKxZGqLwXCdqz2s4urBP6Nvs',
            },
        ];

        const pricingTimes = ['Monthly', 'Yearly'];

        const [selectedTab, setSelectedTab] = useState({
            price: basePricingPlans[0].plan,
            time: pricingTimes[0],
        });

        const getSubscriptionInfo = plan => {
            if (!subscriptionData?.subscriptionItems || !plan) return null;

            return subscriptionData.subscriptionItems.find(item => item.plan?.id === plan.planId);
        };

        const getSubscriptionStatus = plan => {
            const subscription = getSubscriptionInfo(plan);
            if (!subscription) return 'none';

            if (subscription.status === 'active') {
                if (subscription.canceledAt) return 'canceled';
                if (subscription.isFreeTrial) return 'trial';
                return 'active';
            }

            if (subscription.status === 'upcoming') return 'upcoming';
            return 'none';
        };

        const getTrialInfo = plan => {
            const subscription = getSubscriptionInfo(plan);
            if (!subscription || !subscription.isFreeTrial) return null;

            const startDate = new Date(subscription.periodStart);
            const endDate = new Date(
                startDate.getTime() + plan.freeTrialDays * 24 * 60 * 60 * 1000
            );
            const now = new Date();
            const daysLeft = Math.max(0, Math.ceil((endDate - now) / (24 * 60 * 60 * 1000)));

            return {
                startDate,
                endDate,
                daysLeft,
                isActive: daysLeft > 0,
            };
        };

        const hasActiveSubscription = () => {
            return subscriptionData?.subscriptionItems?.some(
                item => item.status === 'active' && !item.canceledAt
            );
        };

        const hasUsedTrial = plan => {
            if (!user || !plan?.hasFreeTrial) return false;

            // Check if user previously had a trial for this plan
            const hadTrial = subscriptionData?.subscriptionItems?.some(
                item => item.plan?.id === plan.planId && item.isFreeTrial
            );

            // Also check localStorage as fallback
            const localStorageUsed = localStorage.getItem(`trial_used_${plan.planId}`) === 'true';

            return hadTrial || localStorageUsed;
        };

        const getButtonState = plan => {
            if (!plan) return { text: 'SELECT PLAN', disabled: false };

            const status = getSubscriptionStatus(plan);
            const trialInfo = getTrialInfo(plan);
            const subscription = getSubscriptionInfo(plan);
            const hasActiveSub = hasActiveSubscription();
            const trialUsed = hasUsedTrial(plan);

            switch (status) {
                case 'trial':
                    if (trialInfo?.isActive) {
                        return {
                            text: `${trialInfo.daysLeft} DAYS LEFT`,
                            disabled: true,
                        };
                    }
                    break;

                case 'active':
                    return { text: 'CURRENT PLAN', disabled: true };

                case 'canceled':
                    return { text: 'REACTIVATE', disabled: false };

                case 'upcoming':
                    return {
                        text: `STARTS ${formatDate(subscription.periodStart)}`,
                        disabled: true,
                    };

                case 'none':
                    // If user has active subscription, show switch option
                    if (hasActiveSub && !plan.isFree) {
                        return { text: `SWITCH TO ${plan.plan.toUpperCase()}`, disabled: false };
                    }

                    // Handle trial logic for new subscriptions
                    if (plan.hasFreeTrial && !plan.isFree) {
                        if (trialUsed) {
                            return { text: plan.buttonText, disabled: false };
                        } else {
                            return {
                                text: `START FREE TRIAL`,
                                disabled: false,
                            };
                        }
                    }

                    return { text: plan.buttonText, disabled: false };
            }

            return { text: plan.buttonText, disabled: false };
        };

        const getBadgeInfo = plan => {
            if (!plan) return null;

            const status = getSubscriptionStatus(plan);
            const trialInfo = getTrialInfo(plan);
            const subscription = getSubscriptionInfo(plan);
            const trialUsed = hasUsedTrial(plan);

            // Free plan badge
            if (plan.isFree) {
                return { type: 'free', text: 'Always Free', color: 'slate' };
            }

            switch (status) {
                case 'trial':
                    if (trialInfo?.isActive) {
                        return {
                            type: 'trial-active',
                            text: `Trial Active (${trialInfo.daysLeft} days left)`,
                            color: 'blue',
                        };
                    }
                    break;

                case 'canceled':
                    return {
                        type: 'ending',
                        text: `Ends ${formatDate(subscription.periodEnd)}`,
                        color: 'amber',
                    };

                case 'none':
                    // Trial badges for non-subscribed plans
                    if (plan.hasFreeTrial && !plan.isFree) {
                        if (trialUsed) {
                            return { type: 'trial-used', text: 'Trial Used', color: 'amber' };
                        } else {
                            return {
                                type: 'trial-available',
                                text: `${plan.freeTrialDays} Day Free Trial`,
                                color: 'blue',
                            };
                        }
                    }
                    break;
            }

            return null;
        };

        // Merge base plans with API data
        useEffect(() => {
            if (pricingData && pricingData.length > 0) {
                const updatedPlans = basePricingPlans.map(basePlan => {
                    const apiPlan = pricingData.find(p => p?.id === basePlan?.planId);

                    if (apiPlan) {
                        return {
                            ...basePlan,
                            ...apiPlan,
                            features: basePlan.features,
                            price: apiPlan.fee?.amountFormatted || '0.00',
                            priceAmount: apiPlan.fee?.amount || 0,
                            annualPrice: apiPlan.annualFee?.amountFormatted || '0.00',
                            annualPriceAmount: apiPlan.annualFee?.amount || 0,
                            annualMonthlyPrice: apiPlan.annualMonthlyFee?.amountFormatted || '0.00',
                            annualMonthlyPriceAmount: apiPlan.annualMonthlyFee?.amount || 0,
                            currencySymbol: apiPlan.fee?.currencySymbol || '$',
                            isFree: apiPlan.fee?.amount === 0,
                            hasFreeTrial: apiPlan.freeTrialEnabled,
                            freeTrialDays: apiPlan.freeTrialDays,
                        };
                    }
                    return basePlan;
                });
                setMergedPlans(updatedPlans);
            } else {
                setMergedPlans(basePricingPlans);
            }
        }, [pricingData]);

        const currentPlan = mergedPlans.find(p => p.plan === selectedTab?.price) || mergedPlans[0];
        const currentStatus = getSubscriptionInfo(currentPlan)?.status || 'none';
        const currentBadge = getBadgeInfo(currentPlan);
        const buttonState = getButtonState(currentPlan);

        // Get the correct price based on selected time period
        const getCurrentPrice = plan => {
            if (!plan) return { price: '0.00', symbol: '$', billing: '/month' };

            if (plan.isFree) {
                return {
                    price: '0',
                    symbol: '',
                    billing: 'Always Free',
                };
            }

            if (selectedTab.time === 'Yearly' && plan.annualMonthlyPrice) {
                return {
                    price: plan.annualMonthlyPrice,
                    symbol: plan.currencySymbol || '$',
                    billing: '/month (billed yearly)',
                    savings: `Save ${plan.currencySymbol}${(((plan.priceAmount - plan.annualMonthlyPriceAmount) * 12) / 100).toFixed(0)}/year`,
                };
            }

            return {
                price: plan.price || '0.00',
                symbol: plan.currencySymbol || '$',
                billing: '/month',
            };
        };

        const currentPricing = getCurrentPrice(currentPlan);

        const getBadgeStyles = color => {
            const styles = {
                slate: 'bg-slate-800/40 text-slate-200 ring-slate-700',
                blue: 'bg-blue-600/40 text-blue-200 ring-blue-500',
                amber: 'bg-amber-600/20 text-amber-200 ring-amber-500',
            };
            return styles[color] || styles.slate;
        };

        const pricingTabsPosition = {
            tl: 'mr-auto',
            tr: 'ml-auto',
            center: 'mx-auto',
        }[tabsPosition];

        useEffect(() => {
            setShowDurationTabs(currentPlan && !currentPlan.isFree);
        }, [currentPlan]);

        return (
            <section
                id="pricing"
                className={cn(
                    'py-32 px-4 relative overflow-hidden max-w-7xl mx-auto z-10 space-y-24',
                    className
                )}
            >
                {/* Header */}
                {showHeader && (
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
                )}

                {/* Pricing plan tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className={`flex items-center justify-center gap-6 ring-1 w-fit ${pricingTabsPosition} ring-slate-700/80 rounded-lg p-2 backdrop-blur-sm overflow-hidden`}
                >
                    {mergedPlans.map(({ plan }) => (
                        <button
                            key={plan}
                            onClick={() => setSelectedTab(prev => ({ ...prev, price: plan }))}
                            className={cn(
                                'relative px-3 py-1 rounded-md border-none outline-none text-slate-200 hover:text-slate-300 transition-colors ring-1 ring-transparent hover:ring-slate-700',
                                selectedTab?.price === plan && 'text-slate-300 ring-0 bg-slate-700'
                            )}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {selectedTab?.price === plan && (
                                <motion.div
                                    layoutId="pilltab1"
                                    transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                                    className="absolute inset-0 bg-gradient-to-r from-slate-800/80 via-slate-700/60 to-black/30 rounded-md z-0"
                                />
                            )}
                            <span className="relative block z-10">{plan}</span>
                        </button>
                    ))}
                </motion.div>

                <div className=" w-full">
                    {/* Time period tabs - only show for paid plans */}
                    <AnimatePresence>
                        {showDurationTabs && (
                            <motion.div
                                initial={{ opacity: 0, scaleY: 0 }}
                                animate={{ opacity: 1, scaleY: 1 }}
                                exit={{ opacity: 0, scaleY: 0 }}
                                transition={{ duration: 0.6, ease: 'easeInOut' }}
                                style={{ originY: 1 }}
                                className="flex items-center justify-center gap-6 z-10 w-fit mx-auto border-2 border-slate-800 border-b-transparent rounded-t-2xl bg-slate-900/70 backdrop-blur-sm p-2 overflow-hidden absolute left-[8rem] -translate-y-[3.2rem]"
                            >
                                {pricingTimes.map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTab(prev => ({ ...prev, time }))}
                                        className={cn(
                                            'relative px-3 py-1 rounded-md border-none outline-none text-slate-200 hover:text-slate-300 transition-colors ring-1 ring-transparent hover:ring-slate-700',
                                            selectedTab?.time === time &&
                                                'text-slate-300 ring-0 bg-slate-700'
                                        )}
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        {selectedTab?.time === time && (
                                            <motion.div
                                                layoutId="pilltab2"
                                                transition={{
                                                    type: 'spring',
                                                    bounce: 0.3,
                                                    duration: 0.6,
                                                }}
                                                className="absolute inset-0 bg-gradient-to-r from-slate-800/80 via-slate-700/60 to-black/30 rounded-md z-0"
                                            />
                                        )}
                                        <span className="relative block z-10">
                                            {time}
                                            {time === 'Yearly' &&
                                                currentPlan?.annualMonthlyPriceAmount <
                                                    currentPlan?.priceAmount && (
                                                    <span className="ml-1 text-xs text-green-400">
                                                        Save
                                                    </span>
                                                )}
                                        </span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pricing content */}
                    <motion.div
                        layout
                        className=" max-w-6xl h-[25rem] mx-auto flex justify-between gap-10 ring-1 ring-slate-800 rounded-2xl bg-slate-900/70 backdrop-blur-sm p-8 relative -z-10"
                    >
                        {/* Left: Features */}
                        <div className="flex flex-col gap-6 flex-1">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${currentPlan?.plan}-title`}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    transition={{ duration: 0.4 }}
                                    className="w-full h-1/2 pt-4 relative"
                                >
                                    {currentPlan?.featured && (
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
                                    <div className="text-2xl font-semibold text-white">
                                        <div className="text-2xl font-semibold text-white">
                                            <SignedIn>
                                                <PlanDetailsButton planId={currentPlan?.planId}>
                                                    {currentPlan?.featured ? (
                                                        <AnimatedGradientText>
                                                            {currentPlan?.title}
                                                        </AnimatedGradientText>
                                                    ) : (
                                                        currentPlan?.title
                                                    )}
                                                </PlanDetailsButton>
                                            </SignedIn>
                                            <SignedOut>
                                                {currentPlan?.featured ? (
                                                    <AnimatedGradientText>
                                                        {currentPlan?.title}
                                                    </AnimatedGradientText>
                                                ) : (
                                                    <span>{currentPlan?.title}</span>
                                                )}
                                            </SignedOut>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 max-w-full pt-6">
                                        {currentPlan?.description ||
                                            `Unlock powerful tools and ascend higher with the ${currentPlan?.plan} tier.`}
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
                                    className="h-0.5 bg-slate-700"
                                />
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.ul
                                    key={`${currentPlan?.plan}-features`}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                    className="h-1/2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-300 mt-2"
                                >
                                    {currentPlan?.features?.map((feature, idx) => (
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
                                key={currentPlan?.plan}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.4 }}
                                className="bg-slate-950 ring ring-slate-700 rounded-xl p-8 w-[25rem] flex flex-col justify-between relative z-20"
                            >
                                <div className="h-[45%] pt-3">
                                    <p className="text-gray-400 text-sm text-center">
                                        {currentPlan?.subtitle}
                                    </p>

                                    <div className="text-4xl flex flex-col items-center justify-center font-bold text-white mt-4 text-center">
                                        {currentPlan?.featured && !currentPlan?.isFree ? (
                                            <AnimatedGradientText>
                                                <span className="flex items-end">
                                                    {currentPricing.symbol}
                                                    {currentPricing.price}
                                                    <span className="text-lg font-normal ml-2 mb-1">
                                                        {currentPricing.billing}
                                                    </span>
                                                </span>
                                            </AnimatedGradientText>
                                        ) : currentPlan?.isFree ? (
                                            <span className="text-green-400">Free</span>
                                        ) : (
                                            <span className="flex items-end">
                                                {currentPricing.symbol}
                                                {currentPricing.price}
                                                <span className="text-lg font-normal text-gray-400 ml-2 mb-1">
                                                    {currentPricing.billing}
                                                </span>
                                            </span>
                                        )}

                                        {/* Show savings for yearly plans */}
                                        {currentPricing.savings && (
                                            <span className="text-sm text-green-400 font-normal mt-2">
                                                {currentPricing.savings}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <SignedIn>
                                    <CheckoutButton
                                        planId={currentPlan?.planId}
                                        planPeriod={
                                            selectedTab.time === 'Yearly' ? 'annual' : 'month'
                                        }
                                    >
                                        <Button
                                            variant={'badge'}
                                            className={`w-4/5 mx-auto mt-4 h-12 text-[1rem] flex items-center justify-center font-semibold ${buttonState.disabled ? 'opacity-50' : ''}`}
                                            disabled={buttonState.disabled}
                                        >
                                            {buttonState.text}
                                        </Button>
                                    </CheckoutButton>
                                </SignedIn>

                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <Button
                                            variant={'badge'}
                                            className="w-4/5 mx-auto mt-4 h-12 text-[1rem] flex items-center justify-center font-semibold"
                                        >
                                            {buttonState.text}
                                        </Button>
                                    </SignInButton>
                                </SignedOut>

                                <p className="text-gray-500 text-sm mt-4 text-center">
                                    {currentPlan?.note}
                                </p>

                                {/* Dynamic badge system */}
                                {currentBadge && (
                                    <motion.div
                                        key={currentBadge.type}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 20, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={cn(
                                            'uppercase absolute -top-4 left-8 tracking-wider backdrop-blur-xl ring-1 text-xs px-2 py-1 rounded-md',
                                            getBadgeStyles(currentBadge.color)
                                        )}
                                    >
                                        {currentBadge.text}
                                    </motion.div>
                                )}

                                {/* Secondary badge for active/upcoming plans (right side) */}
                                {(currentStatus === 'active' || currentStatus === 'upcoming') &&
                                    currentStatus !== 'trial' && (
                                        <div className="uppercase absolute -top-4 right-6 tracking-widest bg-slate-950 ring ring-slate-700 text-slate-200 backdrop-blur-xl text-[0.7rem] px-2.5 py-1 rounded-md -z-10">
                                            {currentStatus === 'active' ? 'Active' : 'Upcoming'}
                                        </div>
                                    )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Border beam for active plans */}
                        {(currentStatus === 'active' || currentStatus === 'trial') && (
                            <>
                                <BorderBeam
                                    duration={6}
                                    size={400}
                                    className="from-transparent via-amber-300 to-transparent"
                                />
                                <BorderBeam
                                    duration={6}
                                    delay={3}
                                    size={400}
                                    borderWidth={2}
                                    className="from-transparent via-orange-400 to-transparent"
                                />
                            </>
                        )}
                    </motion.div>
                </div>
            </section>
        );
    }
);

PricingSection.displayName = 'PricingSection';

export default PricingSection;
