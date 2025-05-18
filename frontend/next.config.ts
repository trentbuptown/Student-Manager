import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.pexels.com",
            },
            {
                protocol: "https",
                hostname: "static.vecteezy.com",
            },
            {
                protocol: "https",
                hostname: "media.istockphoto.com",
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://127.0.0.1:8000/api/:path*',
            },
        ];
    },
    experimental: {
        // ...
    },
};

export default nextConfig;
