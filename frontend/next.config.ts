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
};

export default nextConfig;
