/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['github.com', 'avatars.githubusercontent.com', 'img.clerk.com', 'ik.imagekit.io'],
    },
    reactStrictMode: false,
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'require-corp',
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
