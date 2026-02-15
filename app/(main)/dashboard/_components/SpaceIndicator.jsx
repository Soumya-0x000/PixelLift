'use client';

import { HardDrive } from 'lucide-react';
import { useMemo } from 'react';
import { useConvexQuery } from '@/hooks/useConvexQuery';
import { api } from '@/convex/_generated/api';
import { motion } from 'motion/react';

const SpaceIndicator = () => {
    const { data: userData } = useConvexQuery(api.user.getCurrentUser);

    const storageStats = useMemo(() => {
        if (!userData) return null;

        const formatBytes = bytes => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        const used = userData.totalStorageBytes || 0;
        const limit = userData.storageLimit || 0;
        const remaining = Math.max(0, limit - used);
        const percentage = limit > 0 ? Math.min(100, ((used / limit) * 100).toFixed(2)) : 0;

        return {
            used,
            limit,
            remaining,
            percentage,
            usedFormatted: formatBytes(used),
            limitFormatted: formatBytes(limit),
            remainingFormatted: formatBytes(remaining),
        };
    }, [userData]);

    if (!storageStats) return null;

    const gradient =
        storageStats.percentage >= 90
            ? 'linear-gradient(to right, #ab2a2a, #ef4444)' // dark red → red
            : storageStats.percentage >= 70
            ? 'linear-gradient(to right, #af5019, #eab308)' // dark yellow → yellow
            : 'linear-gradient(to right, #3459bd, #3b82f6)'; // dark blue → blue

    return (
        <div className="ring-1 ring-slate-700/50 rounded-md py-1.5 px-2 bg-slate-800/30 w-full max-w-160">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-200 font-medium text-xs">Storage Usage |</span>
                    <span className="text-slate-400 text-xs">
                        Space left: <span className="text-slate-200">{storageStats.remainingFormatted}</span>
                    </span>
                </div>

                <div className="text-xs text-slate-400">
                    <span className="text-slate-200 font-semibold">{storageStats.usedFormatted}</span>
                    {' / '}
                    {storageStats.limitFormatted}
                    {' | '}
                    <span
                        className={`font-medium ${
                            storageStats.percentage >= 90 ? 'text-red-400' : storageStats.percentage >= 70 ? 'text-yellow-400' : 'text-blue-400'
                        }`}
                    >
                        {storageStats.percentage}% used
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                <motion.div
                    className="h-full rounded-full origin-left"
                    initial={false}
                    animate={{ scaleX: storageStats.percentage / 100 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{ background: gradient }}
                />
            </div>
        </div>
    );
};

export default SpaceIndicator;
