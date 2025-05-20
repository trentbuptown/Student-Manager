import axiosClient from './axiosClient';
import axios from 'axios';
import { toast } from 'react-toastify';

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
  code?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  subjectId?: string; // Giữ lại theo schema frontend cũ nếu cần
  teachers?: Teacher[]; // Update to array of Teacher interface
}

export interface StudentSubject {
  id: number;
  name: string;
  teacher: string;
  teacher_id?: number;
  lesson_period?: number;
  lessons_per_week: number;
  description?: string;
  semester?: number;
  school_year?: string;
}

export interface SingleSubjectResponse {
  data: Subject;
  message?: string;
}

// Lấy danh sách môn học của học sinh
export const getStudentSubjects = async (studentId: number, semester?: number, schoolYear?: string): Promise<StudentSubject[]> => {
  try {
    console.log(`Đang lấy danh sách môn học của học sinh ID: ${studentId}`);
    console.log(`Học kỳ: ${semester}, Năm học: ${schoolYear}`);
    
    // Tạo query params
    const params: any = {};
    if (semester) params.semester = semester;
    if (schoolYear) params.school_year = schoolYear;
    
    console.log('Request URL:', `/students/${studentId}/subjects`);
    console.log('Request params:', params);
    
    const response = await axiosClient.get(`/students/${studentId}/subjects`, { params });
    
    console.log('Phản hồi từ API - status:', response.status);
    console.log('Phản hồi từ API - headers:', response.headers);
    console.log('Phản hồi từ API - data:', JSON.stringify(response.data, null, 2));
    
    // Kiểm tra nếu API trả về lỗi
    if (response.data && response.data.error) {
      console.warn('API trả về lỗi:', response.data.error);
      toast.error(response.data.error);
      return [];
    }
    
    // Nếu API trả về dữ liệu
    if (response.data && Array.isArray(response.data)) {
      console.log('Số lượng môn học nhận được:', response.data.length);
      
      // Thêm thông tin semester và school_year vào mỗi môn học nếu chưa có
      const subjectsWithSemesterInfo = response.data.map(subject => ({
        ...subject,
        semester: subject.semester || semester || 1,
        school_year: subject.school_year || schoolYear || '2023-2024'
      }));
      
      return subjectsWithSemesterInfo;
    }
    
    // Nếu không có dữ liệu, trả về mảng rỗng
    console.warn('API không trả về dữ liệu môn học nào.');
    toast.warning('Không tìm thấy dữ liệu môn học');
    return [];
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách môn học của học sinh ${studentId}:`, error);
    
    // Log chi tiết lỗi
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      console.error('Request config:', error.config);
    }
    
    toast.error('Không thể tải danh sách môn học');
    
    // Trả về mảng rỗng khi có lỗi
    return [];
  }
};

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
    console.log(`======= UPDATING SUBJECT ID ${id} =======`);
    console.log(`Request data:`, subject);
    
    try {
      // Debug the request URL
      const url = `/subjects/${id}`;
      console.log(`Making PUT request to: ${url}`);
      
      // Làm rõ thông tin teachers trước khi gửi request
      if (subject.teachers) {
        console.log(`Teachers to update:`, subject.teachers);
      }
      
      const response = await axiosClient.put(url, subject);
      console.log('Update successful! Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('🚨 Error updating subject!', error);
      
      // Log thêm thông tin lỗi
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        console.error('Request config:', error.config);
      }
      
      throw error;
    }
  },

  // Xóa môn học
  delete: async (id: number): Promise<{ message: string }> => {
    console.log(`======= DELETING SUBJECT ID ${id} =======`);
    
    try {
      // Debug the request URL
      const url = `/subjects/${id}`;
      console.log(`Making DELETE request to: ${url}`);
      
      const response = await axiosClient.delete(url);
      console.log('Delete successful! Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('🚨 Error deleting subject!', error);
      
      // Log thêm thông tin lỗi
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        console.error('Request config:', error.config);
      }
      
      throw error;
    }
  },
};

export default subjectService; 