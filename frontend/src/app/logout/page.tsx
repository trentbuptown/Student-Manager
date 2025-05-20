'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/services/auth.service';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      console.log('Bắt đầu quá trình đăng xuất');
      try {
        // Gọi API logout - hàm này đã được cập nhật để xử lý lỗi 401
        await logout();
        console.log('Đã gọi hàm logout thành công');
      } catch (error) {
        // Ghi log lỗi nhưng không ngăn chặn chuyển hướng
        console.error('Lỗi khi đăng xuất:', error);
      } finally {
        // Đợi một chút trước khi chuyển hướng
        setTimeout(() => {
          console.log('Chuyển hướng đến trang đăng nhập');
          router.push('/sign-in');
          // Thêm reload trang để đảm bảo tất cả state được xóa
          window.location.href = '/sign-in';
        }, 500);
      }
    };
    
    handleLogout();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Đang đăng xuất...</p>
    </div>
  );
} 