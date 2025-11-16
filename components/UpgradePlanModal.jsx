import { useRouter } from 'next/navigation';
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Crown, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import PricingSection from '@/app/LandingPage/pricing/page';
import { Alert, AlertDescription } from './ui/alert';

const UpgradePlanModal = ({ openModal, closeModal, upgradeMsg }) => {
    const router = useRouter();

    const upgradePlan = () => {
        router.push('/?scrollto=pricing');
        closeModal();
    };

    return (
        <Dialog open={openModal} onOpenChange={closeModal} className={' backdrop-blur-md '}>
            <DialogContent className={`w-[67vw] max-w-[67vw]`}>
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
                    <div>
                        {upgradeMsg?.title && (
                            <Alert className="bg-amber-500/10 border-amber-500/20 mb-4">
                                <Sparkles className="h-5 w-5 text-amber-400" />
                                <AlertDescription className="text-amber-300/80">
                                    <span className="font-semibold text-amber-400 mb-1">
                                        PIXXELLIFT - {upgradeMsg?.title}
                                    </span>
                                    {upgradeMsg?.description}
                                </AlertDescription>
                            </Alert>
                        )}

                        <PricingSection
                            showHeader={false}
                            className="p-1 space-y-8 max-w-full w-full"
                            tabsPosition="tr"
                        />
                    </div>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};

export default UpgradePlanModal;
