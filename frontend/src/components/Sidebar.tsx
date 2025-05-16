import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
    FaHome, 
    FaUserGraduate, 
    FaChalkboardTeacher, 
    FaBook, 
    FaCalendarAlt,
    FaSignOutAlt,
    FaBars,
    FaTimes
} from 'react-icons/fa';
import { logout } from '@/services/auth.service';

interface MenuItem {
    name: string;
    path: string;
    icon: JSX.Element;
}

const menuItems: MenuItem[] = [
    {
        name: 'Trang chủ',
        path: '/dashboard',
        icon: <FaHome className="w-5 h-5" />
    },
    {
        name: 'Học sinh',
        path: '/dashboard/students',
        icon: <FaUserGraduate className="w-5 h-5" />
    },
    {
        name: 'Giáo viên',
        path: '/dashboard/teachers',
        icon: <FaChalkboardTeacher className="w-5 h-5" />
    },
    {
        name: 'Môn học',
        path: '/dashboard/subjects',
        icon: <FaBook className="w-5 h-5" />
    },
    {
        name: 'Lịch',
        path: '/dashboard/schedule',
        icon: <FaCalendarAlt className="w-5 h-5" />
    }
];

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem('token');
            router.push('/sign-in');
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
        }
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                className="fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-500 text-white md:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-white shadow-lg z-40 transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0 md:w-64 md:static`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b">
                        <h1 className="text-2xl font-bold text-blue-600">SGU SMS</h1>
                        <p className="text-sm text-gray-500">Hệ thống quản lý trường học</p>
                    </div>

                    {/* Menu items */}
                    <nav className="flex-1 p-4 space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                    pathname === item.path
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Logout button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 m-4 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <FaSignOutAlt className="w-5 h-5" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar; 