import axiosClient from './axiosClient';
import { toast } from 'react-toastify';

export type Teacher = {
  id: number;
  name: string;
  specialization: string;
  is_gvcn: boolean;
  user_id: number;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    username?: string;
    phone?: string;
    address?: string;
    birthday?: string;
    sex?: 'MALE' | 'FEMALE';
    profile_photo?: string;
  };
  subjects?: number[] | string[];
  classes?: string[];
};

export type TeacherCreateParams = {
  name: string;
  specialization: string;
  is_gvcn: boolean;
  user_id: number;
  // Thông tin user nếu cần tạo mới user
  user?: {
    name: string;
    email: string;
    password: string;
    username?: string;
    phone?: string;
    address?: string;
    birthday?: string;
    sex?: 'MALE' | 'FEMALE';
    profile_photo?: string;
  };
};

export type TeacherUpdateParams = {
  name?: string;
  specialization?: string;
  is_gvcn?: boolean;
  user_id?: number;
  // Thông tin user nếu cần cập nhật user
  user?: {
    name?: string;
    email?: string;
    username?: string;
    phone?: string;
    address?: string;
    birthday?: string;
    sex?: 'MALE' | 'FEMALE';
    profile_photo?: string;
  };
};

// Chuyển đổi dữ liệu từ backend sang định dạng frontend
const transformTeacherData = (teacher: any): Teacher => {
  return {
    id: teacher.id,
    name: teacher.name,
    specialization: teacher.specialization,
    is_gvcn: teacher.is_gvcn,
    user_id: teacher.user_id,
    created_at: teacher.created_at,
    updated_at: teacher.updated_at,
    user: teacher.user,
    // Các trường bổ sung có thể được thêm sau
    subjects: teacher.subjects || [],
    classes: teacher.classes || []
  };
};

// Lấy danh sách tất cả giáo viên
export const getAllTeachers = async (): Promise<Teacher[]> => {
  try {
    const response = await axiosClient.get('/teachers');
    const teachers = response.data.map(transformTeacherData);
    return teachers;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    toast.error('Không thể tải danh sách giáo viên');
    return [];
  }
};

// Lấy thông tin chi tiết một giáo viên
export const getTeacherById = async (id: number): Promise<Teacher | null> => {
  try {
    const response = await axiosClient.get(`/teachers/${id}`);
    return transformTeacherData(response.data);
  } catch (error) {
    console.error(`Error fetching teacher ${id}:`, error);
    toast.error('Không thể tải thông tin giáo viên');
    return null;
  }
};

// Tạo giáo viên mới
export const createTeacher = async (params: TeacherCreateParams): Promise<Teacher | null> => {
  try {
    const response = await axiosClient.post('/teachers', params);
    toast.success('Thêm giáo viên thành công');
    return transformTeacherData(response.data);
  } catch (error: any) {
    console.error('Error creating teacher:', error);
    
    // Xử lý lỗi chi tiết từ backend
    if (error.response && error.response.data) {
      if (error.response.data.errors) {
        // Hiển thị tất cả các lỗi validation
        const errorMessages: string[] = Object.values(error.response.data.errors).flat() as string[];
        errorMessages.forEach((msg: string) => toast.error(msg));
      } else if (error.response.data.message) {
        // Hiển thị thông báo lỗi từ server
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể thêm giáo viên');
      }
    } else {
      toast.error('Không thể thêm giáo viên');
    }
    
    return null;
  }
};

// Cập nhật thông tin giáo viên
export const updateTeacher = async (id: number, params: TeacherUpdateParams): Promise<Teacher | null> => {
  try {
    const response = await axiosClient.put(`/teachers/${id}`, params);
    toast.success('Cập nhật giáo viên thành công');
    return transformTeacherData(response.data);
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Không thể cập nhật giáo viên';
    toast.error(errorMessage);
    console.error(`Error updating teacher ${id}:`, error);
    return null;
  }
};

// Xóa một giáo viên
export const deleteTeacher = async (id: number): Promise<{success: boolean; message?: string}> => {
  try {
    await axiosClient.delete(`/teachers/${id}`);
    toast.success('Xóa giáo viên thành công');
    return {
      success: true,
      message: "Xóa giáo viên thành công"
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Không thể xóa giáo viên';
    toast.error(errorMessage);
    console.error(`Error deleting teacher ${id}:`, error);
    return {
      success: false,
      message: errorMessage
    };
  }
};

// Lấy danh sách lớp học của giáo viên
export const getTeacherClasses = async (teacherId: number): Promise<any[]> => {
  try {
    const response = await axiosClient.get(`/teachers/${teacherId}/classes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching classes for teacher ${teacherId}:`, error);
    toast.error('Không thể tải danh sách lớp học');
    return [];
  }
};

// Lấy danh sách môn học của giáo viên
export const getTeacherSubjects = async (teacherId: number): Promise<any[]> => {
  try {
    const response = await axiosClient.get(`/teachers/${teacherId}/subjects`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subjects for teacher ${teacherId}:`, error);
    toast.error('Không thể tải danh sách môn học');
    return [];
  }
};

// Lấy thời khóa biểu của giáo viên
export const getTeacherSchedule = async (teacherId: number): Promise<any[]> => {
  try {
    const response = await axiosClient.get(`/teachers/${teacherId}/schedule`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching schedule for teacher ${teacherId}:`, error);
    toast.error('Không thể tải thời khóa biểu');
    return [];
  }
}; 