'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/utils/auth';
import { FaCalendarAlt, FaChartLine, FaBook, FaUserFriends } from 'react-icons/fa';

interface Student {
  id: number;
  name: string;
  birth_date?: string;
  gender?: string;
  address?: string;
  phone?: string;
  email?: string;
  class_name?: string;
  class_id?: number;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        const userData = getUser();
        if (!userData) return;
        
        setUser(userData);
        
        try {
          // Tạo dữ liệu mẫu cho học sinh
          if (userData.student && userData.student.id) {
            const studentInfo: Student = {
              id: userData.student.id,
              name: userData.name,
              birth_date: '2005-01-15',
              gender: 'Nam',
              address: 'TP. Hồ Chí Minh',
              phone: '0123456789',
              email: userData.email,
              class_name: '12A1',
              class_id: 1
            };
            
            setStudentData(studentInfo);
          }
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu học sinh:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Xin chào, {user?.name}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Thông tin cá nhân</h2>
          
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Họ và tên</span>
              <span className="font-medium">{studentData?.name}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Ngày sinh</span>
              <span>{studentData?.birth_date}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Giới tính</span>
              <span>{studentData?.gender}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Địa chỉ</span>
              <span>{studentData?.address}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Số điện thoại</span>
              <span>{studentData?.phone}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Email</span>
              <span>{studentData?.email}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Thông tin lớp học</h2>
          
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Lớp</span>
              <span className="font-medium">{studentData?.class_name}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Giáo viên chủ nhiệm</span>
              <span>Nguyễn Văn A</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Sĩ số</span>
              <span>35 học sinh</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Năm học</span>
              <span>2023-2024</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Học kỳ hiện tại</span>
              <span>Học kỳ 1</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <FaCalendarAlt className="text-blue-600 text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Tiết học hôm nay</h3>
            <p className="text-xl font-semibold">5 tiết</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <FaChartLine className="text-green-600 text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Điểm trung bình</h3>
            <p className="text-xl font-semibold">8.5</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <FaBook className="text-purple-600 text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Môn học</h3>
            <p className="text-xl font-semibold">12 môn</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-yellow-100 p-3 rounded-full mr-4">
            <FaUserFriends className="text-yellow-600 text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Hạng trong lớp</h3>
            <p className="text-xl font-semibold">5 / 35</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Lịch học hôm nay</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiết
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Môn học
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giáo viên
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng học
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">7:00 - 7:45</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Toán học</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Nguyễn Văn B</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">A101</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">7:50 - 8:35</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Vật lý</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Trần Thị C</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">A102</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8:40 - 9:25</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Hóa học</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Lê Văn D</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">A103</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">9:35 - 10:20</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Ngữ văn</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Phạm Thị E</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">A101</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10:25 - 11:10</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Tiếng Anh</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Hoàng Văn F</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">A104</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
} 