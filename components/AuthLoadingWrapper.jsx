'use client';

import { usePathname } from 'next/navigation';
import useStoreUser from '@/hooks/useStoreUser';
import LoadingFallback from './Loader/LoadingFallback';

export default function AuthLoadingWrapper({ children }) {
    const { isLoading } = useStoreUser();
    const pathname = usePathname();

    const authPageRoutes = ['/sign-in', '/sign-up', '/sso-callback'];

    // Don't show loading on auth pages (sign-in, sign-up)
    const isAuthPage = authPageRoutes.some(route => pathname?.includes(route));

    // Show loading state while user data is being fetched (except on auth pages)
    // Treat undefined as loading to prevent flash of content
    if ((isLoading === undefined || isLoading) && !isAuthPage) {
        return <LoadingFallback />;
    }

    return <>{children}</>;
}
