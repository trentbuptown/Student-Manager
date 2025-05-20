'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/utils/auth';
import { FaBook, FaChalkboardTeacher, FaFilter } from 'react-icons/fa';
import { getStudentSubjects, StudentSubject } from '@/services/subjectService';
import { getLatestSemester } from '@/services/studentScheduleService';
import { toast } from 'react-toastify';

export default function StudentSubjects() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [currentSemester, setCurrentSemester] = useState<number>(1);
  const [currentSchoolYear, setCurrentSchoolYear] = useState<string>('');
  const [availableSchoolYears, setAvailableSchoolYears] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loadingLatestSemester, setLoadingLatestSemester] = useState<boolean>(false);

  useEffect(() => {
    // Tạo danh sách năm học (từ năm hiện tại trở về 3 năm trước và 1 năm sau)
    const generateSchoolYears = () => {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let i = -3; i <= 1; i++) {
        const year = currentYear + i;
        years.push(`${year}-${year + 1}`);
      }
      return years.reverse(); // Để năm gần nhất hiện lên đầu
    };

    setAvailableSchoolYears(generateSchoolYears());

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
          
          // Tạo giá trị mặc định cho học kỳ và năm học
          const currentYear = new Date().getFullYear();
          const schoolYear = `${currentYear}-${currentYear + 1}`;
          setCurrentSchoolYear(schoolYear);
          
          // Xác định học kỳ theo tháng hiện tại
          const currentMonth = new Date().getMonth() + 1; // 1-12
          const semester = currentMonth >= 1 && currentMonth <= 5 ? 2 : 1;
          setCurrentSemester(semester);
          
          // Tải học kỳ và năm học mới nhất
          setLoadingLatestSemester(true);
          const latestSemesterData = await getLatestSemester(userData.student.id);
          if (latestSemesterData) {
            setCurrentSemester(latestSemesterData.semester);
            setCurrentSchoolYear(latestSemesterData.school_year);
            toast.info(`Đã tải học kỳ ${latestSemesterData.semester}, năm học ${latestSemesterData.school_year} mới nhất`);
          } else {
            // Nếu không có dữ liệu mới nhất, sử dụng giá trị mặc định
            setCurrentSemester(semester);
            setCurrentSchoolYear(schoolYear);
          }
          setLoadingLatestSemester(false);
          
          // Lấy danh sách môn học của học sinh với học kỳ và năm học đã lấy được
          await loadSubjects(
            userData.student.id, 
            latestSemesterData?.semester || semester, 
            latestSemesterData?.school_year || schoolYear
          );
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu môn học:', error);
          toast.error('Không thể tải danh sách môn học');
          setError("Đã xảy ra lỗi khi tải thông tin môn học. Vui lòng thử lại sau.");
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, []);

  const loadSubjects = async (studentId: number, semester: number, schoolYear: string) => {
    setLoading(true);
    try {
      console.log('Đang tải danh sách môn học cho học sinh ID:', studentId);
      
      const subjectsData = await getStudentSubjects(studentId, semester, schoolYear);
      console.log('Đã nhận được danh sách môn học:', subjectsData);
      
      if (subjectsData && subjectsData.length > 0) {
        setSubjects(subjectsData);
      } else {
        console.warn('Không có dữ liệu môn học');
        toast.warning('Không tìm thấy dữ liệu môn học');
        setSubjects([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu môn học:', error);
      toast.error('Không thể tải danh sách môn học');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async () => {
    const userData = getUser();
    if (!userData || !userData.student || !userData.student.id) {
      toast.error('Không tìm thấy thông tin học sinh');
      return;
    }
    
    await loadSubjects(userData.student.id, currentSemester, currentSchoolYear);
    setIsFilterOpen(false);
  };

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

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danh sách môn học</h1>
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
        >
          <FaFilter /> Bộ lọc
        </button>
      </div>
      
      {isFilterOpen && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Lọc theo học kỳ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Học kỳ</label>
              <select 
                value={currentSemester} 
                onChange={(e) => setCurrentSemester(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                disabled={loadingLatestSemester}
              >
                <option value={1}>Học kỳ 1</option>
                <option value={2}>Học kỳ 2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Năm học</label>
              <select 
                value={currentSchoolYear} 
                onChange={(e) => setCurrentSchoolYear(e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={loadingLatestSemester}
              >
                {availableSchoolYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleFilterChange}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={loadingLatestSemester}
            >
              {loadingLatestSemester ? 'Đang tải...' : 'Áp dụng'}
            </button>
          </div>
        </div>
      )}
      
      <div className="mb-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-sm text-gray-500">Học kỳ:</span>
            <span className="ml-2 font-medium">{currentSemester}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Năm học:</span>
            <span className="ml-2 font-medium">{currentSchoolYear}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Tổng số môn học:</span>
            <span className="ml-2 font-medium">{subjects.length}</span>
          </div>
        </div>
      </div>
      
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {subjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <FaBook className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{subject.name}</h3>
                    <div className="flex items-center mt-1 text-gray-600">
                      <FaChalkboardTeacher className="mr-2" />
                      <span>Giáo viên: {subject.teacher}</span>
                    </div>
                    <div className="mt-1 text-gray-500 text-sm">
                      <span>Tiết: {subject.lesson_period || 'Chưa có thông tin'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative" role="alert">
          <p>Không tìm thấy môn học nào cho học kỳ và năm học đã chọn.</p>
        </div>
      )}
    </>
  );
} 