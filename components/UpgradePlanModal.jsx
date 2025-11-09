import { useRouter } from 'next/navigation';
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';

const UpgradePlanModal = ({ openModal, closeModal }) => {
    const router = useRouter();

    const upgradePlan = () => {
        router.push('/?scrollto=pricing');
        closeModal();
    };

    return (
        <Dialog open={openModal} onOpenChange={closeModal} className={' backdrop-blur-md'}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <span
                            className={`flex gap-3 items-center text-base tracking-wider bg-yellow-400/30 text-yellow-200 ring-1 ring-yellow-600 rounded-md px-2 py-1 w-fit`}
                        >
                            <Crown className=" w-4.5 h-4.5" strokeWidth={2.3} /> Upgrade Plan
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <DialogDescription asChild>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="flex flex-col gap-3 text-center text-[.9rem] leading-relaxed my-3"
                    >
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-slate-600 dark:text-slate-300"
                        >
                            You'll be redirected to our{' '}
                            <span className="font-semibold text-sky-500">pricing page</span> to
                            unlock more possibilities.
                        </motion.span>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="flex flex-col gap-4 text-left text-slate-700 dark:text-slate-200"
                        >
                            <div className="flex flex-col bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-md border-l-4 border-emerald-500">
                                <span className="font-semibold text-emerald-500">Master Plan</span>
                                <span className="ml-7 text-sm">
                                    Unlimited projects plus{' '}
                                    <span className="text-emerald-600 dark:text-emerald-400">
                                        standard exports, background removal, AI editing & upscaling
                                    </span>
                                </span>
                            </div>

                            <div className="flex flex-col bg-purple-500/5 dark:bg-purple-500/10 p-3 rounded-md border-l-4 border-purple-500">
                                <span className="font-semibold text-purple-500">Deity Plan</span>
                                <span className="ml-7 text-sm">
                                    Everything in Master, plus{' '}
                                    <span className="text-purple-600 dark:text-purple-400">
                                        advanced adjustments, color tools, AI extender & retouching
                                    </span>
                                </span>
                            </div>
                        </motion.div>

                        <motion.span
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="text-xs text-slate-500 dark:text-slate-400 mt-1"
                        >
                            ✨ Choose the plan that fits your creative workflow
                        </motion.span>
                    </motion.div>
                </DialogDescription>

                <DialogFooter>
                    <Button variant="secondary" onClick={upgradePlan}>
                        Go to Pricing
                    </Button>
                    <Button onClick={closeModal} variant="destructive">
                        Maybe Later
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UpgradePlanModal;
