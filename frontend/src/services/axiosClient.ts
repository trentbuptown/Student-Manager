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
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Xử lý đặc biệt cho DELETE requests
    if (config.method?.toUpperCase() === 'DELETE') {
      console.log(`🗑️ Preparing DELETE request to ${config.url}`);
      // Đảm bảo content-type phù hợp cho DELETE
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Log chi tiết request để debug
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      url: config.url,
      method: config.method,
      data: config.data,
      params: config.params,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error("Lỗi khi gửi request:", error);
    return Promise.reject(error);
  }
);

// Xử lý response
axiosClient.interceptors.response.use(
  (response) => {
    // Log chi tiết response thành công
    console.log(`[API Response Success] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Chi tiết hóa log lỗi
    if (error.response) {
      // Có response nhưng status code không nằm trong 2xx
      console.error(`[API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response.status,
        data: error.response.data || {},
        headers: error.response.headers,
        requestData: error.config?.data ? JSON.parse(error.config.data) : {}
      });

      // Xử lý lỗi 401 (Unauthorized)
      if (error.response.status === 401) {
        console.log('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        // Chuyển hướng đến trang đăng nhập nếu token hết hạn
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Không chuyển hướng tự động nếu đang ở trang logout hoặc sign-in
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/logout') && !currentPath.includes('/sign-in')) {
            console.log('Chuyển hướng đến trang đăng nhập do lỗi 401');
            window.location.href = '/sign-in';
          } else {
            console.log('Đang ở trang đăng xuất hoặc đăng nhập, không chuyển hướng');
          }
        }
      }
      
      // Kiểm tra trường hợp response data là đối tượng rỗng
      if (error.response.data && Object.keys(error.response.data).length === 0) {
        console.log(`Phản hồi rỗng với status code ${error.response.status}`);
        // Thêm thông báo lỗi mặc định nếu response data rỗng
        error.response.data = {
          status: 'error',
          message: `Lỗi máy chủ (${error.response.status}). Vui lòng thử lại sau.`
        };
      }
    } else if (error.request) {
      // Đã gửi request nhưng không nhận được response
      console.error('Không nhận được phản hồi từ máy chủ:', error.request);
    } else {
      // Có lỗi xảy ra khi thiết lập request
      console.error('Lỗi khi thiết lập request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient; 