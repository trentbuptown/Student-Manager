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

export interface ChangePasswordData {
    current_password?: string;
    new_password: string;
    new_password_confirmation: string;
    is_admin?: boolean;
    user_id?: number;
}

export interface ChangePasswordResponse {
    status: string;
    message: string;
}

// Hàm để thiết lập cookie
const setCookie = (name: string, value: string, days: number = 7) => {
    if (typeof document === 'undefined') return;
    
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    document.cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
};

// Hàm để xóa cookie
const deleteCookie = (name: string) => {
    if (typeof document === 'undefined') return;
    
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const login = async (data: LoginData): Promise<LoginResponse> => {
    try {
        const response = await axiosClient.post('/login', data);
        
        // Lưu token và thông tin user vào localStorage
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Xác định vai trò người dùng
            let userRole = 'user';
            const user = response.data.user;
            
            console.log('User data from API:', user);
            
            // Kiểm tra sự tồn tại của các mối quan hệ
            if (user.admin) {
                userRole = 'admin';
                console.log('User role identified as admin');
            } else if (user.teacher) {
                userRole = 'teacher';
                console.log('User role identified as teacher');
            } else if (user.student) {
                userRole = 'student';
                console.log('User role identified as student');
            } else {
                console.log('User role could not be determined from:', user);
            }
            
            // Lưu token và vai trò vào cookie
            setCookie('auth_token', response.data.token);
            setCookie('user_role', userRole);
            
            console.log('Đăng nhập thành công, đã lưu token và vai trò:', userRole);
        }
        
        return response.data;
    } catch (error) {
        console.error('Lỗi trong quá trình đăng nhập:', error);
        throw error;
    }
};

export const logout = async (): Promise<void> => {
    try {
        // Gọi API logout nếu token tồn tại
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Thử gọi API logout, nhưng xử lý các lỗi có thể xảy ra
                console.log('Đang gọi API đăng xuất...');
                await axiosClient.post('/logout');
                console.log('Đăng xuất API thành công');
            } catch (error: any) {
                // Không cần throw lỗi - chỉ ghi log lỗi
                if (error.response?.status === 401) {
                    console.log('Lỗi 401 khi đăng xuất: Phiên đã hết hạn hoặc token không hợp lệ');
                } else {
                    console.log('Lỗi khi gọi API đăng xuất, vẫn tiếp tục quá trình đăng xuất local');
                    console.error('Chi tiết lỗi:', error);
                }
            }
        } else {
            console.log('Không có token để đăng xuất qua API');
        }
    } finally {
        try {
            // Luôn xóa token và user khỏi localStorage, ngay cả khi API call thất bại
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Xóa cookie auth_token và user_role
            deleteCookie('auth_token');
            deleteCookie('user_role');
            
            console.log('Đã xóa token và thông tin người dùng khỏi localStorage và cookie');
        } catch (e) {
            console.error('Lỗi khi xóa dữ liệu đăng nhập local:', e);
        }
    }
};

export const changePassword = async (data: ChangePasswordData): Promise<ChangePasswordResponse> => {
    const response = await axiosClient.post('/change-password', data);
    return response.data;
};

export const getCurrentUser = (): any => {
    if (typeof window === 'undefined') return null;
    
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
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};

export const isTeacher = (): boolean => {
    const user = getCurrentUser();
    return user && user.teacher !== undefined && user.teacher !== null;
};

export const isStudent = (): boolean => {
    const user = getCurrentUser();
    return user && user.student !== undefined && user.student !== null;
};

export const isAdmin = (): boolean => {
    const user = getCurrentUser();
    console.log("Checking admin permission, user:", user);
    console.log("Has admin:", user && user.admin !== undefined && user.admin !== null);
    return user && user.admin !== undefined && user.admin !== null;
}; 