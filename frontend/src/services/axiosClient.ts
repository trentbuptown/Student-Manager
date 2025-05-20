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
  // Thêm withCredentials để gửi cookie nếu cần
  withCredentials: true,
});

// Thêm interceptor để tự động thêm token vào header
axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Xử lý đặc biệt cho DELETE requests
    if (config.method?.toUpperCase() === 'DELETE') {
      console.log(`🗑️ Preparing DELETE request to ${config.url}`);
      // Đảm bảo content-type phù hợp cho DELETE
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Log tất cả request để giúp debug
    console.log(`📤 [API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      url: config.url,
      method: config.method,
      params: config.params
    });
    
    return config;
  },
  (error) => {
    console.error("❌ Lỗi khi gửi request:", error);
    return Promise.reject(error);
  }
);

// Xử lý response
axiosClient.interceptors.response.use(
  (response) => {
    // Log tất cả response thành công để giúp debug
    console.log(`✅ [API Response Success] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      dataLength: Array.isArray(response.data) ? response.data.length : 'not array'
    });
    
    return response;
  },
  (error) => {
    // Chi tiết hóa log lỗi
    if (error.response) {
      console.error(`❌ [API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response.status,
        message: error.message
      });

      // Xử lý lỗi 401 (Unauthorized)
      if (error.response.status === 401) {
        console.log('🔒 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        // Chuyển hướng đến trang đăng nhập nếu token hết hạn
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Không chuyển hướng tự động nếu đang ở trang logout hoặc sign-in
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/logout') && !currentPath.includes('/sign-in')) {
            console.log('➡️ Chuyển hướng đến trang đăng nhập do lỗi 401');
            window.location.href = '/sign-in';
          } else {
            console.log('🔄 Đang ở trang đăng xuất hoặc đăng nhập, không chuyển hướng');
          }
        }
      }
      
      // Trường hợp đặc biệt cho /logout - không throw lỗi nếu đang ở trang logout
      if (error.config?.url === '/logout') {
        console.log('🚪 Đang xử lý lỗi từ API /logout - không gây crash');
        return Promise.resolve({ status: 200, data: { message: 'Đã đăng xuất' } });
      }
    } else if (error.request) {
      // Request đã được gửi nhưng không nhận được response
      console.error('❌ [API Network Error]', {
        url: error.config?.url,
        message: 'Không nhận được phản hồi từ server'
      });
    } else {
      // Có lỗi xảy ra khi thiết lập request
      console.error('❌ [API Request Error]', {
        message: error.message
      });
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient; 