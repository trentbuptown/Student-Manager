'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/utils/auth';
import { getTeacherSchedule } from '@/services/teacherService';

interface ScheduleItem {
  id: number;
  day_of_week: string;
  period: number;
  subject: string;
  class_name: string;
}

export default function TeacherSchedule() {
  const [user, setUser] = useState<any>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        const userData = getUser();
        if (!userData) return;
        
        setUser(userData);
        
        try {
          if (userData.teacher && userData.teacher.id) {
            // Lấy thời khóa biểu của giáo viên
            const teacherSchedule = await getTeacherSchedule(userData.teacher.id);
            if (teacherSchedule) {
              setSchedule(teacherSchedule);
            }
          }
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
  const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  // Tạo mảng 2 chiều để lưu thời khóa biểu
  const scheduleGrid = daysOfWeek.map(day => {
    return periods.map(period => {
      const item = schedule.find(s => s.day_of_week === day && s.period === period);
      return item || null;
    });
  });

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Thời khóa biểu</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium">Thời khóa biểu giảng dạy</h2>
          <p className="text-sm text-gray-500 mt-1">Giáo viên: {user?.name}</p>
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
                            <div className="text-sm text-gray-500">Lớp: {item.class_name}</div>
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
      
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Lịch dạy hôm nay</h2>
        
        {(() => {
          const today = new Date();
          const dayIndex = today.getDay() - 1; // 0 = Chủ nhật, 1 = Thứ hai, ...
          
          if (dayIndex < 0 || dayIndex > 5) {
            return <p className="text-gray-600">Hôm nay là Chủ nhật, không có lịch dạy.</p>;
          }
          
          const todayName = daysOfWeek[dayIndex];
          const todaySchedule = schedule.filter(item => item.day_of_week === todayName);
          
          if (todaySchedule.length === 0) {
            return <p className="text-gray-600">Hôm nay không có lịch dạy.</p>;
          }
          
          return (
            <ul className="space-y-2">
              {todaySchedule
                .sort((a, b) => a.period - b.period)
                .map((item, index) => (
                  <li key={index} className="p-2 border-b last:border-0">
                    <span className="font-medium">Tiết {item.period}:</span> {item.subject} - Lớp {item.class_name}
                  </li>
                ))}
            </ul>
          );
        })()}
      </div>
    </>
  );
} 