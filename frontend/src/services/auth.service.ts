import axiosClient from './axiosClient';

// Sử dụng đường dẫn tương đối cho các API calls
const API_URL = '/api';

export interface LoginResponse {
    status: string;
    message: string;
    user: any;
    token: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'admin' | 'teacher' | 'student';
    // Thông tin bổ sung cho giáo viên
    specialization?: string;
    is_gvcn?: boolean;
    // Thông tin bổ sung cho học sinh
    class_id?: number;
}

export const login = async (data: LoginData): Promise<LoginResponse> => {
    const response = await axiosClient.post('/login', data);
    
    // Lưu token và thông tin user vào localStorage
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
};

export const logout = async (): Promise<void> => {
    try {
        // Gọi API logout nếu token tồn tại
        const token = localStorage.getItem('token');
        if (token) {
            await axiosClient.post('/logout');
        }
    } catch (error) {
        console.error('Lỗi khi đăng xuất:', error);
    } finally {
        // Xóa token và user khỏi localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export const getCurrentUser = (): any => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
};

export const getToken = (): string | null => {
    return localStorage.getItem('token');
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};

export const isTeacher = (): boolean => {
    const user = getCurrentUser();
    return user && user.teacher;
};

export const isStudent = (): boolean => {
    const user = getCurrentUser();
    return user && user.student;
};

export const isAdmin = (): boolean => {
    const user = getCurrentUser();
    return user && user.admin;
}; 