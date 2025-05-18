import axiosClient from './axiosClient';
import axios from 'axios';

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