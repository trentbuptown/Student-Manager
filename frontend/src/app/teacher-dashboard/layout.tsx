'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    FaHome, 
    FaUserGraduate, 
    FaBook, 
    FaCalendarAlt,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaChartBar,
    FaClipboardList,
    FaUserCircle
} from 'react-icons/fa';

interface MenuItem {
    name: string;
    path: string;
    icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
    {
        name: 'Trang chủ',
        path: '/teacher-dashboard',
        icon: <FaHome className="w-5 h-5" />
    },
    {
        name: 'Hồ sơ giáo viên',
        path: '/teacher-dashboard/profile',
        icon: <FaUserCircle className="w-5 h-5" />
    },
    {
        name: 'Lớp học',
        path: '/teacher-dashboard/classes',
        icon: <FaUserGraduate className="w-5 h-5" />
    },
    {
        name: 'Học sinh',
        path: '/teacher-dashboard/students',
        icon: <FaUserGraduate className="w-5 h-5" />
    },
    {
        name: 'Điểm số',
        path: '/teacher-dashboard/grades',
        icon: <FaChartBar className="w-5 h-5" />
    },
    {
        name: 'Lịch dạy',
        path: '/teacher-dashboard/schedule',
        icon: <FaCalendarAlt className="w-5 h-5" />
    },
    {
        name: 'Điểm danh',
        path: '/teacher-dashboard/attendance',
        icon: <FaClipboardList className="w-5 h-5" />
    }
];

const TeacherSidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const pathname = usePathname();

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
                className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0 md:w-64 md:static`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-5 border-b border-gray-200 bg-blue-50">
                        <h1 className="text-2xl font-bold text-blue-600">S<span className="text-blue-500">G</span>U SMS</h1>
                        <p className="text-sm text-gray-500">Cổng thông tin giáo viên</p>
                    </div>

                    {/* Menu items */}
                    <nav className="flex-1 py-5 px-3">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                                    pathname === item.path
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <div className={`${pathname === item.path ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {item.icon}
                                </div>
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Logout link */}
                    <div className="p-4 border-t border-gray-200">
                        <Link
                            href="/logout"
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <FaSignOutAlt className="w-5 h-5" />
                            <span className="font-medium">Đăng xuất</span>
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <TeacherSidebar />
      <div className="flex-1">
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
} 