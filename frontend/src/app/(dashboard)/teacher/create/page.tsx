'use client';

import { useState } from 'react';
import { createTeacher, TeacherCreateParams } from '@/services/teacherService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function CreateTeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TeacherCreateParams>({
    name: '',
    specialization: '',
    is_gvcn: false,
    user_id: 0,
    user: {
      name: '',
      email: '',
      password: '',
    }
  });

  const [createNewUser, setCreateNewUser] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'user' && formData.user) {
        setFormData({
          ...formData,
          user: {
            ...formData.user,
            [child]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Chuẩn bị dữ liệu để gửi đi
      let dataToSubmit: TeacherCreateParams;
      
      if (createNewUser) {
        // Nếu tạo user mới, gửi thông tin user và đặt user_id = 0 (sẽ được backend xử lý)
        dataToSubmit = {
          name: formData.name.trim(),
          specialization: formData.specialization.trim(),
          is_gvcn: formData.is_gvcn === true,
          user_id: 0, // Giá trị tạm thời, sẽ được backend tạo và gán
          user: {
            name: formData.user?.name?.trim() || '',
            email: formData.user?.email?.trim() || '',
            password: formData.user?.password || '',
          }
        };
      } else {
        // Nếu sử dụng user có sẵn, chỉ gửi user_id và không gửi thông tin user
        if (!formData.user_id || formData.user_id <= 0) {
          toast.error('Vui lòng nhập ID người dùng hợp lệ');
          setLoading(false);
          return;
        }
        
        dataToSubmit = {
          name: formData.name.trim(),
          specialization: formData.specialization.trim(),
          is_gvcn: formData.is_gvcn === true,
          user_id: Number(formData.user_id)
        };
      }

      console.log('Dữ liệu gửi đi:', JSON.stringify(dataToSubmit));

      // Gọi API để tạo giáo viên
      const result = await createTeacher(dataToSubmit);
      if (result) {
        toast.success('Thêm giáo viên thành công');
        router.push('/teacher/list');
      }
    } catch (error: any) {
      console.error('Error creating teacher:', error);
      // Hiển thị thông báo lỗi chi tiết nếu có
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach((msg: any) => toast.error(msg));
      } else {
        toast.error('Không thể thêm giáo viên');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link href="/teacher/list" className="mr-4">
          <FaArrowLeft className="text-gray-600 hover:text-gray-900" />
        </Link>
        <h1 className="text-2xl font-bold">Thêm giáo viên mới</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin giáo viên</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên giáo viên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chuyên môn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_gvcn"
                  name="is_gvcn"
                  checked={formData.is_gvcn}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_gvcn" className="ml-2 block text-sm text-gray-700">
                  Là giáo viên chủ nhiệm
                </label>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="createNewUser"
                checked={createNewUser}
                onChange={(e) => setCreateNewUser(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="createNewUser" className="ml-2 block text-sm text-gray-700">
                Tạo tài khoản người dùng mới
              </label>
            </div>

            {createNewUser ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Thông tin tài khoản</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên người dùng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="user.name"
                      value={formData.user?.name || ''}
                      onChange={handleChange}
                      required={createNewUser}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="user.email"
                      value={formData.user?.email || ''}
                      onChange={handleChange}
                      required={createNewUser}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="user.password"
                      value={formData.user?.password || ''}
                      onChange={handleChange}
                      required={createNewUser}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">Liên kết với tài khoản hiện có</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID người dùng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="user_id"
                    value={formData.user_id || ''}
                    onChange={handleChange}
                    required={!createNewUser}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Link
              href="/teacher/list"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              ) : (
                <FaSave className="mr-2" />
              )}
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 