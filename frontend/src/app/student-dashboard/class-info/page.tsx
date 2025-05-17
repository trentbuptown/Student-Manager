'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/utils/auth';
import { FaUserFriends, FaUser, FaChalkboardTeacher, FaSearch } from 'react-icons/fa';

interface ClassInfo {
  id: number;
  name: string;
  homeroom_teacher: string;
  student_count: number;
  year: string;
}

interface Student {
  id: number;
  name: string;
  gender: string;
  birth_date: string;
  email: string;
  phone: string;
  address: string;
}

export default function ClassInfo() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        const userData = getUser();
        if (!userData) return;
        
        setUser(userData);
        
        try {
          // Tạo dữ liệu mẫu cho lớp học
          const sampleClassInfo: ClassInfo = {
            id: 1,
            name: '12A1',
            homeroom_teacher: 'Nguyễn Văn A',
            student_count: 35,
            year: '2023-2024'
          };
          
          setClassInfo(sampleClassInfo);
          
          // Tạo dữ liệu mẫu cho danh sách học sinh
          const sampleStudents: Student[] = Array(35).fill(0).map((_, index) => ({
            id: index + 1,
            name: `Học sinh ${index + 1}`,
            gender: index % 2 === 0 ? 'Nam' : 'Nữ',
            birth_date: '2005-01-01',
            email: `student${index + 1}@example.com`,
            phone: '0123456789',
            address: 'TP. Hồ Chí Minh'
          }));
          
          setStudents(sampleStudents);
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu lớp học:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, []);

  // Lọc học sinh theo từ khóa tìm kiếm
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Thông tin lớp học</h1>
      
      {classInfo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FaUserFriends className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Lớp</h3>
              <p className="text-xl font-semibold">{classInfo.name}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FaChalkboardTeacher className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Giáo viên chủ nhiệm</h3>
              <p className="text-xl font-semibold">{classInfo.homeroom_teacher}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <FaUser className="text-purple-600 text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Sĩ số</h3>
              <p className="text-xl font-semibold">{classInfo.student_count} học sinh</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium mb-4">Danh sách học sinh</h2>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm học sinh..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STT
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Họ tên
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giới tính
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày sinh
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student, index) => (
                <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.birth_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredStudents.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-gray-500">Không tìm thấy học sinh nào.</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Ban cán sự lớp</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium">Lớp trưởng</h3>
            <p className="text-gray-600">Học sinh 1</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium">Lớp phó học tập</h3>
            <p className="text-gray-600">Học sinh 2</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium">Lớp phó đời sống</h3>
            <p className="text-gray-600">Học sinh 3</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium">Bí thư</h3>
            <p className="text-gray-600">Học sinh 4</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium">Phó bí thư</h3>
            <p className="text-gray-600">Học sinh 5</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium">Thủ quỹ</h3>
            <p className="text-gray-600">Học sinh 6</p>
          </div>
        </div>
      </div>
    </>
  );
} 