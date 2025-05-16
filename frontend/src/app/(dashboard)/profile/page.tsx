'use client';

import { useState } from 'react';

// Dữ liệu mẫu cho profile
const initialProfile = {
    name: 'Huyen Le',
    role: 'Admin',
    email: 'huyen.le@example.com',
    phone: '0123456789',
    avatar: '/avatar.jpg',
    address: '123 Đường ABC, Quận XYZ, TP.HCM',
    dateOfBirth: '1990-01-01',
    gender: 'female',
    joinDate: '2023-01-01',
};

export default function Profile() {
    const [profile, setProfile] = useState(initialProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(initialProfile);

    const handleEdit = () => {
        setIsEditing(true);
        setEditedProfile(profile);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedProfile(profile);
    };

    const handleSave = () => {
        setProfile(editedProfile);
        setIsEditing(false);
        // Thông báo thành công
        alert('Đã cập nhật thông tin thành công!');
    };

    const handleChange = (field: string, value: string) => {
        setEditedProfile({ ...editedProfile, [field]: value });
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
                <p className="mt-1 text-gray-500">Xem và cập nhật thông tin cá nhân của bạn</p>
            </div>

            <div className="bg-white rounded-xl shadow">
                {/* Profile Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-[#e5eaff] flex items-center justify-center text-2xl font-bold text-[#1a42bf]">
                                {profile.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
                                <p className="text-sm text-gray-500">{profile.role}</p>
                            </div>
                        </div>
                        {!isEditing ? (
                            <button
                                onClick={handleEdit}
                                className="px-4 py-2 text-[#1a42bf] border border-[#1a42bf] rounded-lg hover:bg-[#1a42bf] hover:text-white transition-colors"
                            >
                                Chỉnh sửa
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-[#1a42bf] text-white rounded-lg hover:bg-[#153288]"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Họ và tên
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                    value={editedProfile.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                />
                            ) : (
                                <p className="text-gray-900">{profile.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                    value={editedProfile.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                />
                            ) : (
                                <p className="text-gray-900">{profile.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số điện thoại
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                    value={editedProfile.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                />
                            ) : (
                                <p className="text-gray-900">{profile.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày sinh
                            </label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                    value={editedProfile.dateOfBirth}
                                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                />
                            ) : (
                                <p className="text-gray-900">{new Date(profile.dateOfBirth).toLocaleDateString('vi-VN')}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giới tính
                            </label>
                            {isEditing ? (
                                <select
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                    value={editedProfile.gender}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                >
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            ) : (
                                <p className="text-gray-900">
                                    {profile.gender === 'male' ? 'Nam' : profile.gender === 'female' ? 'Nữ' : 'Khác'}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Địa chỉ
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                    value={editedProfile.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                />
                            ) : (
                                <p className="text-gray-900">{profile.address}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày tham gia
                            </label>
                            <p className="text-gray-900">{new Date(profile.joinDate).toLocaleDateString('vi-VN')}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vai trò
                            </label>
                            <p className="text-gray-900">{profile.role}</p>
                        </div>
                    </div>
                </div>

                {/* Change Password Section */}
                <div className="p-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Đổi mật khẩu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu hiện tại
                            </label>
                            <input
                                type="password"
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                placeholder="Nhập mật khẩu hiện tại"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu mới
                            </label>
                            <input
                                type="password"
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                placeholder="Nhập mật khẩu mới"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <button className="px-4 py-2 bg-[#1a42bf] text-white rounded-lg hover:bg-[#153288]">
                            Đổi mật khẩu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 