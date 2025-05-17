import axiosClient from './axiosClient';

export interface Teacher {
    id: number | string; // Assuming teacher id can be number or string
    name: string;
    // Add other teacher properties if needed for display or processing
    // email?: string;
    // phone?: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  subjectId?: string; // Giữ lại theo schema frontend cũ nếu cần
  teachers?: Teacher[]; // Update to array of Teacher interface
}

export interface SingleSubjectResponse {
  data: Subject;
  message?: string;
}

const subjectService = {
  // Lấy danh sách môn học
  getAll: async (): Promise<Subject[]> => {
    const response = await axiosClient.get('/subjects');
    return response.data;
  },

  // Lấy thông tin một môn học
  getById: async (id: number): Promise<SingleSubjectResponse> => {
    const response = await axiosClient.get(`/subjects/${id}`);
    return response.data;
  },

  // Thêm môn học mới
  create: async (subject: Omit<Subject, 'id'>): Promise<SingleSubjectResponse> => {
    const response = await axiosClient.post('/subjects', subject);
    return response.data;
  },

  // Cập nhật môn học
  update: async (id: number, subject: Partial<Subject>): Promise<SingleSubjectResponse> => {
    const response = await axiosClient.put(`/subjects/${id}`, subject);
    return response.data;
  },

  // Xóa môn học
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await axiosClient.delete(`/subjects/${id}`);
    return response.data;
  },
};

export default subjectService; 