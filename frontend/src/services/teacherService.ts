import axiosClient from './axiosClient';
import { toast } from 'react-toastify';

export type Teacher = {
  id: number;
  name: string;
  specialization: string;
  is_gvcn: boolean;
  user_id: number;
  phone?: string;
  address?: string;
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
  phone?: string;
  address?: string;
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
  phone?: string;
  address?: string;
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
    phone: teacher.phone,
    address: teacher.address,
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
    // Log dữ liệu gửi đi để debug
    console.log('Dữ liệu gửi đi:', JSON.stringify(params));
    
    const response = await axiosClient.post('/teachers', params);
    toast.success('Thêm giáo viên thành công');
    return transformTeacherData(response.data);
  } catch (error: any) {
    console.error('Error creating teacher:', error);
    
    // Xử lý lỗi chi tiết từ backend
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
      
      if (error.response.status === 422) {
        console.log('Validation errors:', error.response.data.errors);
        
        if (error.response.data.errors) {
          // Hiển thị tất cả các lỗi validation
          Object.entries(error.response.data.errors).forEach(([field, messages]) => {
            console.log(`Field ${field}:`, messages);
            (messages as string[]).forEach((msg: string) => {
              toast.error(`${field}: ${msg}`);
            });
          });
        } else if (error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường bắt buộc.');
        }
      } else {
        // Xử lý các lỗi khác
        if (error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(`Lỗi ${error.response.status}: Không thể thêm giáo viên`);
        }
      }
    } else if (error.request) {
      // Yêu cầu đã được gửi nhưng không nhận được phản hồi
      console.log('No response received:', error.request);
      toast.error('Không nhận được phản hồi từ máy chủ. Vui lòng thử lại sau.');
    } else {
      // Lỗi khi thiết lập request
      console.log('Error setting up request:', error.message);
      toast.error('Lỗi kết nối: ' + error.message);
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
export const getTeacherClasses = async (teacherId: number): Promise<any> => {
  try {
    const response = await axiosClient.get(`/teachers/${teacherId}/classes`);
    console.log('API response from /teachers/' + teacherId + '/classes:', response.data);
    
    // Xử lý trường hợp response có cấu trúc { status: 'success', data: [] }
    if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
      return response.data;
    }
    
    return response.data; // Trả về dữ liệu gốc nếu không phù hợp với cấu trúc trên
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

// Lấy danh sách tất cả học sinh của giáo viên
export const getTeacherStudents = async (teacherId: number): Promise<any[]> => {
  try {
    const response = await axiosClient.get(`/teachers/${teacherId}/students`);
    console.log('API response for teacher students:', response);
    
    if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Error fetching students for teacher ${teacherId}:`, error);
    toast.error('Không thể tải danh sách học sinh');
    return [];
  }
};

// Lấy danh sách học sinh của một lớp cụ thể
export const getTeacherClassStudents = async (teacherId: number, classId: number): Promise<any[]> => {
  try {
    const response = await axiosClient.get(`/teachers/${teacherId}/classes/${classId}/students`);
    console.log('API response for class students:', response);
    
    if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Error fetching students for class ${classId}:`, error);
    toast.error('Không thể tải danh sách học sinh của lớp');
    return [];
  }
}; 