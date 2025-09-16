import { Geist, Geist_Mono, Inter, Poppins, Roboto } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ConvexClientProvider } from './ConvexClientProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/themes';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
});

const roboto = Roboto({
    variable: '--font-roboto',
    subsets: ['latin'],
    weight: ['300', '400', '500', '700'],
});

const poppins = Poppins({
    variable: '--font-poppins',
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
});

export const metadata = {
    title: 'PixelLift',
    description: 'Created for doing AI stuffs on an image',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/app/favicon.ico" />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${roboto.variable} ${poppins.variable} antialiased h-screen`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                    storageKey="theme"
                    className={`${inter.variable} ${roboto.variable} ${poppins.variable}`}
                >  
                    <ClerkProvider
                        appearance={{
                            cssLayerName: 'clerk',
                            layout: {
                                socialButtonsPlacement: 'bottom',
                                socialButtonsVariant: 'iconButton',
                                termsPageUrl: 'https://clerk.com/terms',
                            },
                            baseTheme: shadcn,
                        }}
                    >
                        <ConvexClientProvider>
                            <main className=" h-full text-slate-50 overflow-x-hidden">
                                <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] bg-neutral-950"></div>
                                <Toaster richColors />
                                {children}
                            </main>
                        </ConvexClientProvider>
                    </ClerkProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
