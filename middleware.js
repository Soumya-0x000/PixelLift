import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoutes = createRouteMatcher(['/dashboard(.*)', '/editor(.*)']);
const isAuthRoutes = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/sso-callback(.*)']);
const isPublicRoutes = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/sso-callback(.*)', '/']);

export default clerkMiddleware(
    async (auth, req) => {
        const { userId } = await auth();

        // Allow public routes without authentication
        if (isPublicRoutes(req)) {
            // Redirect authenticated users away from auth pages to dashboard
            if (userId && isAuthRoutes(req)) {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
            return NextResponse.next();
        }

        // Protect other routes - redirect to sign-in if not authenticated
        if (!userId && isProtectedRoutes(req)) {
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }

        return NextResponse.next();
    },
    {
        publicRoutes: ['/sign-in(.*)', '/sign-up(.*)', '/sso-callback(.*)', '/'],
    }
);

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
