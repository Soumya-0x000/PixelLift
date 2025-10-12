import { useUser } from '@clerk/nextjs';
import { useConvexAuth } from 'convex/react';
import { useEffect, useMemo, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useSubscription } from '@clerk/nextjs/experimental';

export default function useStoreUser() {
    const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
    const { user } = useUser();
    const { data = {} } = useSubscription(api.auth.getCurrentUser);
    const { subscriptionItems = [] } = data;

    // Safely derive current plan (memoized)
    const currentUserPlan = useMemo(() => {
        const activeItem = subscriptionItems.find(item => item.status === 'active');
        return activeItem?.plan?.slug ?? 'apprentice_user';
    }, [subscriptionItems]);

    // Consolidated loading state
    const isLoading = convexAuthLoading || !isAuthenticated || subscriptionItems.length === 0;

    const [userId, setUserId] = useState(null);
    const storeUser = useMutation(api.user.store);

    // Create user in Convex once authenticated and plan loaded
    useEffect(() => {
        if (!isAuthenticated || isLoading) return;

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
            setUserId(null);
        };
    }, [isAuthenticated, currentUserPlan, storeUser, user?.id]);

    return {
        isLoading: isLoading || (isAuthenticated && userId === null),
        isAuthenticated: isAuthenticated && !!userId,
        userId,
        user,
        currentUserPlan,
    };
}
