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
        console.error('Lỗi không xử lý được khi đăng xuất:', error);
      } finally {
        // Luôn chuyển hướng về trang đăng nhập, ngay cả khi có lỗi
        console.log('Chuyển hướng đến trang đăng nhập');
        router.push('/sign-in');
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