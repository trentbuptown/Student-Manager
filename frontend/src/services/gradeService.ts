import { toast } from "react-toastify";

export type Grade = {
  id: number;
  name: string;
  classes?: any[];
  created_at?: string;
  updated_at?: string;
};

export type GradeCreateParams = {
  name: string;
};

export type GradeUpdateParams = {
  name?: string;
};

// Tạo một hàm API riêng để xử lý các yêu cầu
const apiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    // Xác định đầy đủ URL nếu chỉ nhận đường dẫn tương đối
    const fullUrl = url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`;
    
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    
    // Tạo headers với token nếu có
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };
    
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include',
    });
    
    // Kiểm tra lỗi xác thực
    if (response.status === 401) {
      console.error('Lỗi xác thực: Chưa đăng nhập hoặc phiên đăng nhập đã hết hạn');
      
      // Xóa token và cookie
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Chuyển hướng đến trang đăng nhập nếu không phải đang ở trang đăng xuất
      if (!window.location.pathname.includes('/logout')) {
        window.location.href = '/sign-in';
      }
      
      throw new Error('Lỗi xác thực: Chưa đăng nhập hoặc phiên đăng nhập đã hết hạn');
    }
    
    return response;
  } catch (error) {
    console.error('API Request error:', error);
    throw error;
  }
};

// Lấy danh sách tất cả khối
export const getAllGrades = async (): Promise<Grade[]> => {
  try {
    const response = await apiRequest('/api/grades');
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Lỗi API:', errorData);
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching grades:', error);
    return [];
  }
};

// Lấy thông tin chi tiết một khối
export const getGradeById = async (id: number): Promise<Grade | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Sử dụng apiRequest thay vì fetch trực tiếp
    const response = await apiRequest(`/api/grades/${id}`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Server trả về lỗi khi lấy khối ${id}:`, response.status);
      return null;
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.log(`Không thể kết nối tới backend để lấy khối ${id}:`, error);
    return null;
  }
};

// Tạo khối mới
export const createGrade = async (params: GradeCreateParams): Promise<Grade | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Sử dụng apiRequest thay vì fetch trực tiếp
    const response = await apiRequest('/api/grades', {
      method: 'POST',
      body: JSON.stringify(params),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      console.warn('Server trả về lỗi khi tạo khối:', errorData.message || response.status);
      return null;
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.log('Không thể kết nối tới backend để tạo khối:', error);
    return null;
  }
};

// Cập nhật thông tin khối
export const updateGrade = async (id: number, params: GradeUpdateParams): Promise<Grade | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Sử dụng apiRequest thay vì fetch trực tiếp
    const response = await apiRequest(`/api/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(params),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      console.warn(`Server trả về lỗi khi cập nhật khối ${id}:`, errorData.message || response.status);
      return null;
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.log(`Không thể kết nối tới backend để cập nhật khối ${id}:`, error);
    return null;
  }
};

// Xóa một khối
export const deleteGrade = async (id: number): Promise<{success: boolean; message?: string}> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Sử dụng apiRequest thay vì fetch trực tiếp
    const response = await apiRequest(`/api/grades/${id}`, {
      method: 'DELETE',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    // Xử lý phản hồi
    const responseData = await response.json();
    
    if (!response.ok) {
      console.warn(`Server trả về lỗi khi xóa khối ${id}:`, responseData.message || response.status);
      return {
        success: false,
        message: responseData.message || "Không thể xóa khối"
      };
    }

    return {
      success: true,
      message: responseData.message || "Xóa khối thành công"
    };
  } catch (error) {
    console.log(`Không thể kết nối tới backend để xóa khối ${id}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi kết nối đến máy chủ"
    };
  }
}; 