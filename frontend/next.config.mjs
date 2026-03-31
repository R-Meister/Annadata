/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api/gamification/:path*',
                destination: 'http://localhost:8011/api/gamification/:path*',
            },
        ];
    },
};

export default nextConfig;
