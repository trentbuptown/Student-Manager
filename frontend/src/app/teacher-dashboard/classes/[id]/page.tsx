'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaUserGraduate, FaBook, FaCalendarAlt, FaChartBar, FaFileAlt, FaUserCheck } from 'react-icons/fa';
import { getUser, isTeacher } from '@/utils/auth';
import axiosClient from '@/services/axiosClient';
import toast from 'react-hot-toast';

interface ClassDetail {
  id: number;
  name: string;
  grade: string;
  is_homeroom: boolean;
  subject?: string;
  year: string;
  homeroom_teacher?: {
    id: number;
    name: string;
  };
}

interface Student {
  id: number;
  name: string;
  student_id: string;
  birthday?: string;
  sex?: 'MALE' | 'FEMALE';
  phone?: string;
  address?: string;
  parent_name?: string;
  parent_phone?: string;
}

export default function ClassDetailPage() {
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const params = useParams();
  const classId = params.id;

  useEffect(() => {
    const checkAuth = async () => {
      const userData = getUser();
      
      if (!userData) {
        router.replace('/sign-in');
        return;
      }
      
      if (!isTeacher()) {
        router.replace('/');
        return;
      }

      try {
        // Lấy thông tin chi tiết lớp học
        const classResponse = await axiosClient.get(`/classes/${classId}`);
        if (classResponse.data) {
          setClassDetail(classResponse.data);
        }
        
        // Lấy danh sách học sinh trong lớp
        const studentsResponse = await axiosClient.get(`/classes/${classId}/students`);
        if (studentsResponse.data) {
          setStudents(studentsResponse.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu lớp học:', error);
        toast.error('Không thể tải thông tin lớp học');
      } finally {
        setLoading(false);
      }
    };
    
    if (classId) {
      checkAuth();
    }
  }, [router, classId]);

  const formatSex = (sex?: string) => {
    if (sex === 'MALE') return 'Nam';
    if (sex === 'FEMALE') return 'Nữ';
    return 'Không xác định';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Không tìm thấy thông tin lớp học</p>
          <Link href="/teacher-dashboard/classes" className="text-blue-600 mt-4 inline-block">
            Quay lại danh sách lớp học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link href="/teacher-dashboard/classes" className="mr-4 text-blue-600">
          <FaArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">Lớp {classDetail.name}</h1>
        {classDetail.is_homeroom && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-4">
            Chủ nhiệm
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
          <h2 className="text-lg font-medium mb-4">Thông tin lớp học</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <FaBook className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Môn học</p>
                <p className="font-medium">{classDetail.subject || 'Chưa có môn học'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FaCalendarAlt className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Năm học</p>
                <p className="font-medium">{classDetail.year || '2023-2024'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FaUserGraduate className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Số học sinh</p>
                <p className="font-medium">{students.length}</p>
              </div>
            </div>
            
            {classDetail.homeroom_teacher && (
              <div className="flex items-center">
                <FaUserCheck className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Giáo viên chủ nhiệm</p>
                  <p className="font-medium">{classDetail.homeroom_teacher.name}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-md font-medium mb-3">Công cụ</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/teacher-dashboard/grades?class=${classDetail.id}`}
                className="flex flex-col items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FaChartBar className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm text-center">Quản lý điểm</span>
              </Link>
              
              <Link
                href={`/teacher-dashboard/attendance?class=${classDetail.id}`}
                className="flex flex-col items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FaUserCheck className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm text-center">Điểm danh</span>
              </Link>
              
              <Link
                href={`/teacher-dashboard/schedule?class=${classDetail.id}`}
                className="flex flex-col items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FaCalendarAlt className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm text-center">Lịch dạy</span>
              </Link>
              
              <Link
                href={`/teacher-dashboard/reports?class=${classDetail.id}`}
                className="flex flex-col items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FaFileAlt className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm text-center">Báo cáo</span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-medium mb-4">Danh sách học sinh</h2>
          
          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã học sinh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Họ và tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày sinh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giới tính
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liên hệ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr key={`${index}-${student.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.student_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.birthday || 'Chưa cập nhật'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatSex(student.sex)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.phone || 'Chưa cập nhật'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaUserGraduate className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Chưa có học sinh trong lớp này</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 