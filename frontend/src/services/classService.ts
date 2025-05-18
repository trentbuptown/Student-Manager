import { toast } from "react-toastify";
import axios from "axios";
import axiosClient from "./axiosClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Tạo instance axios với config mặc định
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export type Class = {
    id: number;
    name: string;
    grade_id: number;
    teacher_id?: number | null;
    supervisor?: string;
    capacity: number;
    grade?: {
        id: number;
        name: string;
    };
    teacher?: {
        id: number;
        name: string;
    };
    students?: any[];
    _count?: {
        students?: number;
    };
};

export type ClassCreateParams = {
    name: string;
    capacity?: number;
    grade_id: number;
    teacher_id?: number | null;
};

export type ClassUpdateParams = {
    name?: string;
    capacity?: number;
    grade_id?: number;
    teacher_id?: number | null;
};

// Lấy danh sách tất cả lớp học
export const getClasses = async (): Promise<Class[]> => {
    try {
        const response = await axiosInstance.get('/classes');
        console.log("Classes API response:", response.data);
        
        // Đảm bảo trả về mảng
        if (Array.isArray(response.data)) {
            return response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        } else {
            console.error("Classes API did not return an array:", response.data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("Không thể tải danh sách lớp học");
        return [];
    }
};

// Lấy thông tin chi tiết một lớp học
export const getClassById = async (id: number): Promise<Class> => {
    try {
        const response = await axiosInstance.get(`/classes/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching class ${id}:`, error);
        throw error;
    }
};

// Tạo lớp học mới
export const createClass = async (data: Omit<ClassCreateParams, "">): Promise<Class> => {
    try {
        // Thêm capacity mặc định là 0 nếu không được cung cấp
        const dataToSubmit = {
            ...data,
            capacity: data.capacity || 0
        };
        
        const response = await axiosInstance.post('/classes', dataToSubmit);
        return response.data;
    } catch (error) {
        console.error("Error creating class:", error);
        throw error;
    }
};

// Cập nhật thông tin lớp học
export const updateClass = async (id: number, data: Partial<ClassUpdateParams>): Promise<Class> => {
    try {
        const response = await axiosInstance.put(`/classes/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating class ${id}:`, error);
        throw error;
    }
};

// Xóa một lớp học
export const deleteClass = async (id: number): Promise<void> => {
    try {
        console.log(`Bắt đầu xóa lớp học ID: ${id}`);
        
        // Kiểm tra id trước khi gửi request
        if (!id || isNaN(id)) {
            throw new Error('ID lớp học không hợp lệ');
        }
        
        // Sử dụng axiosClient thay vì axios trực tiếp
        await axiosClient.delete(`/classes/${id}`);
        console.log(`Xóa lớp học thành công, ID: ${id}`);
        
        // Tải lại trang sau khi xóa thành công để cập nhật dữ liệu
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error: any) {
        console.error(`Error deleting class ${id}:`, error);
        
        // Xử lý lỗi chi tiết
        if (error.response) {
            // Log thông tin lỗi chi tiết
            console.error('Error response details:', {
                status: error.response.status,
                data: error.response.data || {},
                message: error.response.data?.message || error.message,
                url: error.config?.url
            });
            
            // Xử lý các loại lỗi cụ thể
            if (error.response.status === 422) {
                // Lỗi validation - Thường xảy ra khi lớp có học sinh
                const errorMessage = error.response.data?.message || 'Không thể xóa lớp học này vì đang có học sinh trong lớp';
                throw new Error(errorMessage);
            } else if (error.response.status === 404) {
                // Lỗi not found - Lớp học không tồn tại hoặc đã bị xóa
                console.error('Lớp học không tồn tại hoặc đã bị xóa');
                toast.error('Lớp học không tồn tại hoặc đã bị xóa');
                
                // Vẫn tải lại trang sau khi gặp lỗi 404
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                return; // Không throw error để không cản trở quá trình làm mới
            } else if (error.response.status === 401) {
                // Lỗi unauthorized - Không có quyền xóa
                throw new Error('Bạn không có quyền xóa lớp học này');
            }
        }
        
        // Nếu là lỗi khác, ném lỗi gốc
        throw error;
    }
};
