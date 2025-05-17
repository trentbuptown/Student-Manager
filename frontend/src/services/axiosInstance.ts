import axios from 'axios';
import { redirect } from 'next/navigation';

const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const axiosInstance = axios.create({
    baseURL: backendUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true // Quan trọng để gửi cookies
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Xử lý lỗi xác thực (401 Unauthorized)
        if (error.response?.status === 401) {
            console.log('Phiên đăng nhập đã hết hạn hoặc token không hợp lệ');
            
            // Xóa token khỏi localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Xóa cookie auth_token
            document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            
            // Kiểm tra xem đường dẫn hiện tại có phải là trang đăng xuất không
            // Nếu không phải trang đăng xuất, chuyển hướng về trang đăng nhập
            if (!window.location.pathname.includes('/logout')) {
                window.location.href = '/sign-in';
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance; 