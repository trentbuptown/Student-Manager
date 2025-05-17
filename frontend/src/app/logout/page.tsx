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
        // Gọi API logout - hàm này đã được cập nhật để xử lý lỗi
        await logout();
        console.log('Đã gọi hàm logout thành công');
      } catch (error) {
        console.error('Lỗi khi đăng xuất:', error);
      } finally {
        // Luôn chuyển hướng về trang đăng nhập, ngay cả khi có lỗi
        console.log('Chuyển hướng đến trang đăng nhập');
        // Thêm timeout ngắn để đảm bảo localStorage đã được xóa
        setTimeout(() => {
          router.push('/sign-in');
        }, 100);
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