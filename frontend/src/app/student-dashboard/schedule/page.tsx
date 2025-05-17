'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/utils/auth';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

interface ScheduleItem {
  day_of_week: string;
  period: number;
  subject: string;
  teacher: string;
  room: string;
  time: string;
}

export default function StudentSchedule() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        const userData = getUser();
        if (!userData) return;
        
        setUser(userData);
        
        try {
          // Tạo dữ liệu mẫu cho thời khóa biểu
          const sampleSchedule: ScheduleItem[] = [
            // Thứ hai
            { day_of_week: 'Thứ hai', period: 1, subject: 'Toán học', teacher: 'Nguyễn Văn B', room: 'A101', time: '7:00 - 7:45' },
            { day_of_week: 'Thứ hai', period: 2, subject: 'Toán học', teacher: 'Nguyễn Văn B', room: 'A101', time: '7:50 - 8:35' },
            { day_of_week: 'Thứ hai', period: 3, subject: 'Vật lý', teacher: 'Trần Thị C', room: 'A102', time: '8:40 - 9:25' },
            { day_of_week: 'Thứ hai', period: 4, subject: 'Hóa học', teacher: 'Lê Văn D', room: 'A103', time: '9:35 - 10:20' },
            { day_of_week: 'Thứ hai', period: 5, subject: 'Sinh học', teacher: 'Phạm Thị E', room: 'A104', time: '10:25 - 11:10' },
            
            // Thứ ba
            { day_of_week: 'Thứ ba', period: 1, subject: 'Ngữ văn', teacher: 'Hoàng Văn F', room: 'A101', time: '7:00 - 7:45' },
            { day_of_week: 'Thứ ba', period: 2, subject: 'Ngữ văn', teacher: 'Hoàng Văn F', room: 'A101', time: '7:50 - 8:35' },
            { day_of_week: 'Thứ ba', period: 3, subject: 'Tiếng Anh', teacher: 'Đỗ Thị G', room: 'A102', time: '8:40 - 9:25' },
            { day_of_week: 'Thứ ba', period: 4, subject: 'Lịch sử', teacher: 'Bùi Văn H', room: 'A103', time: '9:35 - 10:20' },
            { day_of_week: 'Thứ ba', period: 5, subject: 'Địa lý', teacher: 'Trịnh Thị I', room: 'A104', time: '10:25 - 11:10' },
            
            // Thứ tư
            { day_of_week: 'Thứ tư', period: 1, subject: 'Toán học', teacher: 'Nguyễn Văn B', room: 'A101', time: '7:00 - 7:45' },
            { day_of_week: 'Thứ tư', period: 2, subject: 'Vật lý', teacher: 'Trần Thị C', room: 'A102', time: '7:50 - 8:35' },
            { day_of_week: 'Thứ tư', period: 3, subject: 'Hóa học', teacher: 'Lê Văn D', room: 'A103', time: '8:40 - 9:25' },
            { day_of_week: 'Thứ tư', period: 4, subject: 'Tin học', teacher: 'Vũ Thị K', room: 'A105', time: '9:35 - 10:20' },
            { day_of_week: 'Thứ tư', period: 5, subject: 'Tin học', teacher: 'Vũ Thị K', room: 'A105', time: '10:25 - 11:10' },
            
            // Thứ năm
            { day_of_week: 'Thứ năm', period: 1, subject: 'Tiếng Anh', teacher: 'Đỗ Thị G', room: 'A102', time: '7:00 - 7:45' },
            { day_of_week: 'Thứ năm', period: 2, subject: 'Tiếng Anh', teacher: 'Đỗ Thị G', room: 'A102', time: '7:50 - 8:35' },
            { day_of_week: 'Thứ năm', period: 3, subject: 'Sinh học', teacher: 'Phạm Thị E', room: 'A104', time: '8:40 - 9:25' },
            { day_of_week: 'Thứ năm', period: 4, subject: 'GDCD', teacher: 'Lý Thị L', room: 'A106', time: '9:35 - 10:20' },
            { day_of_week: 'Thứ năm', period: 5, subject: 'Thể dục', teacher: 'Ngô Văn M', room: 'Sân trường', time: '10:25 - 11:10' },
            
            // Thứ sáu
            { day_of_week: 'Thứ sáu', period: 1, subject: 'Toán học', teacher: 'Nguyễn Văn B', room: 'A101', time: '7:00 - 7:45' },
            { day_of_week: 'Thứ sáu', period: 2, subject: 'Ngữ văn', teacher: 'Hoàng Văn F', room: 'A101', time: '7:50 - 8:35' },
            { day_of_week: 'Thứ sáu', period: 3, subject: 'Lịch sử', teacher: 'Bùi Văn H', room: 'A103', time: '8:40 - 9:25' },
            { day_of_week: 'Thứ sáu', period: 4, subject: 'Địa lý', teacher: 'Trịnh Thị I', room: 'A104', time: '9:35 - 10:20' },
            { day_of_week: 'Thứ sáu', period: 5, subject: 'GDQP', teacher: 'Đặng Văn N', room: 'A107', time: '10:25 - 11:10' },
            
            // Thứ bảy
            { day_of_week: 'Thứ bảy', period: 1, subject: 'Sinh hoạt lớp', teacher: 'Nguyễn Văn A', room: 'A101', time: '7:00 - 7:45' },
            { day_of_week: 'Thứ bảy', period: 2, subject: 'Thể dục', teacher: 'Ngô Văn M', room: 'Sân trường', time: '7:50 - 8:35' },
            { day_of_week: 'Thứ bảy', period: 3, subject: 'Thể dục', teacher: 'Ngô Văn M', room: 'Sân trường', time: '8:40 - 9:25' }
          ];
          
          setSchedule(sampleSchedule);
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu thời khóa biểu:', error);
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

  // Tạo cấu trúc thời khóa biểu
  const daysOfWeek = ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const periods = [1, 2, 3, 4, 5];
  
  // Tạo mảng 2 chiều để lưu thời khóa biểu
  const scheduleGrid = daysOfWeek.map(day => {
    return periods.map(period => {
      const item = schedule.find(s => s.day_of_week === day && s.period === period);
      return item || null;
    });
  });

  // Lấy thời khóa biểu cho ngày hôm nay
  const today = new Date();
  const dayIndex = today.getDay() - 1; // 0 = Chủ nhật, 1 = Thứ hai, ...
  const todayName = dayIndex >= 0 && dayIndex < 6 ? daysOfWeek[dayIndex] : null;
  const todaySchedule = todayName ? schedule.filter(item => item.day_of_week === todayName) : [];

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Thời khóa biểu</h1>
      
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
                .sort((a, b) => a.period - b.period)
                .map((item, index) => (
                  <div key={index} className="flex items-center p-3 border rounded-lg">
                    <div className="bg-blue-50 h-10 w-10 rounded-full flex items-center justify-center mr-4">
                      <span className="font-medium text-blue-700">{item.period}</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.subject}</p>
                      <p className="text-sm text-gray-500">
                        {item.time} • {item.room} • {item.teacher}
                      </p>
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
            <div className="flex justify-between p-2 border-b">
              <span className="font-medium">Tiết 1</span>
              <span className="text-gray-500">7:00 - 7:45</span>
            </div>
            <div className="flex justify-between p-2 border-b">
              <span className="font-medium">Tiết 2</span>
              <span className="text-gray-500">7:50 - 8:35</span>
            </div>
            <div className="flex justify-between p-2 border-b">
              <span className="font-medium">Tiết 3</span>
              <span className="text-gray-500">8:40 - 9:25</span>
            </div>
            <div className="flex justify-between p-2 border-b">
              <span className="font-medium">Tiết 4</span>
              <span className="text-gray-500">9:35 - 10:20</span>
            </div>
            <div className="flex justify-between p-2 border-b">
              <span className="font-medium">Tiết 5</span>
              <span className="text-gray-500">10:25 - 11:10</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium">Thời khóa biểu tuần</h2>
          <p className="text-sm text-gray-500 mt-1">Lớp: 12A1, Năm học: 2023-2024</p>
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
                  <td className="border p-3 font-medium">Tiết {period}</td>
                  {daysOfWeek.map((day, dayIndex) => {
                    const item = scheduleGrid[dayIndex][periodIndex];
                    return (
                      <td key={dayIndex} className="border p-3">
                        {item ? (
                          <div>
                            <div className="font-medium">{item.subject}</div>
                            <div className="text-sm text-gray-500">GV: {item.teacher}</div>
                            <div className="text-sm text-gray-500">Phòng: {item.room}</div>
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