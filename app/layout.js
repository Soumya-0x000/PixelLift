import { Geist, Geist_Mono, Inter, Poppins, Roboto } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import FloatingShapes from '@/components/FloatingShapes';
import Header from '@/components/Header';
import { ConvexClientProvider } from './ConvexClientProvider';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata = {
    title: 'PixelLift',
    description: 'Created for doing AI stuffs on an image',
};

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

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${roboto.variable} ${poppins.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                    storageKey="theme"
                    className={`${inter.variable} ${roboto.variable} ${poppins.variable}`}
                >
                    <ConvexClientProvider>
                        <Header />
                        <main className=" bg-slate-900 min-h-[100rem] text-slate-50 overflow-x-hidden">
                            <FloatingShapes />
                            <Toaster richColors />
                            {children}
                        </main>
                    </ConvexClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
