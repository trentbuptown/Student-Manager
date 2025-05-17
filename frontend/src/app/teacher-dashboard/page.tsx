'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaBook, FaCalendarAlt, FaLock, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa và có phải là giáo viên không
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userString = localStorage.getItem('user');
      
      if (!token || !userString) {
        router.replace('/sign-in');
        return;
      }
      
      try {
        const userData = JSON.parse(userString);
        if (!userData.teacher) {
          // Nếu không phải giáo viên, chuyển hướng về trang chính
          router.replace('/');
          return;
        }
        
        setUser(userData);
      } catch (error) {
        console.error('Lỗi khi phân tích dữ liệu người dùng:', error);
        router.replace('/sign-in');
      }
    }
  }, [router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  const menuItems = [
    {
      name: 'Thông tin cá nhân',
      path: '/teacher-dashboard/profile',
      icon: <FaUser className="w-5 h-5" />
    },
    {
      name: 'Lớp dạy',
      path: '/teacher-dashboard/classes',
      icon: <FaChalkboardTeacher className="w-5 h-5" />
    },
    {
      name: 'Quản lý điểm',
      path: '/teacher-dashboard/grades',
      icon: <FaBook className="w-5 h-5" />
    },
    {
      name: 'Thời khóa biểu',
      path: '/teacher-dashboard/schedule',
      icon: <FaCalendarAlt className="w-5 h-5" />
    },
    {
      name: 'Danh sách học sinh',
      path: '/teacher-dashboard/students',
      icon: <FaUserGraduate className="w-5 h-5" />
    },
    {
      name: 'Đổi mật khẩu',
      path: '/teacher-dashboard/change-password',
      icon: <FaLock className="w-5 h-5" />
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">SGU SMS</h1>
          <p className="text-sm text-gray-500">Cổng thông tin giáo viên</p>
        </div>
        
        <div className="p-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="font-medium text-blue-700">{user.name}</p>
            <p className="text-sm text-gray-600">Giáo viên</p>
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
            <Link
              href="/sign-in"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
              }}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <FaLock className="w-5 h-5" />
              <span>Đăng xuất</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Xin chào, {user.name}!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Thông báo mới</h2>
            <p className="text-gray-600">Bạn không có thông báo mới.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Lịch dạy hôm nay</h2>
            <p className="text-gray-600">Không có lịch dạy hôm nay.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Lớp chủ nhiệm</h2>
            <p className="text-gray-600">
              {user.teacher?.is_gvcn ? 'Lớp 10A1' : 'Bạn không phải là giáo viên chủ nhiệm.'}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Môn giảng dạy</h2>
            <p className="text-gray-600">{user.teacher?.specialization || 'Chưa cập nhật'}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 