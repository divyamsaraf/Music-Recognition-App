import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/python/:path*',
                destination: '/api/python/:path*',
            },
        ];
    },
};

export default nextConfig;
