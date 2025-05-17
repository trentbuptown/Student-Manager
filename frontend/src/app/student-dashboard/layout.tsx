'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaBook, FaCalendarAlt, FaLock, FaGraduationCap, FaChartLine } from 'react-icons/fa';
import { getUser, isStudent } from '@/utils/auth';
import { logout } from '@/services/auth.service';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa và có phải là học sinh không
    const checkAuth = async () => {
      if (typeof window !== 'undefined') {
        const userData = getUser();
        
        if (!userData) {
          router.replace('/sign-in');
          return;
        }
        
        if (!isStudent()) {
          // Nếu không phải học sinh, chuyển hướng về trang chính
          router.replace('/');
          return;
        }
        
        setUser(userData);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/sign-in');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  const menuItems = [
    {
      name: 'Thông tin cá nhân',
      path: '/student-dashboard',
      icon: <FaUser className="w-5 h-5" />
    },
    {
      name: 'Thời khóa biểu',
      path: '/student-dashboard/schedule',
      icon: <FaCalendarAlt className="w-5 h-5" />
    },
    {
      name: 'Xem điểm',
      path: '/student-dashboard/grades',
      icon: <FaChartLine className="w-5 h-5" />
    },
    {
      name: 'Danh sách môn học',
      path: '/student-dashboard/subjects',
      icon: <FaBook className="w-5 h-5" />
    },
    {
      name: 'Thông tin lớp',
      path: '/student-dashboard/class-info',
      icon: <FaGraduationCap className="w-5 h-5" />
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">SGU SMS</h1>
          <p className="text-sm text-gray-500">Cổng thông tin học sinh</p>
        </div>
        
        <div className="p-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="font-medium text-blue-700">{user?.name}</p>
            <p className="text-sm text-gray-600">Học sinh</p>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
          
          <div className="mt-8 pt-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <FaLock className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
} 