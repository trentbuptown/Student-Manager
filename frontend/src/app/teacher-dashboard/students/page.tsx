'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/utils/auth';
import { getTeacherClasses, getTeacherStudents, getTeacherClassStudents } from '@/services/teacherService';

export default function TeacherStudents() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uniqueTimestamp] = useState(() => new Date().getTime());

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        const userData = getUser();
        if (!userData) return;
        
        setUser(userData);
        
        try {
          if (userData.teacher && userData.teacher.id) {
            setLoading(true);
            
            // Lấy danh sách lớp học của giáo viên
            const teacherClasses = await getTeacherClasses(userData.teacher.id);
            console.log('Teacher Classes:', teacherClasses);
            
            if (teacherClasses && teacherClasses.status === 'success' && Array.isArray(teacherClasses.data)) {
              setClasses(teacherClasses.data);
            } else if (Array.isArray(teacherClasses)) {
              setClasses(teacherClasses);
            }
            
            // Mặc định, lấy tất cả học sinh của giáo viên
            const allStudents = await getTeacherStudents(userData.teacher.id);
            console.log('All students data:', allStudents);
            
            // Kiểm tra ID trùng lặp
            if (Array.isArray(allStudents)) {
              const studentIds = allStudents.map(student => student.id);
              const duplicateIds = studentIds.filter((id, index) => studentIds.indexOf(id) !== index);
              
              if (duplicateIds.length > 0) {
                console.warn('Duplicate student IDs detected:', duplicateIds);
              }
            }
            
            setStudents(allStudents);
          }
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, []);

  // Xử lý khi người dùng chọn lớp học khác
  useEffect(() => {
    const fetchStudentsByClass = async () => {
      if (!user?.teacher?.id) return;
      
      setLoading(true);
      try {
        if (selectedClass === 'all') {
          // Lấy tất cả học sinh của giáo viên
          const allStudents = await getTeacherStudents(user.teacher.id);
          setStudents(allStudents);
        } else {
          // Lấy học sinh của lớp được chọn
          const classId = parseInt(selectedClass);
          const classStudents = await getTeacherClassStudents(user.teacher.id, classId);
          setStudents(classStudents);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách học sinh theo lớp:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedClass) {
      fetchStudentsByClass();
    }
  }, [selectedClass, user?.teacher?.id]);

  // Lọc học sinh theo từ khóa tìm kiếm
  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format ngày tháng sinh
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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
                <option value="all">Tất cả các lớp</option>
                {classes.map((classItem, classIndex) => (
                  <option key={`class-${classIndex}-${classItem.id}-${uniqueTimestamp}`} value={classItem.id}>
                    {classItem.class_name} - {classItem.subject_name || 'Chưa có môn học'}
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
            <h2 className="text-lg font-medium">
              {selectedClass === 'all' 
                ? 'Danh sách tất cả học sinh' 
                : `Danh sách học sinh lớp ${classes.find(c => c.id.toString() === selectedClass)?.class_name || ''}`}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Tổng số: {filteredStudents.length} học sinh</p>
          </div>
          
          {filteredStudents.length > 0 ? (
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
                      Lớp
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
                    <tr key={`student-${index}-${student.id}-${uniqueTimestamp}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.gender}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(student.birth_date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone || 'Chưa cập nhật'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email || 'Chưa cập nhật'}</td>
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
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">Không tìm thấy học sinh nào phù hợp.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 