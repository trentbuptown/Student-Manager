'use client';

import { useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export function useApplySettings() {
    const { settings } = useSettings();

    useEffect(() => {
        // Áp dụng theme
        const root = document.documentElement;
        if (settings.appearance.theme === 'dark') {
            root.classList.add('dark');
        } else if (settings.appearance.theme === 'light') {
            root.classList.remove('dark');
        } else if (settings.appearance.theme === 'system') {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }

        // Áp dụng font size
        const fontSize = {
            small: '14px',
            medium: '16px',
            large: '18px'
        }[settings.appearance.fontSize] || '16px';
        root.style.setProperty('--font-size-base', fontSize);

        // Áp dụng ngôn ngữ
        document.documentElement.lang = settings.appearance.language;

        // Theo dõi system theme nếu được chọn
        if (settings.appearance.theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e: MediaQueryListEvent) => {
                if (e.matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            };
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [settings.appearance]);

    // Áp dụng các settings khác khi cần
    useEffect(() => {
        // Notifications
        if (settings.notifications.browser) {
            // Yêu cầu quyền thông báo nếu chưa có
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }, [settings.notifications]);
} 