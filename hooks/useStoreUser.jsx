import { useUser } from '@clerk/nextjs';
import { useConvexAuth } from 'convex/react';
import { useEffect, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useSubscription } from '@clerk/nextjs/experimental';

export default function useStoreUser() {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const { data = {} } = useSubscription(api.auth.getCurrentUser);
    const { subscriptionItems = [] } = data;
    const { plan: { slug: currentUserPlan = '' } = {} } = subscriptionItems?.[0] || {};

    const { user } = useUser();
    // When this state is set we know the server has stored the user.
    const [userId, setUserId] = useState(null);
    const storeUser = useMutation(api.user.store);
    // Call the `storeUser` mutation function to store
    // the current user in the `users` table and return the `Id` value.
    useEffect(() => {
        // If the user is not logged in don't do anything
        if (!isAuthenticated) {
            return;
        }
        // Store the user in the database.
        // Recall that `storeUser` gets the user information via the `auth`
        // object on the server. You don't need to pass anything manually here.
        async function createUser() {
            try {
                const id = await storeUser({ plan: currentUserPlan || 'apprentice_user' });
                setUserId?.(id);
            } catch (error) {
                console.error('Error storing user:', error);
            }
        }
        createUser();
        return () => setUserId(null);
        // Make sure the effect reruns if the user logs in with a different identity
    }, [isAuthenticated, storeUser, user?.sub]);

    return {
        isLoading: isLoading || (isAuthenticated && userId === null),
        isAuthenticated: isAuthenticated && userId !== null,
        userId,
        user,
    };
}
