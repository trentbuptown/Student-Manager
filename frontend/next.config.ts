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
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/:path*`,
            },
            {
                source: '/logout',
                destination: '/api/logout',
            }
        ];
    },
};

export default nextConfig;
