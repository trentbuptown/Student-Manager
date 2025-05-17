'use client';

import { useEffect, useState } from 'react';
import { getTeacherById, Teacher } from '@/services/teacherService';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function TeacherDetailPage() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const params = useParams();
  const router = useRouter();
  const teacherId = Number(params.id);

  useEffect(() => {
    const fetchTeacher = async () => {
      setLoading(true);
      try {
        const data = await getTeacherById(teacherId);
        if (data) {
          setTeacher(data);
        } else {
          toast.error('Không tìm thấy thông tin giáo viên');
          router.push('/teacher/list');
        }
      } catch (error) {
        console.error('Error fetching teacher:', error);
        toast.error('Không thể tải thông tin giáo viên');
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchTeacher();
    }
  }, [teacherId, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-600">Không tìm thấy thông tin giáo viên</p>
        <Link href="/teacher/list" className="text-blue-500 hover:underline mt-4 inline-block">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/teacher/list" className="mr-4">
            <FaArrowLeft className="text-gray-600 hover:text-gray-900" />
          </Link>
          <h1 className="text-2xl font-bold">Thông tin giáo viên</h1>
        </div>
        <Link
          href={`/teacher/edit/${teacher.id}`}
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <FaEdit className="mr-2" /> Chỉnh sửa
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-600">ID:</span> {teacher.id}
              </div>
              <div>
                <span className="font-medium text-gray-600">Tên:</span> {teacher.name}
              </div>
              <div>
                <span className="font-medium text-gray-600">Chuyên môn:</span> {teacher.specialization}
              </div>
              <div>
                <span className="font-medium text-gray-600">GVCN:</span> {teacher.is_gvcn ? 'Có' : 'Không'}
              </div>
              {teacher.phone && (
                <div>
                  <span className="font-medium text-gray-600">Số điện thoại:</span> {teacher.phone}
                </div>
              )}
              {teacher.address && (
                <div>
                  <span className="font-medium text-gray-600">Địa chỉ:</span> {teacher.address}
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Thông tin người dùng</h2>
            {teacher.user ? (
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-600">Email:</span> {teacher.user.email}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Tên người dùng:</span> {teacher.user.name}
                </div>
                {teacher.user.birthday && (
                  <div>
                    <span className="font-medium text-gray-600">Ngày sinh:</span> {teacher.user.birthday}
                  </div>
                )}
                {teacher.user.sex && (
                  <div>
                    <span className="font-medium text-gray-600">Giới tính:</span> {teacher.user.sex === 'MALE' ? 'Nam' : 'Nữ'}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Không có thông tin người dùng</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 