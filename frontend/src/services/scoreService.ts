import axiosClient from './axiosClient';
import { toast } from 'react-toastify';

export type Score = {
  id: number;
  student_id: number;
  subject_id: number;
  teacher_id: number;
  class_id: number;
  score_value: number;
  score_type: string;
  semester: 1 | 2;
  school_year: string;
  created_at?: string;
  updated_at?: string;
  student?: {
    id: number;
    name: string;
    code: string;
  };
  subject?: {
    id: number;
    name: string;
    code: string;
  };
  teacher?: {
    id: number;
    name: string;
  };
  class?: {
    id: number;
    name: string;
  };
};

export type ScoreCreateParams = {
  student_id: number;
  subject_id: number;
  teacher_id: number;
  class_id: number;
  score_value: number;
  score_type: string;
  semester: 1 | 2;
  school_year: string;
  oral_test?: number | null;
  fifteen_minute_test?: number | null;
  forty_five_minute_test?: number | null;
  final_exam?: number | null;
};

export type ScoreUpdateParams = {
  student_id?: number;
  subject_id?: number;
  teacher_id?: number;
  class_id?: number;
  score_value?: number;
  score_type?: string;
  semester?: 1 | 2;
  school_year?: string;
  oral_test?: number | null;
  fifteen_minute_test?: number | null;
  forty_five_minute_test?: number | null;
  final_exam?: number | null;
};

export type ScoreFilter = {
  class_id?: number;
  subject_id?: number;
  teacher_id?: number;
  student_id?: number;
  semester?: number;
  school_year?: string;
  score_type?: string;
};

export type ScoreBulkCreateParams = {
  scores: ScoreCreateParams[];
};

// Lấy danh sách điểm theo bộ lọc
export const getScores = async (filters: any): Promise<Score[]> => {
  try {
    const response = await axiosClient.get('/scores', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching scores:', error);
    toast.error('Không thể tải danh sách điểm');
    return [];
  }
};

// Lấy thông tin chi tiết của một điểm
export const getScoreById = async (id: number): Promise<Score | null> => {
  try {
    const response = await axiosClient.get(`/scores/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching score ${id}:`, error);
    toast.error('Không thể tải thông tin điểm');
    return null;
  }
};

// Tạo điểm mới
export const createScore = async (params: ScoreCreateParams): Promise<Score | null> => {
  try {
    const response = await axiosClient.post('/scores', params);
    toast.success('Thêm điểm thành công');
    return response.data;
  } catch (error: any) {
    console.error('Error creating score:', error);
    
    if (error.response?.data?.errors) {
      Object.values(error.response.data.errors).forEach((messages: any) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg: string) => toast.error(msg));
        }
      });
    } else {
      toast.error('Không thể thêm điểm');
    }
    
    return null;
  }
};

// Cập nhật điểm
export const updateScore = async (id: number, params: ScoreUpdateParams): Promise<Score | null> => {
  try {
    const response = await axiosClient.put(`/scores/${id}`, params);
    toast.success('Cập nhật điểm thành công');
    return response.data;
  } catch (error: any) {
    console.error(`Error updating score ${id}:`, error);
    
    if (error.response?.data?.errors) {
      Object.values(error.response.data.errors).forEach((messages: any) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg: string) => toast.error(msg));
        }
      });
    } else {
      toast.error('Không thể cập nhật điểm');
    }
    
    return null;
  }
};

// Cập nhật điểm theo loại (miệng, 15p, 45p, cuối kỳ)
export const updateTypeScore = async (params: {
  student_id: number;
  subject_id: number;
  teacher_id: number;
  class_id: number;
  semester: 1 | 2;
  school_year: string;
  score_type: string;
  score_value: number;
}): Promise<Score | null> => {
  try {
    console.log('Gọi API cập nhật điểm theo loại:', params);
    const response = await axiosClient.post('/scores/update-type', params);
    toast.success('Cập nhật điểm thành công');
    return response.data;
  } catch (error: any) {
    console.error(`Error updating score by type:`, error);
    
    if (error.response?.data?.errors) {
      Object.values(error.response.data.errors).forEach((messages: any) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg: string) => toast.error(msg));
        }
      });
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('Không thể cập nhật điểm');
    }
    
    return null;
  }
};

// Xóa điểm
export const deleteScore = async (id: number): Promise<boolean> => {
  try {
    await axiosClient.delete(`/scores/${id}`);
    toast.success('Xóa điểm thành công');
    return true;
  } catch (error: any) {
    console.error(`Error deleting score ${id}:`, error);
    toast.error('Không thể xóa điểm');
    return false;
  }
};

// Tạo nhiều điểm cùng lúc
export const bulkCreateScores = async (params: ScoreBulkCreateParams): Promise<Score[] | null> => {
  try {
    const response = await axiosClient.post('/scores/bulk', params);
    toast.success('Thêm điểm hàng loạt thành công');
    return response.data;
  } catch (error: any) {
    console.error('Error bulk creating scores:', error);
    
    if (error.response?.data?.errors) {
      Object.values(error.response.data.errors).forEach((messages: any) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg: string) => toast.error(msg));
        }
      });
    } else {
      toast.error('Không thể thêm điểm hàng loạt');
    }
    
    return null;
  }
};

// Tính điểm trung bình
export const calculateAverageScore = async (filters: any): Promise<any> => {
  try {
    const response = await axiosClient.get('/scores/average', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error calculating average scores:', error);
    toast.error('Không thể tính điểm trung bình');
    return null;
  }
};

// Lấy các năm học trong hệ thống
export const getSchoolYears = async (): Promise<string[]> => {
  try {
    const response = await axiosClient.get('/scores/school-years');
    return response.data;
  } catch (error) {
    console.error('Error fetching school years:', error);
    toast.error('Không thể tải danh sách năm học');
    return [];
  }
};

// Lấy báo cáo điểm của một học sinh
export const getStudentReport = async (studentId: number, filters?: any): Promise<any> => {
  try {
    const response = await axiosClient.get(`/reports/student/${studentId}`, { params: filters });
    return response.data;
  } catch (error) {
    console.error(`Error fetching report for student ${studentId}:`, error);
    toast.error('Không thể tải báo cáo điểm của học sinh');
    return null;
  }
};

// Lấy báo cáo điểm của một lớp
export const getClassReport = async (classId: number, filters?: any): Promise<any> => {
  try {
    console.log('Gọi API với params:', { classId, filters });
    const response = await axiosClient.get(`/reports/class/${classId}`, { 
      params: filters,
      timeout: 30000 // Tăng timeout lên 30 giây
    });
    console.log('Kết quả API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching report for class ${classId}:`, error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      if (error.response.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response.data?.errors) {
        Object.values(error.response.data.errors).forEach((messages: any) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg: string) => toast.error(msg));
          }
        });
      } else {
        toast.error(`Lỗi ${error.response.status}: Không thể tải báo cáo điểm của lớp`);
      }
    } else if (error.request) {
      toast.error('Không nhận được phản hồi từ máy chủ. Vui lòng thử lại sau.');
    } else {
      toast.error('Không thể tải báo cáo điểm của lớp');
    }
    
    return null;
  }
};

// Lấy báo cáo điểm của một môn học
export const getSubjectReport = async (subjectId: number, filters?: any): Promise<any> => {
  try {
    const response = await axiosClient.get(`/reports/subject/${subjectId}`, { params: filters });
    return response.data;
  } catch (error) {
    console.error(`Error fetching report for subject ${subjectId}:`, error);
    toast.error('Không thể tải báo cáo điểm của môn học');
    return null;
  }
}; 