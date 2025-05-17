'use client';

import { useEffect, useState } from 'react';
import { getTeacherById, updateTeacher, Teacher, TeacherUpdateParams } from '@/services/teacherService';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function EditTeacherPage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = Number(params.id);
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState<TeacherUpdateParams>({
    name: '',
    specialization: '',
    is_gvcn: false
  });

  useEffect(() => {
    const fetchTeacher = async () => {
      setFetchLoading(true);
      try {
        const data = await getTeacherById(teacherId);
        if (data) {
          setFormData({
            name: data.name,
            specialization: data.specialization,
            is_gvcn: data.is_gvcn
          });
        } else {
          toast.error('Không tìm thấy thông tin giáo viên');
          router.push('/teacher/list');
        }
      } catch (error) {
        console.error('Error fetching teacher:', error);
        toast.error('Không thể tải thông tin giáo viên');
      } finally {
        setFetchLoading(false);
      }
    };

    if (teacherId) {
      fetchTeacher();
    }
  }, [teacherId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateTeacher(teacherId, formData);
      if (result) {
        toast.success('Cập nhật giáo viên thành công');
        router.push('/teacher/list');
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      toast.error('Không thể cập nhật giáo viên');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link href="/teacher/list" className="mr-4">
          <FaArrowLeft className="text-gray-600 hover:text-gray-900" />
        </Link>
        <h1 className="text-2xl font-bold">Chỉnh sửa thông tin giáo viên</h1>
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
                  value={formData.name || ''}
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
                  value={formData.specialization || ''}
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
                  checked={formData.is_gvcn || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_gvcn" className="ml-2 block text-sm text-gray-700">
                  Là giáo viên chủ nhiệm
                </label>
              </div>
            </div>
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