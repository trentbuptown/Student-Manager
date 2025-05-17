'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { useApplySettings } from '@/hooks/useApplySettings';

const inter = Inter({ subsets: ["latin"] });

// Component để áp dụng settings
function ApplySettings({ children }: { children: React.ReactNode }) {
    useApplySettings();
    return <>{children}</>;
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <SettingsProvider>
                    <ApplySettings>
                        {children}
                        <Toaster position="top-right" />
                    </ApplySettings>
                </SettingsProvider>
            </body>
        </html>
    );
}
