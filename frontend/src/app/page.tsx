'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isTeacher, isStudent, isAdmin } from '@/services/auth.service';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập và vai trò
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        setLoading(true);
        
        if (isAuthenticated()) {
          console.log('User is authenticated');
          
          if (isTeacher()) {
            setUserRole('teacher');
            console.log('User role: teacher, redirecting to teacher dashboard');
            router.push('/teacher-dashboard');
          } else if (isStudent()) {
            setUserRole('student');
            console.log('User role: student, redirecting to student dashboard');
            router.push('/student-dashboard');
          } else if (isAdmin()) {
            setUserRole('admin');
            console.log('User role: admin, redirecting to admin dashboard');
            router.push('/dashboard');
          } else {
            setUserRole('unknown');
            console.log('User role: unknown');
          }
        } else {
          setUserRole(null);
          console.log('User is not authenticated, redirecting to sign-in');
          router.push('/sign-in');
        }
        
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">SGU SMS</h1>
          <p className="text-xl mb-8">Đang tải...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">SGU SMS</h1>
        <p className="text-xl mb-8">Hệ thống quản lý trường học</p>
        
        {userRole ? (
          <div className="space-y-6">
            <p className="text-gray-600">
              Vai trò của bạn: <span className="font-semibold">{userRole === 'teacher' ? 'Giáo viên' : userRole === 'student' ? 'Học sinh' : userRole === 'admin' ? 'Quản trị viên' : 'Không xác định'}</span>
            </p>
            
            <div className="space-y-3">
              <p className="text-gray-600">Chuyển hướng thủ công:</p>
              
              {userRole === 'teacher' && (
                <Link href="/teacher-dashboard" className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                  Đi đến trang Giáo viên
                </Link>
              )}
              
              {userRole === 'student' && (
                <Link href="/student-dashboard" className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                  Đi đến trang Học sinh
                </Link>
              )}
              
              {userRole === 'admin' && (
                <Link href="/dashboard" className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                  Đi đến trang Quản trị
                </Link>
              )}
              
              <Link href="/sign-in" className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors mt-2">
                Đăng nhập lại
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">Vui lòng đăng nhập để tiếp tục</p>
            <Link href="/sign-in" className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
              Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 