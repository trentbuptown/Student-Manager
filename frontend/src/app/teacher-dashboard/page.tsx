'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaBook, FaCalendarAlt, FaLock, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { getUser, isTeacher } from '@/utils/auth';
import { getTeacherById, getTeacherClasses, getTeacherSchedule } from '@/services/teacherService';

interface ScheduleItem {
  id: number;
  day_of_week: string;
  period: number;
  subject: string;
  class_name: string;
}

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa và có phải là giáo viên không
    const checkAuth = async () => {
      if (typeof window !== 'undefined') {
        const userData = getUser();
        
        if (!userData) {
          router.replace('/sign-in');
          return;
        }
        
        if (!isTeacher()) {
          // Nếu không phải giáo viên, chuyển hướng về trang chính
          router.replace('/');
          return;
        }
        
        setUser(userData);
        
        try {
          // Lấy thông tin chi tiết giáo viên
          if (userData.teacher && userData.teacher.id) {
            const teacherDetails = await getTeacherById(userData.teacher.id);
            if (teacherDetails) {
              setTeacherData(teacherDetails);
            }
            
            // Lấy danh sách lớp học của giáo viên
            const teacherClasses = await getTeacherClasses(userData.teacher.id);
            if (teacherClasses) {
              setClasses(teacherClasses);
            }
            
            // Lấy thời khóa biểu của giáo viên
            const teacherSchedule = await getTeacherSchedule(userData.teacher.id);
            if (teacherSchedule) {
              setSchedule(teacherSchedule);
            }
          }
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu giáo viên:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkAuth();
  }, [router]);

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

  // Lấy thời khóa biểu cho ngày hôm nay
  const today = new Date();
  const daysOfWeek = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const todayName = daysOfWeek[today.getDay()];
  const todaySchedule = schedule.filter(item => item.day_of_week === todayName);

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
              href="/logout"
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
            {todaySchedule.length > 0 ? (
              <ul className="space-y-2">
                {todaySchedule.map((item, index) => (
                  <li key={index} className="p-2 border-b">
                    <span className="font-medium">Tiết {item.period}:</span> {item.subject} - Lớp {item.class_name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">Không có lịch dạy hôm nay.</p>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Lớp chủ nhiệm</h2>
            <p className="text-gray-600">
              {user.teacher?.is_gvcn ? 
                (classes.find(c => c.is_homeroom)?.name || 'Đang cập nhật') : 
                'Bạn không phải là giáo viên chủ nhiệm.'}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Môn giảng dạy</h2>
            <p className="text-gray-600">{user.teacher?.specialization || 'Chưa cập nhật'}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm col-span-2">
            <h2 className="text-lg font-medium mb-4">Lớp dạy</h2>
            {classes.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {classes.map((classItem, index) => (
                  <div key={index} className="p-3 border rounded-md">
                    <p className="font-medium">{classItem.name}</p>
                    <p className="text-sm text-gray-500">{classItem.subject || 'Chưa có môn học'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Chưa có lớp dạy.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 