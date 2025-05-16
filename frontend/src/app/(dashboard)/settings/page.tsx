'use client';

import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'react-hot-toast';

// Dữ liệu mẫu cho settings
const initialSettings = {
    notifications: {
        email: true,
        browser: true,
        mobile: false,
    },
    privacy: {
        showProfile: 'everyone', // everyone, schoolOnly, none
        showEmail: 'schoolOnly',
        showPhone: 'none',
    },
    appearance: {
        theme: 'light', // light, dark, system
        fontSize: 'medium', // small, medium, large
        language: 'vi', // vi, en
    },
    system: {
        autoSave: true,
        sessionTimeout: '30', // minutes
        pageSize: '10', // items per page
    }
};

export default function Settings() {
    const { settings, updateSettings, saveSettings } = useSettings();
    const [isSaving, setIsSaving] = useState(false);

    const handleSettingChange = (category: string, setting: string, value: any) => {
        updateSettings(category, setting, value);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveSettings();
            toast.success('Đã lưu cài đặt thành công!');
        } catch (error) {
            toast.error('Không thể lưu cài đặt. Vui lòng thử lại!');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
                <p className="mt-1 text-gray-500">Tùy chỉnh cài đặt theo nhu cầu của bạn</p>
            </div>

            <div className="bg-white rounded-xl shadow">
                {/* Notifications Settings */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Thông báo</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Thông báo qua email</h3>
                                <p className="text-sm text-gray-500">Nhận thông báo qua địa chỉ email của bạn</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.notifications.email}
                                    onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e5eaff] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a42bf]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Thông báo trên trình duyệt</h3>
                                <p className="text-sm text-gray-500">Hiển thị thông báo trên trình duyệt</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.notifications.browser}
                                    onChange={(e) => handleSettingChange('notifications', 'browser', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e5eaff] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a42bf]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Thông báo trên điện thoại</h3>
                                <p className="text-sm text-gray-500">Nhận thông báo qua ứng dụng di động</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.notifications.mobile}
                                    onChange={(e) => handleSettingChange('notifications', 'mobile', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e5eaff] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a42bf]"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Privacy Settings */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Quyền riêng tư</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Hiển thị hồ sơ với
                            </label>
                            <select
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                value={settings.privacy.showProfile}
                                onChange={(e) => handleSettingChange('privacy', 'showProfile', e.target.value)}
                            >
                                <option value="everyone">Tất cả mọi người</option>
                                <option value="schoolOnly">Chỉ thành viên trường</option>
                                <option value="none">Không ai</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Hiển thị email với
                            </label>
                            <select
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                value={settings.privacy.showEmail}
                                onChange={(e) => handleSettingChange('privacy', 'showEmail', e.target.value)}
                            >
                                <option value="everyone">Tất cả mọi người</option>
                                <option value="schoolOnly">Chỉ thành viên trường</option>
                                <option value="none">Không ai</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Hiển thị số điện thoại với
                            </label>
                            <select
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                value={settings.privacy.showPhone}
                                onChange={(e) => handleSettingChange('privacy', 'showPhone', e.target.value)}
                            >
                                <option value="everyone">Tất cả mọi người</option>
                                <option value="schoolOnly">Chỉ thành viên trường</option>
                                <option value="none">Không ai</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Appearance Settings */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Giao diện</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Giao diện
                            </label>
                            <select
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                value={settings.appearance.theme}
                                onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                            >
                                <option value="light">Sáng</option>
                                <option value="dark">Tối</option>
                                <option value="system">Theo hệ thống</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Cỡ chữ
                            </label>
                            <select
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                value={settings.appearance.fontSize}
                                onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                            >
                                <option value="small">Nhỏ</option>
                                <option value="medium">Vừa</option>
                                <option value="large">Lớn</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Ngôn ngữ
                            </label>
                            <select
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                value={settings.appearance.language}
                                onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                            >
                                <option value="vi">Tiếng Việt</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* System Settings */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Hệ thống</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Tự động lưu</h3>
                                <p className="text-sm text-gray-500">Tự động lưu các thay đổi</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.system.autoSave}
                                    onChange={(e) => handleSettingChange('system', 'autoSave', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e5eaff] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a42bf]"></div>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Thời gian chờ phiên làm việc (phút)
                            </label>
                            <select
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                value={settings.system.sessionTimeout}
                                onChange={(e) => handleSettingChange('system', 'sessionTimeout', e.target.value)}
                            >
                                <option value="15">15 phút</option>
                                <option value="30">30 phút</option>
                                <option value="60">60 phút</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Số mục hiển thị mỗi trang
                            </label>
                            <select
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                value={settings.system.pageSize}
                                onChange={(e) => handleSettingChange('system', 'pageSize', e.target.value)}
                            >
                                <option value="10">10 mục</option>
                                <option value="20">20 mục</option>
                                <option value="50">50 mục</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-[#1a42bf] text-white rounded-lg hover:bg-[#153288] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
                    </button>
                </div>
            </div>
        </div>
    );
} 