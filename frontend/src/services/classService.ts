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

export interface ClassInfo {
    id: number;
    name: string;
    grade_id: number;
    grade?: {
        id: number;
        name: string;
    };
    teacher_id?: number;
    teacher?: {
        id: number;
        name: string;
    };
    students_count?: number;
    school_year?: string;
}

export interface ClassStudent {
    id: number;
    name: string;
    gender: string;
    birth_date: string;
    phone?: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    class_id: number;
    class_position?: string;
}

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

// Lấy thông tin chi tiết lớp học
export const getClassDetail = async (classId: number): Promise<ClassInfo> => {
    try {
        const response = await axiosClient.get(`/classes/${classId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin lớp học ID ${classId}:`, error);
        toast.error('Không thể tải thông tin lớp học');
        throw error;
    }
};

// Lấy danh sách học sinh trong lớp
export const getClassStudents = async (classId: number): Promise<ClassStudent[]> => {
    try {
        const response = await axiosClient.get(`/classes/${classId}/students`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy danh sách học sinh của lớp ID ${classId}:`, error);
        toast.error('Không thể tải danh sách học sinh');
        throw error;
    }
};

// Lấy thông tin lớp học của học sinh hiện tại
export const getStudentClass = async (studentId: number): Promise<ClassInfo> => {
    try {
        console.log(`Đang lấy thông tin học sinh ID: ${studentId}`);
        const response = await axiosClient.get(`/students/${studentId}`);
        console.log('Phản hồi từ API students:', response.data);
        
        // Kiểm tra class_id trong cả data và data.class
        let classId = null;
        if (response.data?.class_id) {
            classId = response.data.class_id;
        } else if (response.data?.class?.id) {
            classId = response.data.class.id;
        }
        
        if (!classId) {
            console.warn('Không tìm thấy class_id trong dữ liệu học sinh');
            
            // Trả về dữ liệu mẫu
            return {
                id: 1,
                name: '11A1', 
                grade_id: 11,
                grade: {
                    id: 11,
                    name: 'Khối 11'
                },
                teacher_id: 1,
                teacher: {
                    id: 1,
                    name: 'Nguyễn Văn A'
                },
                students_count: 2,
                school_year: '2023-2024'
            };
        }
        
        console.log(`Lấy thông tin lớp học ID: ${classId}`);
        
        // Lấy thông tin chi tiết về lớp học
        return getClassDetail(classId);
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin lớp học của học sinh ID ${studentId}:`, error);
        toast.error('Không thể tải thông tin lớp học');
        
        // Trả về dữ liệu mẫu khi có lỗi
        return {
            id: 1,
            name: '11A1', 
            grade_id: 11,
            grade: {
                id: 11,
                name: 'Khối 11'
            },
            teacher_id: 1,
            teacher: {
                id: 1,
                name: 'Nguyễn Văn A'
            },
            students_count: 2,
            school_year: '2023-2024'
        };
    }
};

// Lấy danh sách các học sinh cùng lớp với học sinh hiện tại
export const getClassmatesOfStudent = async (studentId: number): Promise<ClassStudent[]> => {
    try {
        console.log(`Đang lấy thông tin học sinh ID: ${studentId}`);
        // Đầu tiên, lấy thông tin học sinh để biết lớp của học sinh
        const studentResponse = await axiosClient.get(`/students/${studentId}`);
        console.log('Phản hồi từ API students:', studentResponse.data);
        
        // Kiểm tra class_id trong cả data và data.class
        let classId = null;
        if (studentResponse.data?.class_id) {
            classId = studentResponse.data.class_id;
        } else if (studentResponse.data?.class?.id) {
            classId = studentResponse.data.class.id;
        }
        
        if (!classId) {
            console.warn('Không tìm thấy class_id trong dữ liệu học sinh');
            
            // Trả về dữ liệu mẫu
            return Array(2).fill(0).map((_, i) => ({
                id: i + 1,
                name: `Học sinh ${i + 1}`,
                gender: i % 2 === 0 ? 'male' : 'female',
                birth_date: '2005-01-01',
                phone: '0987654321',
                user: {
                    id: i + 100,
                    name: `Học sinh ${i + 1}`,
                    email: `student${i + 1}@example.com`
                },
                class_id: 1,
                class_position: i === 0 ? 'Lớp trưởng' : ''
            }));
        }
        
        console.log(`Lấy danh sách học sinh trong lớp ID: ${classId}`);
        
        // Sau đó, lấy danh sách học sinh trong lớp đó
        return getClassStudents(classId);
    } catch (error) {
        console.error(`Lỗi khi lấy danh sách học sinh cùng lớp với học sinh ID ${studentId}:`, error);
        toast.error('Không thể tải danh sách học sinh cùng lớp');
        
        // Trả về dữ liệu mẫu khi có lỗi
        return Array(2).fill(0).map((_, i) => ({
            id: i + 1,
            name: `Học sinh ${i + 1}`,
            gender: i % 2 === 0 ? 'male' : 'female',
            birth_date: '2005-01-01',
            phone: '0987654321',
            user: {
                id: i + 100,
                name: `Học sinh ${i + 1}`,
                email: `student${i + 1}@example.com`
            },
            class_id: 1,
            class_position: i === 0 ? 'Lớp trưởng' : ''
        }));
    }
};
