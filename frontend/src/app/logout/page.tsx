'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Xóa token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    
    // Chuyển hướng đến trang đăng nhập
    router.push('/sign-in');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Đang đăng xuất...</p>
    </div>
  );
} 