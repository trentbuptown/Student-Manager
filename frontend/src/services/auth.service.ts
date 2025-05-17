import axios from 'axios';

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

export const login = async (data: LoginData): Promise<LoginResponse> => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    
    const response = await axios.post(`${backendUrl}/login`, data, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    });
    return response.data;
};

export const logout = async (): Promise<void> => {
    try {
        const token = localStorage.getItem('token');
        
        // Sử dụng đường dẫn tuyệt đối đến backend API
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        
        await axios.post(`${backendUrl}/logout`, {}, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Lỗi khi gọi API đăng xuất:', error);
        // Vẫn xóa token ngay cả khi API báo lỗi
        localStorage.removeItem('token');
    }
}; 