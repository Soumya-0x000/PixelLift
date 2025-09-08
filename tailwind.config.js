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
    },
    plugins: [],
};
