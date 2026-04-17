/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'i.scdn.co', pathname: '/**' },
            { protocol: 'https', hostname: 'img.youtube.com', pathname: '/**' },
            { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/**' },
            { protocol: 'https', hostname: 'api.deezer.com', pathname: '/**' },
            { protocol: 'https', hostname: 'cdn-images.dzcdn.net', pathname: '/**' },
            { protocol: 'https', hostname: 'is1-ssl.mzstatic.com', pathname: '/**' },
            { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/**' },
        ],
    },
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
