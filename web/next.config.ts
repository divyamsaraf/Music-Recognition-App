import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/recognize_py',
                destination: '/api/recognize_py',
            },
        ];
    },
};

export default nextConfig;
