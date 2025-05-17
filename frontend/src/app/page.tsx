'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Đảm bảo mã chỉ chạy ở phía client
    if (typeof window !== 'undefined') {
      // Kiểm tra xem người dùng đã đăng nhập chưa
      const token = localStorage.getItem('token');
      
      if (token) {
        // Nếu đã đăng nhập, lấy thông tin người dùng từ localStorage
        const userString = localStorage.getItem('user');
        
        if (userString) {
          try {
            const user = JSON.parse(userString);
            
            // Chuyển hướng dựa trên vai trò của người dùng
            if (user.admin) {
              // Nếu là admin, chuyển đến trang quản lý
              router.replace('/dashboard');
            } else if (user.teacher) {
              // Nếu là giáo viên, chuyển đến trang dành cho giáo viên
              router.replace('/teacher-dashboard');
            } else if (user.student) {
              // Nếu là học sinh, chuyển đến trang dành cho học sinh
              router.replace('/student-dashboard');
            } else {
              // Nếu không xác định được vai trò, chuyển đến trang mặc định
              router.replace('/dashboard');
            }
          } catch (error) {
            // Nếu có lỗi khi phân tích dữ liệu người dùng, chuyển đến trang đăng nhập
            console.error('Lỗi khi phân tích dữ liệu người dùng:', error);
            router.replace('/sign-in');
          }
        } else {
          // Nếu có token nhưng không có thông tin người dùng, chuyển đến trang đăng nhập
          router.replace('/sign-in');
        }
      } else {
        // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
        router.replace('/sign-in');
      }
    }
  }, [router]);

  // Trang tạm thời hiển thị trong quá trình chuyển hướng
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">SGU SMS</h1>
        <p className="text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
} 