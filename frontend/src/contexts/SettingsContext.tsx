'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
    settings: typeof initialSettings;
    updateSettings: (category: string, setting: string, value: any) => void;
    saveSettings: () => Promise<void>;
}

const initialSettings = {
    notifications: {
        email: true,
        browser: true,
        mobile: false,
    },
    privacy: {
        showProfile: 'everyone',
        showEmail: 'schoolOnly',
        showPhone: 'none',
    },
    appearance: {
        theme: 'light',
        fontSize: 'medium',
        language: 'vi',
    },
    system: {
        autoSave: true,
        sessionTimeout: '30',
        pageSize: '10',
    }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState(() => {
        // Khôi phục settings từ localStorage khi khởi động
        if (typeof window !== 'undefined') {
            const savedSettings = localStorage.getItem('userSettings');
            return savedSettings ? JSON.parse(savedSettings) : initialSettings;
        }
        return initialSettings;
    });

    useEffect(() => {
        // Lưu settings vào localStorage mỗi khi có thay đổi
        localStorage.setItem('userSettings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (category: string, setting: string, value: any) => {
        setSettings((prev: typeof initialSettings) => ({
            ...prev,
            [category]: {
                ...prev[category as keyof typeof prev],
                [setting]: value
            }
        }));
    };

    const saveSettings = async () => {
        try {
            // TODO: Gọi API để lưu settings vào database
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                throw new Error('Failed to save settings');
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, saveSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
} 