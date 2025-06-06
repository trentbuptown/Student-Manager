import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SGU SMS",
    description: "Hệ thống quản lý sinh viên trường Đại học Sài Gòn",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
                <ToastContainer position="bottom-right" theme="dark" />
            </body>
        </html>
    );
}
