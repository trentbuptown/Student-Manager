'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const router = useRouter();

    useEffect(() => {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/sign-in');
        }
    }, [router]);

    return (
        <div className="h-screen flex">
            {/* Sidebar */}
            <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4 bg-white">
                <Link
                    href="/"
                    className="flex items-center justify-center lg:justify-start gap-2"
                >
                    <Image src="/logo.png" alt="logo" width={32} height={32} />
                    <span className="hidden lg:block text-2xl font-bold text-[#1a42bf] pt-2">
                        SMSGU
                    </span>
                </Link>
                <Menu />
            </div>
            <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#f7f8fa] overflow-scroll flex flex-col">
                <Navbar />
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout; 