import axiosClient from './axiosClient';
import { toast } from 'react-toastify';

export interface StudentScheduleItem {
  id: number;
  day_of_week: string;
  lesson_period: string;
  subject: string;
  subject_id: number;
  teacher: string;
  teacher_id: number;
  room: string;
  class_id: number;
  semester: number;
  school_year: string;
}

export interface ScheduleFilter {
  day_of_week?: string;
  semester?: number;
  school_year?: string;
}

interface ScheduleResponse {
  error: string | null;
  schedule: StudentScheduleItem[];
}

interface LatestSemesterResponse {
  error: string | null;
  data: {
    semester: number;
    school_year: string;
  } | null;
}

// Lấy thời khóa biểu của học sinh
export const getStudentSchedule = async (studentId: number, filters?: ScheduleFilter): Promise<StudentScheduleItem[]> => {
  try {
    console.log(`Đang tải thời khóa biểu cho học sinh ID: ${studentId}`);
    
    try {
      const response = await axiosClient.get<ScheduleResponse>(`/students/${studentId}/schedule`, { params: filters });
      
      if (response && response.data) {
        if (response.data.error) {
          console.warn('API trả về lỗi:', response.data.error);
          toast.error(response.data.error);
          return [];
        }

        console.log(`Nhận được dữ liệu thời khóa biểu từ API: ${response.data.schedule.length} mục`);
        return response.data.schedule;
      } else {
        console.warn('API trả về dữ liệu rỗng');
        return [];
      }
    } catch (apiError: any) {
      console.error(`API /students/${studentId}/schedule gặp lỗi:`, apiError);
      const errorMessage = apiError.response?.data?.error || 'Không thể tải thời khóa biểu, vui lòng thử lại sau';
      toast.error(errorMessage);
      return [];
    }
  } catch (error) {
    console.error(`Lỗi không xác định khi tải thời khóa biểu của học sinh ${studentId}:`, error);
    toast.error('Không thể tải thời khóa biểu, vui lòng thử lại sau');
    return [];
  }
};

// Lấy học kỳ và năm học mới nhất của học sinh
export const getLatestSemester = async (studentId: number): Promise<{semester: number, school_year: string} | null> => {
  try {
    console.log(`Đang tải học kỳ và năm học mới nhất cho học sinh ID: ${studentId}`);
    
    try {
      const response = await axiosClient.get<LatestSemesterResponse>(`/students/${studentId}/latest-semester`);
      
      if (response && response.data) {
        if (response.data.error) {
          console.warn('API trả về lỗi:', response.data.error);
          toast.error(response.data.error);
          return null;
        }

        if (!response.data.data) {
          console.warn('API trả về dữ liệu rỗng');
          return null;
        }

        console.log(`Nhận được học kỳ và năm học mới nhất từ API:`, response.data.data);
        return response.data.data;
      } else {
        console.warn('API trả về dữ liệu rỗng');
        return null;
      }
    } catch (apiError: any) {
      console.error(`API /students/${studentId}/latest-semester gặp lỗi:`, apiError);
      const errorMessage = apiError.response?.data?.error || 'Không thể tải học kỳ và năm học mới nhất, vui lòng thử lại sau';
      toast.error(errorMessage);
      return null;
    }
  } catch (error) {
    console.error(`Lỗi không xác định khi tải học kỳ và năm học mới nhất của học sinh ${studentId}:`, error);
    toast.error('Không thể tải học kỳ và năm học mới nhất, vui lòng thử lại sau');
    return null;
  }
};

// Lấy thời khóa biểu theo ngày
export const getStudentScheduleByDay = async (studentId: number, dayOfWeek: string): Promise<StudentScheduleItem[]> => {
  try {
    try {
      const response = await axiosClient.get<ScheduleResponse>(`/students/${studentId}/schedule`, { 
        params: { day_of_week: dayOfWeek } 
      });
      
      if (response && response.data) {
        if (response.data.error) {
          console.warn('API trả về lỗi:', response.data.error);
          toast.error(response.data.error);
          return [];
        }
        return response.data.schedule;
      }
      
      return [];
    } catch (apiError: any) {
      console.error(`API /students/${studentId}/schedule gặp lỗi:`, apiError);
      const errorMessage = apiError.response?.data?.error || 'Không thể tải thời khóa biểu, vui lòng thử lại sau';
      toast.error(errorMessage);
      return [];
    }
  } catch (error) {
    console.error(`Lỗi khi tải thời khóa biểu cho học sinh ${studentId} vào ngày ${dayOfWeek}:`, error);
    return [];
  }
}; 