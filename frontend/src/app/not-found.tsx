'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-medium mb-6">Không tìm thấy trang</h2>
      <p className="text-gray-600 mb-8">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
      <button
        onClick={() => router.push('/dashboard')}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Quay lại trang chủ
      </button>
    </div>
  );
} 