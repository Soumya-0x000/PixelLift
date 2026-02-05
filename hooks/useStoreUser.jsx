import { useUser } from '@clerk/nextjs';
import { useConvexAuth } from 'convex/react';
import { useEffect, useMemo, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useSubscription } from '@clerk/nextjs/experimental';

export default function useStoreUser() {
    const convexAuth = useConvexAuth();
    const { isAuthenticated, isLoading: convexAuthLoading } = convexAuth;
    const userResponse = useUser();
    const { user } = userResponse;
    const { data: subscriptionData } = useSubscription();

    // Safely derive current plan (memoized)
    const currentUserPlan = useMemo(() => {
        const subscriptionItems = subscriptionData?.subscriptionItems ?? [];
        const activeItem = subscriptionItems.find(item => item.status === 'active');
        return activeItem?.plan?.slug ?? 'apprentice_user';
    }, [subscriptionData]);

    const [userId, setUserId] = useState(null);
    const storeUser = useMutation(api.user.store);

    // Create user in Convex once authenticated
    useEffect(() => {
        if (!isAuthenticated || convexAuthLoading) return;

        let isCancelled = false;

        const createUser = async () => {
            try {
                const id = await storeUser({ plan: currentUserPlan });
                if (!isCancelled) setUserId(id);
            } catch (error) {
                console.error('Error storing user:', error);
            }
        };

        createUser();
        return () => {
            isCancelled = true;
        };
    }, [isAuthenticated, convexAuthLoading, currentUserPlan, storeUser]);

    return {
        isLoading: convexAuthLoading || (isAuthenticated && userId === null),
        isAuthenticated: isAuthenticated && Boolean(userId),
        userId,
        user,
        currentUserPlan,
    };
}
