'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/utils/auth';
import { FaUserFriends, FaUser, FaChalkboardTeacher, FaSearch } from 'react-icons/fa';
import { getStudentClass, getClassmatesOfStudent, ClassInfo as ClassInfoType, ClassStudent } from '@/services/classService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ClassInfo() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classInfo, setClassInfo] = useState<ClassInfoType | null>(null);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        try {
          // Lấy thông tin người dùng
          const userData = getUser();
          if (!userData) {
            setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
            setLoading(false);
            return;
          }
          
          setUser(userData);
          
          // Kiểm tra xem có thông tin học sinh không
          if (!userData.student || !userData.student.id) {
            setError("Không tìm thấy thông tin học sinh. Vui lòng liên hệ quản trị viên.");
            setLoading(false);
            return;
          }
          
          // Lấy thông tin lớp học của học sinh
          const studentId = userData.student.id;
          console.log('Đang tải thông tin lớp học cho học sinh ID:', studentId);
          
          // Gọi API để lấy thông tin lớp học
          const classData = await getStudentClass(studentId);
          console.log('Đã nhận được thông tin lớp học:', classData);
          setClassInfo(classData);
          
          // Gọi API để lấy danh sách học sinh trong lớp
          const studentsData = await getClassmatesOfStudent(studentId);
          console.log('Đã nhận được danh sách học sinh:', studentsData);
          setStudents(studentsData);
          
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu lớp học:', error);
          toast.error('Không thể tải thông tin lớp học');
          setError("Đã xảy ra lỗi khi tải thông tin lớp học. Vui lòng thử lại sau.");
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
    (student.user?.email && student.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Danh sách cán bộ lớp
  const classOfficers = students.filter(student => student.class_position);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Lỗi! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // Format ngày sinh theo định dạng dd/MM/yyyy
  const formatBirthDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

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
              {classInfo.grade && (
                <p className="text-sm text-gray-500">{classInfo.grade.name}</p>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FaChalkboardTeacher className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Giáo viên chủ nhiệm</h3>
              <p className="text-xl font-semibold">{classInfo.teacher?.name || 'Chưa phân công'}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <FaUser className="text-purple-600 text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Sĩ số</h3>
              <p className="text-xl font-semibold">{students.length || classInfo.students_count || 0} học sinh</p>
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chức vụ
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.gender === 'male' ? 'Nam' : 
                     student.gender === 'female' ? 'Nữ' : 
                     student.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatBirthDate(student.birth_date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.user?.email || ''}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone || ''}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class_position || ''}</td>
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
      
      {classOfficers.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4">Ban cán sự lớp</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classOfficers.map((officer) => (
              <div key={officer.id} className="p-4 border rounded-lg">
                <h3 className="font-medium">{officer.class_position}</h3>
                <p className="text-gray-600">{officer.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
} 