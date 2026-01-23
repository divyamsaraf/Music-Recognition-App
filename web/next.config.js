/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return process.env.NODE_ENV === 'development' ? [
            {
                source: '/api/:path*',
                destination: 'http://127.0.0.1:5328/api/:path*',
            },
        ] : []
    },
    output: 'standalone',
};

module.exports = nextConfig;
