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
        },
    },
    plugins: [],
};
