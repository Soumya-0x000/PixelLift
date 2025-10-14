/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                geist: ['var(--font-geist-sans)'],
                geistmono: ['var(--font-geist-mono)'],
                inter: ['var(--font-inter)'],
                roboto: ['var(--font-roboto)'],
                poppins: ['var(--font-poppins)'],
            },
            keyframes: {
                'gradient-xy': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                orbit: {
                    '0%': {
                        transform: 'rotate(0deg) translateX(var(--radius)) rotate(0deg)',
                    },
                    '100%': {
                        transform: 'rotate(360deg) translateX(var(--radius)) rotate(-360deg)',
                    },
                },
            },
            animation: {
                'gradient-xy': 'gradient-xy 3s ease infinite',
                orbit: 'orbit var(--duration) linear infinite',
            },
        },
        screens: {
            xs: '480px',
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px',
        },
    },
    plugins: [
        function ({ addUtilities }) {
            addUtilities({
                /* Thin scrollbar style */
                '.scrollbar-thin': {
                    scrollbarWidth: 'thin', // Firefox
                    '&::-webkit-scrollbar': {
                        width: '6px',
                        height: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(100, 100, 100, 0.5)',
                        borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: 'rgba(80, 80, 80, 0.7)',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                },
                /* Dark mode variant */
                '.dark .scrollbar-thin::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(160,160,160,0.4)',
                },
            });
        },
    ],
};
