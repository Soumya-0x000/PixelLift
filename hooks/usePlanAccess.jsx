import { useAuth } from '@clerk/nextjs';
import { useSubscription } from '@clerk/nextjs/experimental';

export const usePlanAccess = () => {
    const { data: subscriptionData } = useSubscription();
    const { has } = useAuth();

    const isApprenticeUser = has?.({ plan: 'apprentice_user' });
    const isMasterUser = has?.({ plan: 'master_user' }) || false;
    const isDeityUser = has?.({ plan: 'deity_user' }) || false;
    console.log(isApprenticeUser, isMasterUser, isDeityUser);
};
