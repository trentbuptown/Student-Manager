'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/utils/auth';
import { FaCalendarAlt, FaClock, FaFilter } from 'react-icons/fa';
import { getStudentSchedule, getLatestSemester, StudentScheduleItem } from '@/services/studentScheduleService';
import { toast } from 'react-toastify';
import BigCalendar from '@/components/BigCalendar';

export default function StudentSchedule() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<StudentScheduleItem[]>([]);
  const [currentSemester, setCurrentSemester] = useState<number>(1);
  const [currentSchoolYear, setCurrentSchoolYear] = useState<string>('');
  const [availableSchoolYears, setAvailableSchoolYears] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [todaySchedule, setTodaySchedule] = useState<StudentScheduleItem[]>([]);
  const [todayName, setTodayName] = useState<string | null>(null);
  const [loadingLatestSemester, setLoadingLatestSemester] = useState<boolean>(false);

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
    
    // Sắp xếp các tiết học theo thứ tự tăng dần
    const sortedPeriods = [...periods].sort((a, b) => a - b);
    
    // Biến lưu chuỗi kết quả
    const result: string[] = [];
    
    // Biến đánh dấu bắt đầu của một dãy tiết liên tục
    let start = sortedPeriods[0];
    let prev = start;
    
    // Duyệt qua từng tiết học
    for (let i = 1; i < sortedPeriods.length; i++) {
        const current = sortedPeriods[i];
        
        // Nếu tiết hiện tại không liên tục với tiết trước đó
        if (current !== prev + 1) {
            // Kết thúc dãy tiết liên tục trước đó
            if (start === prev) {
                result.push(`${start}`);
            } else {
                result.push(`${start}-${prev}`);
            }
            
            // Bắt đầu dãy tiết liên tục mới
            start = current;
        }
        
        prev = current;
    }
    
    // Xử lý dãy tiết liên tục cuối cùng
    if (start === prev) {
        result.push(`${start}`);
    } else {
        result.push(`${start}-${prev}`);
    }
    
    return result.join(", ");
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
      default: return '';
    }
  };

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
        const userData = getUser();
        if (!userData) {
          toast.error('Vui lòng đăng nhập để xem thời khóa biểu');
          return;
        }
        
        setUser(userData);
        
        try {
          if (!userData.student || !userData.student.id) {
            toast.error('Không tìm thấy thông tin học sinh');
            return;
          }

          // Tạo giá trị mặc định cho học kỳ và năm học
          const currentYear = new Date().getFullYear();
          const schoolYear = `${currentYear}-${currentYear + 1}`;
          setCurrentSchoolYear(schoolYear);

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

          // Tải lịch học với học kỳ và năm học đã lấy được
          await loadSchedule(
            userData.student.id, 
            latestSemesterData?.semester || semester, 
            latestSemesterData?.school_year || schoolYear
          );
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu thời khóa biểu:', error);
          toast.error('Không thể tải thời khóa biểu, vui lòng thử lại sau');
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    // Cập nhật lịch học ngày hôm nay khi schedule thay đổi
    updateTodaySchedule();
  }, [schedule]);

  const updateTodaySchedule = () => {
    // Tạo cấu trúc thời khóa biểu
    const daysOfWeek = ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    
    // Lấy thời khóa biểu cho ngày hôm nay
    const today = new Date();
    const dayIndex = today.getDay() - 1; // 0 = Chủ nhật, 1 = Thứ hai, ...
    const currentDayName = dayIndex >= 0 && dayIndex < 6 ? daysOfWeek[dayIndex] : null;
    setTodayName(currentDayName);
    
    const currentDaySchedule = currentDayName 
      ? schedule.filter(item => item.day_of_week === currentDayName) 
      : [];
    setTodaySchedule(currentDaySchedule);
  };

  const loadSchedule = async (studentId: number, semester: number, schoolYear: string) => {
    setLoading(true);
    try {
      const scheduleData = await getStudentSchedule(studentId, {
        semester: semester,
        school_year: schoolYear
      });
      
      setSchedule(scheduleData);
    } catch (error) {
      console.error('Lỗi khi tải thời khóa biểu:', error);
      toast.error('Không thể tải thời khóa biểu, vui lòng thử lại sau');
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
    
    setLoading(true);
    try {
      const scheduleData = await getStudentSchedule(userData.student.id, {
        semester: currentSemester,
        school_year: currentSchoolYear
      });
      
      setSchedule(scheduleData);
      
      // Hiển thị thông báo về số lượng bản ghi tải được
      if (scheduleData.length === 0) {
        toast.info(`Không tìm thấy lịch học trong Học kỳ ${currentSemester}, năm học ${currentSchoolYear}`);
      } else {
        toast.success(`Đã tải ${scheduleData.length} lịch học cho Học kỳ ${currentSemester}, năm học ${currentSchoolYear}`);
      }
    } catch (error) {
      console.error('Lỗi khi lọc lịch học:', error);
      toast.error('Không thể tải lịch học, vui lòng thử lại sau');
    } finally {
      setLoading(false);
      setIsFilterOpen(false);
    }
  };

  if (loading || loadingLatestSemester) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Tạo cấu trúc thời khóa biểu
  const daysOfWeek = ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  // Tạo mảng 2 chiều để lưu thời khóa biểu
  const scheduleGrid = daysOfWeek.map(day => {
    return periods.map(period => {
      // Tìm tất cả các phân công giảng dạy cho tiết này
      const item = schedule.find(s => 
        s.day_of_week === day && extractPeriodNumbers(s.lesson_period).includes(period)
      );
      return item || null;
    });
  });

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Thời khóa biểu</h1>
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
        >
          <FaFilter /> Lọc lịch học
        </button>
      </div>

      {isFilterOpen && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-3">Bộ lọc lịch học</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Học kỳ</label>
              <select 
                className="w-full border border-gray-300 rounded-md p-2"
                value={currentSemester}
                onChange={(e) => setCurrentSemester(Number(e.target.value))}
              >
                <option value={1}>Học kỳ 1</option>
                <option value={2}>Học kỳ 2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Năm học</label>
              <select 
                className="w-full border border-gray-300 rounded-md p-2"
                value={currentSchoolYear}
                onChange={(e) => setCurrentSchoolYear(e.target.value)}
              >
                {availableSchoolYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handleFilterChange}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Lịch học biểu tuần</h2>
          <div className="text-sm text-gray-600">
            Học kỳ: {currentSemester}, Năm học: {currentSchoolYear}
          </div>
        </div>
        <BigCalendar 
          key={`${currentSemester}-${currentSchoolYear}`} 
          scheduleData={schedule}
          semester={currentSemester}
          schoolYear={currentSchoolYear}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FaCalendarAlt className="text-blue-600 text-xl" />
            </div>
            <h2 className="text-lg font-medium">Hôm nay: {todayName || 'Chủ nhật'}</h2>
          </div>
          
          {todaySchedule.length > 0 ? (
            <div className="space-y-3">
              {todaySchedule
                .sort((a, b) => extractFirstPeriod(a.lesson_period) - extractFirstPeriod(b.lesson_period))
                .map((item, index) => (
                  <div key={index} className="flex items-start p-3 border rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="bg-blue-100 min-w-[50px] px-2 h-10 rounded-lg flex items-center justify-center mr-4 text-center">
                      <span className="font-medium text-blue-700 text-sm">Tiết {formatPeriods(item.lesson_period)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.subject}</p>
                      <div className="flex flex-wrap mt-1 text-sm text-gray-500 gap-x-2">
                        <span>{getTimeByPeriod(extractFirstPeriod(item.lesson_period))}</span>
                        <span>•</span>
                        <span>Phòng: {item.room || 'Chưa cập nhật'}</span>
                        <span>•</span>
                        <span>{item.teacher}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500">Hôm nay không có lịch học.</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FaClock className="text-green-600 text-xl" />
            </div>
            <h2 className="text-lg font-medium">Thời gian biểu</h2>
          </div>
          
          <div className="space-y-3">
            <div className="font-medium text-gray-700 pb-2 border-b">Buổi sáng</div>
            {periods.slice(0, 5).map((period) => (
              <div key={period} className="flex justify-between p-2 border-b">
                <span className="font-medium">Tiết {period}</span>
                <span className="text-gray-500">{getTimeByPeriod(period)}</span>
              </div>
            ))}
            <div className="font-medium text-gray-700 py-2 border-b">Buổi chiều</div>
            {periods.slice(5, 10).map((period) => (
              <div key={period} className="flex justify-between p-2 border-b">
                <span className="font-medium">Tiết {period}</span>
                <span className="text-gray-500">{getTimeByPeriod(period)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium">Thời khóa biểu tuần - Dạng bảng</h2>
          <p className="text-sm text-gray-500 mt-1">
            Lớp: {user?.student?.class?.name || 'Chưa phân lớp'}, 
            Học kỳ: {currentSemester}, 
            Năm học: {currentSchoolYear}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-3 text-left">Tiết</th>
                {daysOfWeek.map((day, index) => (
                  <th key={index} className="border p-3 text-left">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period, periodIndex) => (
                <tr key={periodIndex} className={periodIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border p-3 font-medium">
                    <div>Tiết {period}</div>
                    <div className="text-xs text-gray-500">{getTimeByPeriod(period)}</div>
                  </td>
                  {daysOfWeek.map((day, dayIndex) => {
                    const item = scheduleGrid[dayIndex][periodIndex];
                    return (
                      <td key={dayIndex} className="border p-3">
                        {item ? (
                          <div>
                            <div className="font-medium">{item.subject}</div>
                            <div className="text-sm text-gray-500">GV: {item.teacher}</div>
                            <div className="text-sm text-gray-500">Phòng: {item.room || 'Chưa cập nhật'}</div>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
} 