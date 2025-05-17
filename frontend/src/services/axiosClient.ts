import axios from 'axios';
import { getToken } from '@/utils/auth';

// Lấy baseURL từ biến môi trường hoặc sử dụng URL mặc định
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Tạo instance Axios với cấu hình mặc định
const axiosClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Thêm interceptor để tự động thêm token vào header
axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý response
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      console.log('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      // Chuyển hướng đến trang đăng nhập nếu token hết hạn
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient; 