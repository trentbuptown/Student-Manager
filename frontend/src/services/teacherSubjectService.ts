import axiosClient from './axiosClient';
import { toast } from 'react-toastify';

export type TeacherSubject = {
  id: number;
  teacher_id: number;
  subject_id: number;
  class_id?: number | null;
  lesson_period?: string | null;
  day_of_week?: string | null;
  period?: number | null;
  room?: string | null;
  semester?: number | null;
  school_year?: string | null;
  teacher?: {
    id: number;
    name: string;
  };
  subject?: {
    id: number;
    name: string;
    code: string;
  };
  class?: {
    id: number;
    name: string;
  };
};

export type TeacherSubjectCreateParams = {
  teacher_id: number;
  subject_id: number;
  class_id?: number | null;
  lesson_period?: string | null;
  day_of_week?: string | null;
  period?: number | null;
  room?: string | null;
  semester?: number;
  school_year?: string;
};

export type TeacherSubjectUpdateParams = {
  teacher_id?: number;
  subject_id?: number;
  class_id?: number | null;
  lesson_period?: string | null;
  day_of_week?: string | null;
  period?: number | null;
  room?: string | null;
  semester?: number;
  school_year?: string;
};

// Kiểu dữ liệu cho tiết học đã được phân tích
export type ParsedPeriod = {
  day: string;
  startPeriod: number;
  endPeriod: number;
};

const teacherSubjectService = {
  // Lấy tất cả phân công giảng dạy
  getAll: async (): Promise<TeacherSubject[]> => {
    try {
      const response = await axiosClient.get('/teacher-subjects');
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher subjects:', error);
      toast.error('Không thể tải danh sách phân công giảng dạy');
      return [];
    }
  },

  // Lấy thông tin chi tiết phân công
  getById: async (id: number): Promise<TeacherSubject | null> => {
    try {
      const response = await axiosClient.get(`/teacher-subjects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching teacher subject ${id}:`, error);
      toast.error('Không thể tải thông tin phân công');
      return null;
    }
  },

  // Lấy tất cả phân công giảng dạy của một giáo viên
  getByTeacherId: async (teacherId: number): Promise<TeacherSubject[]> => {
    try {
      const response = await axiosClient.get(`/teacher-subjects?teacher_id=${teacherId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(`Error fetching teacher subjects for teacher ${teacherId}:`, error);
      toast.error('Không thể tải danh sách phân công giảng dạy của giáo viên');
      return [];
    }
  },

  // Tạo phân công giảng dạy mới
  create: async (params: TeacherSubjectCreateParams): Promise<TeacherSubject | null> => {
    try {
      const response = await axiosClient.post('/teacher-subjects', params);
      toast.success('Đăng ký môn học cho lớp thành công');
      return response.data;
    } catch (error: any) {
      console.error('Error creating teacher subject:', error);
      
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((messages: any) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg: string) => toast.error(msg));
          }
        });
      } else {
        toast.error('Không thể đăng ký môn học cho lớp');
      }
      
      return null;
    }
  },

  // Cập nhật phân công giảng dạy
  update: async (id: number, params: TeacherSubjectUpdateParams): Promise<TeacherSubject | null> => {
    try {
      const response = await axiosClient.put(`/teacher-subjects/${id}`, params);
      toast.success('Cập nhật phân công giảng dạy thành công');
      return response.data;
    } catch (error: any) {
      console.error(`Error updating teacher subject ${id}:`, error);
      
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((messages: any) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg: string) => toast.error(msg));
          }
        });
      } else {
        toast.error('Không thể cập nhật phân công giảng dạy');
      }
      
      return null;
    }
  },

  // Xóa phân công giảng dạy
  delete: async (id: number): Promise<boolean> => {
    try {
      await axiosClient.delete(`/teacher-subjects/${id}`);
      toast.success('Xóa phân công giảng dạy thành công');
      return true;
    } catch (error: any) {
      console.error(`Error deleting teacher subject ${id}:`, error);
      toast.error('Không thể xóa phân công giảng dạy');
      return false;
    }
  },

  // Phân tích chuỗi lesson_period thành các đối tượng tiết học
  parseLessonPeriod: (lessonPeriod: string | null | undefined): ParsedPeriod[] => {
    if (!lessonPeriod) return [];
    
    const result: ParsedPeriod[] = [];
    const periodEntries = lessonPeriod.split(', ');
    
    periodEntries.forEach(entry => {
      // Trường hợp 1: Định dạng "Tiết 1-2 Thứ hai"
      let match = entry.match(/Tiết (\d+)-(\d+) (.*)/);
      
      // Trường hợp 2: Định dạng "Thứ hai:1-2" hoặc "Thứ 2:1-2"
      if (!match) {
        match = entry.match(/(.*):(\d+)-(\d+)/);
        if (match) {
          // Đảo vị trí để phù hợp với định dạng xử lý bên dưới
          match = [entry, match[2], match[3], match[1]];
        }
      }
      
      // Trường hợp 3: Định dạng "Thứ hai:1,2,3"
      if (!match) {
        match = entry.match(/(.*):(\d+)(,\d+)*/);
        if (match) {
          const day = match[1];
          const numbers = entry.split(':')[1].split(',').map(Number);
          if (numbers.length > 0) {
            // Sắp xếp các số
            numbers.sort((a, b) => a - b);
            
            // Tạo các phạm vi liên tiếp
            let start = numbers[0];
            let end = numbers[0];
            
            for (let i = 1; i < numbers.length; i++) {
              if (numbers[i] === end + 1) {
                end = numbers[i];
              } else {
                result.push({
                  day,
                  startPeriod: start,
                  endPeriod: end
                });
                
                start = numbers[i];
                end = numbers[i];
              }
            }
            
            result.push({
              day,
              startPeriod: start,
              endPeriod: end
            });
          }
        }
      }
      
      // Xử lý trường hợp đã tìm thấy mẫu trong trường hợp 1 hoặc 2
      if (match) {
        const startPeriod = parseInt(match[1]);
        const endPeriod = parseInt(match[2]);
        const day = match[3];
        
        result.push({
          day,
          startPeriod,
          endPeriod
        });
      }
    });
    
    return result;
  },

  // Kiểm tra xung đột tiết học
  checkPeriodConflicts: (
    teacherId: number, 
    newLessonPeriod: string, 
    currentAssignments: TeacherSubject[], 
    excludeAssignmentId?: number
  ): { hasConflict: boolean; conflicts: string[] } => {
    // Phân tích tiết học mới
    const newPeriods = teacherSubjectService.parseLessonPeriod(newLessonPeriod);
    
    // Nếu không có tiết học mới, không có xung đột
    if (newPeriods.length === 0) {
      return { hasConflict: false, conflicts: [] };
    }
    
    // Lọc các phân công của giáo viên này, ngoại trừ phân công đang được cập nhật
    const teacherAssignments = currentAssignments.filter(
      assignment => assignment.teacher_id === teacherId && 
                    assignment.id !== excludeAssignmentId && 
                    assignment.lesson_period
    );
    
    // Danh sách xung đột
    const conflicts: string[] = [];
    
    // Kiểm tra từng tiết học mới với các tiết học hiện có
    newPeriods.forEach(newPeriod => {
      teacherAssignments.forEach(assignment => {
        const existingPeriods = teacherSubjectService.parseLessonPeriod(assignment.lesson_period);
        
        existingPeriods.forEach(existingPeriod => {
          // Kiểm tra nếu cùng ngày
          if (newPeriod.day === existingPeriod.day) {
            // Kiểm tra xem có chồng chéo không
            const hasOverlap = 
              (newPeriod.startPeriod <= existingPeriod.endPeriod && 
               newPeriod.endPeriod >= existingPeriod.startPeriod);
            
            if (hasOverlap) {
              // Tạo thông báo xung đột
              const conflictMessage = `Xung đột: ${newPeriod.day} tiết ${newPeriod.startPeriod}-${newPeriod.endPeriod} với ${
                assignment.subject?.name || 'Môn học'
              } ${
                assignment.class?.name ? `(Lớp ${assignment.class.name})` : ''
              } tiết ${existingPeriod.startPeriod}-${existingPeriod.endPeriod}`;
              
              conflicts.push(conflictMessage);
            }
          }
        });
      });
    });
    
    return {
      hasConflict: conflicts.length > 0,
      conflicts
    };
  }
};

export default teacherSubjectService; 