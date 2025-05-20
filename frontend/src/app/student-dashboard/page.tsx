'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/utils/auth';
import { getStudentById } from '@/services/studentService';
import { getStudentSchedule, getLatestSemester, StudentScheduleItem } from '@/services/studentScheduleService';
import { getStudentAverageGrade, getStudentRank } from '@/services/studentGradeService';
import { FaCalendarAlt, FaChartLine, FaBook, FaUserFriends } from 'react-icons/fa';
import { toast } from 'react-toastify';

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
  user?: {
    id: number;
    name: string;
    email: string;
  };
  class?: {
    id: number;
    name: string;
    grade_id: number;
    teacher_id?: number;
    grade?: {
      id: number;
      name: string;
    };
    teacher?: {
      id: number;
      name: string;
    };
  };
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<StudentScheduleItem[]>([]);
  const [averageGrade, setAverageGrade] = useState<number>(0);
  const [rank, setRank] = useState<{rank: number, total: number}>({rank: 0, total: 0});
  const [subjectCount, setSubjectCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [currentSemester, setCurrentSemester] = useState<number>(1);
  const [currentSchoolYear, setCurrentSchoolYear] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        try {
          // 1. Lấy thông tin người dùng
          const userData = getUser();
          if (!userData) {
            setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
            setLoading(false);
            return;
          }
          
          setUser(userData);
          
          // 2. Kiểm tra xem có thông tin học sinh không
          if (!userData.student || !userData.student.id) {
            setError("Không tìm thấy thông tin học sinh. Vui lòng liên hệ quản trị viên.");
            setLoading(false);
            return;
          }
          
          console.log('Đang tải dữ liệu cho học sinh ID:', userData.student.id);
          
          // 3. Tải thông tin học sinh 
          try {
            const studentInfo = await getStudentById(userData.student.id);
            console.log('Thông tin học sinh:', studentInfo);
            setStudentData(studentInfo);
          } catch (err) {
            console.error('Không thể tải thông tin chi tiết học sinh:', err);
            toast.error('Không thể tải thông tin học sinh, sử dụng thông tin cơ bản');
            // Sử dụng thông tin cơ bản từ userData
            const basicInfo = {
              id: userData.student.id,
              name: userData.name,
              email: userData.email,
              user: {
                id: userData.id,
                name: userData.name,
                email: userData.email
              }
            };
            setStudentData(basicInfo);
          }
          
          // 4. Tải học kỳ và năm học mới nhất
          let semester = 1;
          let schoolYear = '';
          
          try {
            console.log('Đang tải học kỳ và năm học mới nhất...');
            const latestSemester = await getLatestSemester(userData.student.id);
            
            if (latestSemester) {
              console.log('Nhận được học kỳ mới nhất:', latestSemester);
              semester = latestSemester.semester;
              schoolYear = latestSemester.school_year;
              setCurrentSemester(semester);
              setCurrentSchoolYear(schoolYear);
            } else {
              // Tính năm học hiện tại nếu không có dữ liệu từ API
              const currentYear = new Date().getFullYear();
              schoolYear = `${currentYear}-${currentYear + 1}`;
              setCurrentSchoolYear(schoolYear);
              
              // Xác định học kỳ theo tháng hiện tại
              const currentMonth = new Date().getMonth() + 1; // 1-12
              semester = currentMonth >= 1 && currentMonth <= 5 ? 2 : 1;
              setCurrentSemester(semester);
            }
          } catch (err) {
            console.error('Không thể tải học kỳ và năm học mới nhất:', err);
            // Tính năm học hiện tại
            const currentYear = new Date().getFullYear();
            schoolYear = `${currentYear}-${currentYear + 1}`;
            setCurrentSchoolYear(schoolYear);
            
            // Xác định học kỳ theo tháng hiện tại
            const currentMonth = new Date().getMonth() + 1; // 1-12
            semester = currentMonth >= 1 && currentMonth <= 5 ? 2 : 1;
            setCurrentSemester(semester);
          }
          
          // 5. Tải thời khóa biểu học sinh với học kỳ và năm học đã xác định
          try {
            console.log('Đang tải thời khóa biểu với học kỳ', semester, 'năm học', schoolYear);
            
            const scheduleData = await getStudentSchedule(userData.student.id, {
              semester: semester,
              school_year: schoolYear
            });
            
            console.log('Đã nhận được thời khóa biểu:', scheduleData ? scheduleData.length : 0, 'mục');
            setSchedule(scheduleData || []);
            
            // Lấy số lượng môn học
            const uniqueSubjects = new Set(scheduleData?.map(item => item.subject) || []);
            setSubjectCount(uniqueSubjects.size);
          } catch (err) {
            console.error('Không thể tải thời khóa biểu:', err);
            toast.error('Không thể tải thời khóa biểu');
          }
          
          // 6. Tải điểm trung bình với học kỳ và năm học đã xác định
          try {
            console.log('Đang tải điểm trung bình với học kỳ', semester, 'năm học', schoolYear);
            const avgGrade = await getStudentAverageGrade(userData.student.id, semester, schoolYear);
            setAverageGrade(avgGrade || 0);
          } catch (err) {
            console.error('Không thể tải điểm trung bình:', err);
            toast.error('Không thể tải điểm trung bình');
          }
          
          // 7. Tải thứ hạng (nếu có thông tin lớp)
          try {
            const studentInfo = await getStudentById(userData.student.id);
            if (studentInfo && studentInfo.class_id) {
              console.log('Đang tải thứ hạng với học kỳ', semester, 'năm học', schoolYear);
              const rankData = await getStudentRank(userData.student.id, studentInfo.class_id, semester, schoolYear);
              setRank(rankData || {rank: 0, total: 0});
            }
          } catch (err) {
            console.error('Không thể tải thứ hạng:', err);
            toast.error('Không thể tải thứ hạng');
          }
        } catch (e) {
          console.error('Lỗi không xác định khi tải dữ liệu:', e);
          toast.error('Đã xảy ra lỗi khi tải dữ liệu');
          setError("Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.");
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, []);

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

  // Lấy lịch học cho ngày hôm nay
  const today = new Date();
  const dayIndex = today.getDay(); // 0 = Chủ nhật, 1 = Thứ hai, ...
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const todayName = days[dayIndex];
  const todaySchedule = schedule.filter(item => item.day_of_week === todayName);

  // Thêm hàm trích xuất tất cả các tiết học từ chuỗi lesson_period
  const extractPeriodNumbers = (lessonPeriod: string): number[] => {
    if (!lessonPeriod) return [1];
    
    // Xử lý dạng phạm vi "Tiết 1-5" hoặc "Thứ hai:1-5"
    const rangeMatch = lessonPeriod.match(/(\d+)-(\d+)/);
    if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        
        // Tạo mảng chứa các số từ start đến end
        const periods = [];
        for (let i = start; i <= end; i++) {
            periods.push(i);
        }
        return periods;
    }
    
    // Xử lý dạng danh sách "Tiết 1,2,3"
    const listMatch = lessonPeriod.match(/(\d+)(?:,\s*(\d+))+/);
    if (listMatch) {
        const periodList = lessonPeriod.match(/\d+/g);
        return periodList ? periodList.map(p => parseInt(p, 10)) : [1];
    }
    
    // Xử lý tiết đơn "Tiết 1" hoặc "Thứ hai:1"
    const singleMatch = lessonPeriod.match(/(\d+)/);
    if (singleMatch) {
        return [parseInt(singleMatch[1], 10)];
    }
    
    return [1]; // Mặc định tiết 1 nếu không tìm thấy
  };

  // Lấy tiết đầu tiên để sắp xếp
  const extractFirstPeriod = (lessonPeriod: string): number => {
    const periods = extractPeriodNumbers(lessonPeriod);
    return periods[0] || 1;
  };

  // Định dạng hiển thị các tiết học (ví dụ: "Tiết 1-5" hiển thị thành "1,2,3,4,5")
  const formatPeriods = (lessonPeriod: string): string => {
    const periods = extractPeriodNumbers(lessonPeriod);
    return periods.join(', ');
  };

  // Hàm chuyển đổi tiết học thành thời gian
  const getTimeByPeriod = (period: number | string): string => {
    // Nếu là chuỗi, trích xuất số tiết
    let periodNumber = typeof period === 'string' ? extractFirstPeriod(period) : period;
    
    switch (periodNumber) {
      case 1: return '7:00 - 7:45';
      case 2: return '7:50 - 8:35';
      case 3: return '8:40 - 9:25';
      case 4: return '9:35 - 10:20';
      case 5: return '10:25 - 11:10';
      case 6: return '13:00 - 13:45';
      case 7: return '13:50 - 14:35';
      case 8: return '14:40 - 15:25';
      case 9: return '15:35 - 16:20';
      case 10: return '16:25 - 17:10';
      default: return 'Không xác định';
    }
  };

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
              <span>{studentData?.birth_date || 'Chưa cập nhật'}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Giới tính</span>
              <span>{studentData?.gender === 'male' ? 'Nam' : 
                    studentData?.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Địa chỉ</span>
              <span>{studentData?.address || 'Chưa cập nhật'}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Số điện thoại</span>
              <span>{studentData?.phone || 'Chưa cập nhật'}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Email</span>
              <span>{studentData?.user?.email || studentData?.email || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Thông tin lớp học</h2>
          
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Lớp</span>
              <span className="font-medium">{studentData?.class?.name || '11A1'}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Khối</span>
              <span>{studentData?.class?.grade?.name || 'Chưa cập nhật'}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Giáo viên chủ nhiệm</span>
              <span>{studentData?.class?.teacher?.name || 'Nguyễn Văn A'}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Sĩ số</span>
              <span>{(rank.total && rank.total > 0) ? `${rank.total} học sinh` : '2 học sinh'}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Năm học</span>
              <span>{currentSchoolYear || '2025-2026'}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Học kỳ hiện tại</span>
              <span>Học kỳ {currentSemester || 1}</span>
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
            <p className="text-xl font-semibold">{todaySchedule.length} tiết</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <FaChartLine className="text-green-600 text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Điểm trung bình</h3>
            <p className="text-xl font-semibold">{averageGrade.toFixed(1)}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <FaBook className="text-purple-600 text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Môn học</h3>
            <p className="text-xl font-semibold">{subjectCount} môn</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-yellow-100 p-3 rounded-full mr-4">
            <FaUserFriends className="text-yellow-600 text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Hạng trong lớp</h3>
            <p className="text-xl font-semibold">{rank.rank || 'N/A'} / {rank.total || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Lịch học hôm nay ({todayName})</h2>
        
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
              {todaySchedule.length > 0 ? (
                todaySchedule
                  .sort((a, b) => extractFirstPeriod(a.lesson_period) - extractFirstPeriod(b.lesson_period))
                  .map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatPeriods(item.lesson_period)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTimeByPeriod(extractFirstPeriod(item.lesson_period))}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.teacher}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.room || 'Chưa cập nhật'}</td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    {dayIndex === 0 ? 'Hôm nay là Chủ nhật, không có lịch học' : 'Không có lịch học hôm nay'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
} 