'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEdit, FaSave, FaTimes, FaSearch } from 'react-icons/fa';
import { getUser, isTeacher } from '@/utils/auth';
import { getTeacherClasses } from '@/services/teacherService';
import axiosClient from '@/services/axiosClient';
import toast from 'react-hot-toast';

interface Grade {
  id: number;
  student_id: number;
  student_name: string;
  subject_id: number;
  subject_name: string;
  semester: 1 | 2;
  school_year: string;
  oral_test: number | null;
  fifteen_minute_test: number | null;
  forty_five_minute_test: number | null;
  final_exam: number | null;
  average_score: number | null;
}

interface Student {
  id: number;
  name: string;
  student_id: string;
}

interface Subject {
  id: number;
  name: string;
}

export default function TeacherGrades() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('2023-2024');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Tạo state cho việc chỉnh sửa điểm
  const [editValues, setEditValues] = useState<{
    oral_test: string;
    fifteen_minute_test: string;
    forty_five_minute_test: string;
    final_exam: string;
  }>({
    oral_test: '',
    fifteen_minute_test: '',
    forty_five_minute_test: '',
    final_exam: ''
  });

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
              
              // Lấy danh sách môn học của giáo viên
              const response = await axiosClient.get(`/teachers/${userData.teacher.id}/subjects`);
              if (response.data) {
                setSubjects(response.data);
                if (response.data.length > 0) {
                  setSelectedSubject(response.data[0].id);
                }
              }
            }
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

  // Lấy danh sách học sinh khi lớp được chọn
  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedClass) {
        try {
          const response = await axiosClient.get(`/classes/${selectedClass}/students`);
          if (response.data) {
            setStudents(response.data);
          }
        } catch (error) {
          console.error('Lỗi khi tải danh sách học sinh:', error);
        }
      }
    };
    
    fetchStudents();
  }, [selectedClass]);

  // Lấy điểm số khi lớp, môn học, học kỳ, năm học được chọn
  useEffect(() => {
    const fetchGrades = async () => {
      if (selectedClass && selectedSubject) {
        try {
          setLoading(true);
          const response = await axiosClient.get('/grades', {
            params: {
              class_id: selectedClass,
              subject_id: selectedSubject,
              semester: selectedSemester,
              school_year: selectedSchoolYear
            }
          });
          
          if (response.data) {
            // Kết hợp thông tin học sinh với điểm số
            const gradesWithStudentNames = response.data.map((grade: any) => {
              const student = students.find(s => s.id === grade.student_id);
              const subject = subjects.find(s => s.id === grade.subject_id);
              return {
                ...grade,
                student_name: student ? student.name : 'Không xác định',
                subject_name: subject ? subject.name : 'Không xác định'
              };
            });
            
            setGrades(gradesWithStudentNames);
          }
        } catch (error) {
          console.error('Lỗi khi tải điểm số:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (students.length > 0 && selectedSubject) {
      fetchGrades();
    }
  }, [selectedClass, selectedSubject, selectedSemester, selectedSchoolYear, students]);

  // Hàm bắt đầu chỉnh sửa điểm
  const startEditing = (grade: Grade) => {
    setEditingGradeId(grade.id);
    setEditValues({
      oral_test: grade.oral_test !== null ? grade.oral_test.toString() : '',
      fifteen_minute_test: grade.fifteen_minute_test !== null ? grade.fifteen_minute_test.toString() : '',
      forty_five_minute_test: grade.forty_five_minute_test !== null ? grade.forty_five_minute_test.toString() : '',
      final_exam: grade.final_exam !== null ? grade.final_exam.toString() : ''
    });
  };

  // Hàm hủy chỉnh sửa
  const cancelEditing = () => {
    setEditingGradeId(null);
  };

  // Hàm xử lý thay đổi giá trị điểm
  const handleEditChange = (field: keyof typeof editValues, value: string) => {
    // Kiểm tra giá trị nhập vào là số từ 0-10 hoặc rỗng
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0 && parseFloat(value) <= 10)) {
      setEditValues({
        ...editValues,
        [field]: value
      });
    }
  };

  // Hàm lưu điểm sau khi chỉnh sửa
  const saveGrade = async (gradeId: number) => {
    try {
      // Chuyển đổi giá trị từ string sang number hoặc null
      const updatedGrade = {
        oral_test: editValues.oral_test !== '' ? parseFloat(editValues.oral_test) : null,
        fifteen_minute_test: editValues.fifteen_minute_test !== '' ? parseFloat(editValues.fifteen_minute_test) : null,
        forty_five_minute_test: editValues.forty_five_minute_test !== '' ? parseFloat(editValues.forty_five_minute_test) : null,
        final_exam: editValues.final_exam !== '' ? parseFloat(editValues.final_exam) : null
      };
      
      // Gọi API cập nhật điểm
      await axiosClient.put(`/grades/${gradeId}`, updatedGrade);
      
      // Cập nhật state grades
      const updatedGrades = grades.map(grade => {
        if (grade.id === gradeId) {
          // Tính điểm trung bình
          const scores = [
            updatedGrade.oral_test,
            updatedGrade.fifteen_minute_test,
            updatedGrade.forty_five_minute_test,
            updatedGrade.final_exam
          ].filter(score => score !== null) as number[];
          
          const weights = [1, 1, 2, 3];
          let totalWeightedScore = 0;
          let totalWeight = 0;
          
          scores.forEach((score, index) => {
            if (score !== null) {
              totalWeightedScore += score * weights[index];
              totalWeight += weights[index];
            }
          });
          
          const averageScore = totalWeight > 0 ? totalWeightedScore / totalWeight : null;
          
          return {
            ...grade,
            ...updatedGrade,
            average_score: averageScore !== null ? parseFloat(averageScore.toFixed(2)) : null
          };
        }
        return grade;
      });
      
      setGrades(updatedGrades);
      setEditingGradeId(null);
      toast.success('Cập nhật điểm thành công');
    } catch (error) {
      console.error('Lỗi khi cập nhật điểm:', error);
      toast.error('Không thể cập nhật điểm');
    }
  };

  // Lọc học sinh theo từ khóa tìm kiếm
  const filteredGrades = grades.filter(grade =>
    grade.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hàm tạo điểm mới cho học sinh chưa có điểm
  const createMissingGrades = async () => {
    try {
      setLoading(true);
      
      // Tìm học sinh chưa có điểm
      const studentsWithoutGrades = students.filter(student => 
        !grades.some(grade => grade.student_id === student.id)
      );
      
      if (studentsWithoutGrades.length === 0) {
        toast.success('Tất cả học sinh đã có điểm');
        setLoading(false);
        return;
      }
      
      // Tạo điểm mới cho các học sinh chưa có
      const newGradesPromises = studentsWithoutGrades.map(student => 
        axiosClient.post('/grades', {
          student_id: student.id,
          subject_id: selectedSubject,
          class_id: selectedClass,
          semester: selectedSemester,
          school_year: selectedSchoolYear
        })
      );
      
      await Promise.all(newGradesPromises);
      
      // Tải lại điểm sau khi tạo mới
      const response = await axiosClient.get('/grades', {
        params: {
          class_id: selectedClass,
          subject_id: selectedSubject,
          semester: selectedSemester,
          school_year: selectedSchoolYear
        }
      });
      
      if (response.data) {
        const gradesWithStudentNames = response.data.map((grade: any) => {
          const student = students.find(s => s.id === grade.student_id);
          const subject = subjects.find(s => s.id === grade.subject_id);
          return {
            ...grade,
            student_name: student ? student.name : 'Không xác định',
            subject_name: subject ? subject.name : 'Không xác định'
          };
        });
        
        setGrades(gradesWithStudentNames);
      }
      
      toast.success('Đã tạo điểm cho học sinh chưa có điểm');
    } catch (error) {
      console.error('Lỗi khi tạo điểm mới:', error);
      toast.error('Không thể tạo điểm mới');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý điểm</h1>
      
      {classes.length > 0 ? (
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
              
              <div className="flex items-end mt-4 md:mt-0">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Xem danh sách điểm
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium">Bảng điểm lớp {classes.find(c => c.id.toString() === selectedClass)?.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Môn học: {classes.find(c => c.id.toString() === selectedClass)?.subject || 'Chưa có môn học'}</p>
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
                      Điểm miệng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm 15p
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm 1 tiết
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm cuối kỳ
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm TB
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Dữ liệu mẫu */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Nguyễn Văn A</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">9, 8</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8.5, 9</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">7.5</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8.0</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">8.2</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900">
                        Cập nhật
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Trần Thị B</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">7, 8</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">7.5, 8</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8.0</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">7.5</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">7.7</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900">
                        Cập nhật
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-600">Bạn chưa được phân công lớp dạy nào.</p>
        </div>
      )}
    </div>
  );
} 