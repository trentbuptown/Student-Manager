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
  semester: number;
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
  semester: number;
  school_year: string;
};

export type ScoreUpdateParams = {
  student_id?: number;
  subject_id?: number;
  teacher_id?: number;
  class_id?: number;
  score_value?: number;
  score_type?: string;
  semester?: number;
  school_year?: string;
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

const scoreService = {
  // Lấy tất cả điểm với bộ lọc tùy chọn
  getAll: async (filters?: ScoreFilter): Promise<Score[]> => {
    try {
      let url = '/scores';
      
      // Thêm các tham số lọc nếu có
      if (filters) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
      
      const response = await axiosClient.get(url);
      
      // Đảm bảo dữ liệu trả về là mảng hợp lệ
      if (response && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching scores:', error);
      if (error.response?.status === 404) {
        // Nếu endpoint chưa tồn tại, trả về mảng rỗng thay vì thông báo lỗi
        console.warn('Scores API endpoint may not be implemented yet');
      } else {
        toast.error('Không thể tải danh sách điểm');
      }
      return [];
    }
  },

  // Lấy thông tin chi tiết điểm
  getById: async (id: number): Promise<Score | null> => {
    try {
      const response = await axiosClient.get(`/scores/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching score ${id}:`, error);
      toast.error('Không thể tải thông tin điểm');
      return null;
    }
  },

  // Lấy điểm của một học sinh
  getByStudentId: async (studentId: number, filters?: ScoreFilter): Promise<Score[]> => {
    try {
      let url = `/scores?student_id=${studentId}`;
      
      // Thêm các tham số lọc nếu có
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '' && key !== 'student_id') {
            url += `&${key}=${value}`;
          }
        });
      }
      
      const response = await axiosClient.get(url);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(`Error fetching scores for student ${studentId}:`, error);
      toast.error('Không thể tải danh sách điểm của học sinh');
      return [];
    }
  },

  // Tạo điểm mới
  create: async (params: ScoreCreateParams): Promise<Score | null> => {
    try {
      const response = await axiosClient.post('/scores', params);
      toast.success('Thêm điểm thành công');
      return response.data;
    } catch (error: any) {
      console.error('Error creating score:', error);
      
      if (error.response?.status === 404) {
        // Nếu endpoint chưa tồn tại, hiển thị thông báo phù hợp
        toast.warning('Chức năng thêm điểm đang trong quá trình phát triển');
        console.warn('Scores API endpoint may not be implemented yet');
        
        // Trả về một đối tượng Score giả lập để UI không bị lỗi
        return {
          id: Math.floor(Math.random() * 1000) + 1, // ID ngẫu nhiên
          ...params,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } else if (error.response?.data?.errors) {
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
  },

  // Cập nhật điểm
  update: async (id: number, params: ScoreUpdateParams): Promise<Score | null> => {
    try {
      const response = await axiosClient.put(`/scores/${id}`, params);
      toast.success('Cập nhật điểm thành công');
      return response.data;
    } catch (error: any) {
      console.error(`Error updating score ${id}:`, error);
      
      if (error.response?.status === 404) {
        // Nếu endpoint chưa tồn tại, hiển thị thông báo phù hợp
        toast.warning('Chức năng cập nhật điểm đang trong quá trình phát triển');
        console.warn('Scores API endpoint may not be implemented yet');
        
        // Trả về một đối tượng Score giả lập đã cập nhật để UI không bị lỗi
        return {
          id,
          student_id: params.student_id || 0,
          subject_id: params.subject_id || 0,
          teacher_id: params.teacher_id || 0,
          class_id: params.class_id || 0,
          score_value: params.score_value || 0,
          score_type: params.score_type || '',
          semester: params.semester || 1,
          school_year: params.school_year || '',
          updated_at: new Date().toISOString()
        };
      } else if (error.response?.data?.errors) {
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
  },

  // Xóa điểm
  delete: async (id: number): Promise<boolean> => {
    try {
      await axiosClient.delete(`/scores/${id}`);
      toast.success('Xóa điểm thành công');
      return true;
    } catch (error: any) {
      console.error(`Error deleting score ${id}:`, error);
      
      if (error.response?.status === 404) {
        // Nếu endpoint chưa tồn tại, hiển thị thông báo phù hợp
        toast.warning('Chức năng xóa điểm đang trong quá trình phát triển');
        console.warn('Scores API endpoint may not be implemented yet');
        
        // Giả lập thành công để UI có thể cập nhật
        return true;
      }
      
      toast.error('Không thể xóa điểm');
      return false;
    }
  },

  // Nhập điểm hàng loạt
  bulkCreate: async (scores: ScoreCreateParams[]): Promise<boolean> => {
    try {
      await axiosClient.post('/scores/bulk', { scores });
      toast.success('Nhập điểm hàng loạt thành công');
      return true;
    } catch (error: any) {
      console.error('Error bulk creating scores:', error);
      
      if (error.response?.status === 404) {
        // Nếu endpoint chưa tồn tại, hiển thị thông báo phù hợp
        toast.warning('Chức năng nhập điểm hàng loạt đang trong quá trình phát triển');
        console.warn('Bulk scores API endpoint may not be implemented yet');
        
        // Giả lập thành công để UI có thể cập nhật
        return true;
      }
      
      toast.error('Không thể nhập điểm hàng loạt');
      return false;
    }
  },

  // Lấy các năm học có sẵn
  getSchoolYears: async (): Promise<string[]> => {
    // Tạo danh sách năm học mặc định
    const currentYear = new Date().getFullYear();
    const defaultYears: string[] = [];
    for (let i = 0; i < 5; i++) {
      defaultYears.push(`${currentYear - i - 1}-${currentYear - i}`);
    }
    
    try {
      // Bọc trong try-catch và bỏ qua mọi lỗi
      const response = await axiosClient.get('/scores/school-years');
      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      // Trả về danh sách mặc định nếu dữ liệu không hợp lệ
      return defaultYears;
    } catch (error) {
      console.warn('API endpoint /scores/school-years not available, using default years:', error);
      // Luôn trả về danh sách mặc định khi có lỗi
      return defaultYears;
    }
  },

  // Tính điểm trung bình cho một học sinh theo môn học
  calculateAverage: async (studentId: number, subjectId: number, semester: number, schoolYear: string): Promise<number | null> => {
    try {
      const response = await axiosClient.get(`/scores/average?student_id=${studentId}&subject_id=${subjectId}&semester=${semester}&school_year=${schoolYear}`);
      return response.data.average;
    } catch (error: any) {
      console.error('Error calculating average score:', error);
      
      if (error.response?.status === 404) {
        // Nếu endpoint chưa tồn tại, hiển thị thông báo phù hợp trong console nhưng không hiển thị cho người dùng
        console.warn('Average score API endpoint may not be implemented yet');
        
        // Trả về giá trị mặc định để UI không bị lỗi
        return 0;
      }
      
      return null;
    }
  }
};

export default scoreService; 