import axiosClient from './axiosClient';
import { toast } from 'react-toastify';

export interface StudentGrade {
  id?: number;
  student_id: number;
  subject_id: number;
  subject_name: string;
  semester: 1 | 2;
  school_year: string;
  oral_test?: number | null;
  fifteen_minute_test?: number | null;
  forty_five_minute_test?: number | null;
  final_exam?: number | null;
  average_score?: number | null;
}

export interface StudentGradeFilter {
  student_id?: number;
  subject_id?: number;
  semester?: 1 | 2;
  school_year?: string;
}

// Lấy danh sách điểm của học sinh
export const getStudentGrades = async (studentId: number, filters?: StudentGradeFilter): Promise<StudentGrade[]> => {
  try {
    console.log(`Đang tải điểm số cho học sinh ID: ${studentId}`);
    const response = await axiosClient.get(`/students/${studentId}/grades`, { params: filters });
    
    if (response && response.data) {
      console.log(`Nhận được dữ liệu điểm số từ API: ${response.data.length} mục`);
      return response.data;
    } else {
      console.warn('API trả về dữ liệu rỗng');
      return [];
    }
  } catch (error) {
    console.error(`Lỗi khi tải điểm số cho học sinh ${studentId}:`, error);
    toast.error('Không thể tải điểm số, vui lòng thử lại sau');
    return [];
  }
};

// Lấy điểm trung bình của học sinh
export const getStudentAverageGrade = async (
  studentId: number, 
  semester?: number, 
  schoolYear?: string
): Promise<number> => {
  try {
    console.log(`Đang tải điểm trung bình cho học sinh ID: ${studentId}`);
    const response = await axiosClient.get(`/students/${studentId}/average-grade`, { 
      params: { 
        semester: semester,
        school_year: schoolYear 
      } 
    });
    
    if (response && response.data && response.data.average_score !== undefined) {
      console.log(`Nhận được điểm trung bình từ API: ${response.data.average_score}`);
      return response.data.average_score;
    } else {
      console.warn('API trả về dữ liệu không hợp lệ');
      return 0;
    }
  } catch (error) {
    console.error(`Lỗi khi tải điểm trung bình cho học sinh ${studentId}:`, error);
    toast.error('Không thể tải điểm trung bình, vui lòng thử lại sau');
    return 0;
  }
};

// Lấy hạng của học sinh trong lớp
export const getStudentRank = async (
  studentId: number, 
  classId: number,
  semester?: number, 
  schoolYear?: string
): Promise<{rank: number, total: number}> => {
  try {
    console.log(`Đang tải thứ hạng cho học sinh ID: ${studentId} trong lớp ID: ${classId}`);
    const response = await axiosClient.get(`/students/${studentId}/rank`, { 
      params: { 
        class_id: classId,
        semester: semester,
        school_year: schoolYear 
      } 
    });
    
    if (response && response.data && response.data.rank !== undefined && response.data.total !== undefined) {
      console.log(`Nhận được thứ hạng từ API: ${response.data.rank}/${response.data.total}`);
      return {
        rank: response.data.rank,
        total: response.data.total
      };
    } else {
      console.warn('API trả về dữ liệu không hợp lệ');
      return {rank: 0, total: 0};
    }
  } catch (error) {
    console.error(`Lỗi khi tải thứ hạng cho học sinh ${studentId}:`, error);
    toast.error('Không thể tải thứ hạng, vui lòng thử lại sau');
    return {rank: 0, total: 0};
  }
};

// Dữ liệu mẫu tạm thời khi API chưa sẵn sàng - giữ lại để tham khảo
const getTemporaryGrades = (studentId: number): StudentGrade[] => {
  return [
    {
      student_id: studentId,
      subject_id: 1,
      subject_name: 'Toán học',
      semester: 1,
      school_year: '2023-2024',
      oral_test: 8,
      fifteen_minute_test: 9,
      forty_five_minute_test: 8.5,
      final_exam: 8,
      average_score: 8.3
    },
    {
      student_id: studentId,
      subject_id: 2,
      subject_name: 'Vật lý',
      semester: 1,
      school_year: '2023-2024',
      oral_test: 7,
      fifteen_minute_test: 8,
      forty_five_minute_test: 8,
      final_exam: 7.5,
      average_score: 7.7
    },
    {
      student_id: studentId,
      subject_id: 3,
      subject_name: 'Hóa học',
      semester: 1,
      school_year: '2023-2024',
      oral_test: 9,
      fifteen_minute_test: 8.5,
      forty_five_minute_test: 9,
      final_exam: 8.5,
      average_score: 8.8
    },
    {
      student_id: studentId,
      subject_id: 4,
      subject_name: 'Sinh học',
      semester: 1,
      school_year: '2023-2024',
      oral_test: 9,
      fifteen_minute_test: 9,
      forty_five_minute_test: 8,
      final_exam: 9,
      average_score: 8.8
    },
    {
      student_id: studentId,
      subject_id: 5,
      subject_name: 'Ngữ văn',
      semester: 1,
      school_year: '2023-2024',
      oral_test: 8,
      fifteen_minute_test: 7.5,
      forty_five_minute_test: 8,
      final_exam: 8,
      average_score: 8.0
    },
    {
      student_id: studentId,
      subject_id: 6,
      subject_name: 'Lịch sử',
      semester: 1,
      school_year: '2023-2024',
      oral_test: 9,
      fifteen_minute_test: 9,
      forty_five_minute_test: 8.5,
      final_exam: 9,
      average_score: 8.9
    },
    {
      student_id: studentId,
      subject_id: 7,
      subject_name: 'Địa lý',
      semester: 1,
      school_year: '2023-2024',
      oral_test: 8,
      fifteen_minute_test: 8,
      forty_five_minute_test: 7.5,
      final_exam: 8,
      average_score: 7.9
    },
    {
      student_id: studentId,
      subject_id: 8,
      subject_name: 'Tiếng Anh',
      semester: 1,
      school_year: '2023-2024',
      oral_test: 9,
      fifteen_minute_test: 9.5,
      forty_five_minute_test: 9,
      final_exam: 9,
      average_score: 9.1
    },
    {
      student_id: studentId,
      subject_id: 9,
      subject_name: 'GDCD',
      semester: 1,
      school_year: '2023-2024',
      oral_test: 10,
      fifteen_minute_test: 9,
      forty_five_minute_test: 9,
      final_exam: 9,
      average_score: 9.2
    },
    {
      student_id: studentId,
      subject_id: 10,
      subject_name: 'Tin học',
      semester: 1,
      school_year: '2023-2024',
      oral_test: 10,
      fifteen_minute_test: 10,
      forty_five_minute_test: 9,
      final_exam: 9,
      average_score: 9.4
    },
    {
      student_id: studentId,
      subject_id: 11,
      subject_name: 'Thể dục',
      semester: 1,
      school_year: '2023-2024',
      oral_test: 10,
      fifteen_minute_test: 10,
      forty_five_minute_test: 10,
      final_exam: 10,
      average_score: 10
    }
  ];
}; 