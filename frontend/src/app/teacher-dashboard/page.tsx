'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/utils/auth';
import { getTeacherById, getTeacherClasses, getTeacherSchedule } from '@/services/teacherService';

interface ScheduleItem {
  id: number;
  day_of_week: string;
  period: number;
  subject: string;
  class_name: string;
}

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        const userData = getUser();
        if (!userData) return;
        
        setUser(userData);
        
        try {
          // Lấy thông tin chi tiết giáo viên
          if (userData.teacher && userData.teacher.id) {
            const teacherDetails = await getTeacherById(userData.teacher.id);
            if (teacherDetails) {
              setTeacherData(teacherDetails);
            }
            
            // Lấy danh sách lớp học của giáo viên
            const teacherClasses = await getTeacherClasses(userData.teacher.id);
            if (teacherClasses) {
              setClasses(teacherClasses);
            }
            
            // Lấy thời khóa biểu của giáo viên
            const teacherSchedule = await getTeacherSchedule(userData.teacher.id);
            if (teacherSchedule) {
              setSchedule(teacherSchedule);
            }
          }
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu giáo viên:', error);
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

  // Lấy thời khóa biểu cho ngày hôm nay
  const today = new Date();
  const daysOfWeek = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const todayName = daysOfWeek[today.getDay()];
  const todaySchedule = schedule.filter(item => item.day_of_week === todayName);

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Xin chào, {user?.name}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Thông báo mới</h2>
          <p className="text-gray-600">Bạn không có thông báo mới.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Lịch dạy hôm nay</h2>
          {todaySchedule.length > 0 ? (
            <ul className="space-y-2">
              {todaySchedule.map((item, index) => (
                <li key={index} className="p-2 border-b">
                  <span className="font-medium">Tiết {item.period}:</span> {item.subject} - Lớp {item.class_name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Không có lịch dạy hôm nay.</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Lớp chủ nhiệm</h2>
          <p className="text-gray-600">
            {user?.teacher?.is_gvcn ? 
              (classes.find(c => c.is_homeroom)?.name || 'Đang cập nhật') : 
              'Bạn không phải là giáo viên chủ nhiệm.'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Môn giảng dạy</h2>
          <p className="text-gray-600">{user?.teacher?.specialization || 'Chưa cập nhật'}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm col-span-2">
          <h2 className="text-lg font-medium mb-4">Lớp dạy</h2>
          {classes.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {classes.map((classItem, index) => (
                <div key={index} className="p-3 border rounded-md">
                  <p className="font-medium">{classItem.name}</p>
                  <p className="text-sm text-gray-500">{classItem.subject || 'Chưa có môn học'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Chưa có lớp dạy.</p>
          )}
        </div>
      </div>
    </>
  );
} 