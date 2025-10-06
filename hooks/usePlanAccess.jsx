import { useAuth } from '@clerk/nextjs';
import { useSubscription } from '@clerk/nextjs/experimental';

export const usePlanAccess = () => {
    const { data: subscriptionData } = useSubscription();
    const { has } = useAuth();

    const isApprenticeUser = has?.({ plan: 'apprentice_user' });
    const isMasterUser = has?.({ plan: 'master_user' }) || false;
    const isDeityUser = has?.({ plan: 'deity_user' }) || false;

    // Derive plan once
    const plan = isDeityUser ? 'deity' : isMasterUser ? 'master' : 'apprentice';

    const baseFeatures = ['resize', 'crop', 'text'];
    const masterExtra = ['standardExports', 'backgroundRemoval', 'aiEdit', 'upscaler'];
    const deityExtra = ['adjust', 'colorAdjustments', 'aiExtender', 'retouch'];

    const limitModes = ['projects', 'exports'];

    const featuresByPlan = {
        apprentice: [...baseFeatures],
        master: [...baseFeatures, ...masterExtra],
        deity: [...baseFeatures, ...masterExtra, ...deityExtra],
    };

    const limitsByPlan = {
        apprentice: { projects: 3, exports: 5 },
        master: { projects: Infinity, exports: 20 },
        deity: { projects: Infinity, exports: Infinity },
    };

    const hasAccess = feature => featuresByPlan[plan].includes(feature);
    const allFeatures = [...new Set([...baseFeatures, ...masterExtra, ...deityExtra])];

    const planAccess = {
        ...allFeatures?.reduce((acc, feature) => ({ ...acc, [feature]: hasAccess(feature) }), {}),
        ...limitModes?.reduce(
            (acc, mode) => ({ ...acc, [`${[mode]}Limit`]: limitsByPlan[plan][mode] }),
            {}
        ),
    };

    const getRestrictedTools = () => {
        const restrictedTools = [];
        for (const [tool, access] of Object.entries(planAccess)) {
            if (!access) {
                restrictedTools.push(tool);
            }
        }
        return restrictedTools;
    };

    const planWiseLimit = limitsByPlan?.[plan];

    const checkLimit = (currentProjectCount, mode) => {
        if (!limitModes.includes(mode)) {
            throw new Error(`Invalid mode. Use one of: ${limitModes.join(', ')}`);
        }

        return planWiseLimit?.[mode] > currentProjectCount;
    };

    return {
        hasAccess,
        getRestrictedTools,
        subscriptionData,
        plan,
        planAccess,
        featuresByPlan,
        planWiseLimit,
        checkLimit,
        isApprenticeUser,
        isMasterUser,
        isDeityUser,
    };
};
