'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/utils/auth';
import { getTeacherClasses } from '@/services/teacherService';

export default function TeacherStudents() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        const userData = getUser();
        if (!userData) return;
        
        setUser(userData);
        
        try {
          if (userData.teacher && userData.teacher.id) {
            // Lấy danh sách lớp học của giáo viên
            const teacherClasses = await getTeacherClasses(userData.teacher.id);
            if (teacherClasses && teacherClasses.length > 0) {
              setClasses(teacherClasses);
              setSelectedClass(teacherClasses[0].id.toString());
              
              // Tạo dữ liệu mẫu cho học sinh
              const sampleStudents = Array(15).fill(0).map((_, index) => ({
                id: index + 1,
                name: `Học sinh ${index + 1}`,
                gender: index % 2 === 0 ? 'Nam' : 'Nữ',
                birth_date: '2005-01-01',
                address: 'TP. Hồ Chí Minh',
                phone: '0123456789',
                email: `student${index + 1}@example.com`,
                class_id: teacherClasses[0].id
              }));
              
              setStudents(sampleStudents);
            }
          }
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
      <h1 className="text-2xl font-bold mb-6">Danh sách học sinh</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-full md:w-1/3">
              <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-1">
                Chọn lớp
              </label>
              <select
                id="class-select"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name} - {classItem.subject || 'Chưa có môn học'}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-2/3">
              <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm học sinh
              </label>
              <input
                id="search-input"
                type="text"
                placeholder="Nhập tên hoặc email học sinh..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-medium">Danh sách học sinh lớp {classes.find(c => c.id.toString() === selectedClass)?.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Tổng số: {filteredStudents.length} học sinh</p>
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
                    Địa chỉ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số điện thoại
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student, index) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.gender}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.birth_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Xem chi tiết
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        Xem điểm
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
} 