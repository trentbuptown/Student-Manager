import { toast } from "react-toastify";
import axios from "axios";

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

export interface Student {
    id: number;
    name: string;
    birth_date: string;
    gender: string;
    phone?: string;
    class_id: number;
    user_id: number;
    user: {
        id: number;
        name: string;
        email: string;
        username: string;
    };
    class?: {
        id: number;
        name: string;
        grade_id: number;
        teacher_id?: number;
        grade?: {
            id: number;
            name: string;
        };
        teacher?: {
            id: number;
            name: string;
        };
    };
}

export interface StudentCreateParams {
    name: string;
    birth_date: string;
    gender: string;
    phone: string;
    class_id: number;
    user_id: number;
    user?: {
        name: string;
        email: string;
        password: string;
    };
}

export interface StudentUpdateParams {
    name?: string;
    birth_date?: string;
    gender?: string;
    phone?: string;
    class_id?: number;
    email?: string;
    username?: string;
}

// Lấy danh sách tất cả học sinh
export const getStudents = async (): Promise<Student[]> => {
    try {
        const response = await axiosInstance.get('/students');
        return response.data;
    } catch (error) {
        console.error("Error fetching students:", error);
        throw error;
    }
};

// Lấy thông tin chi tiết một học sinh
export const getStudentById = async (id: number): Promise<Student> => {
    try {
        console.log(`Đang gọi API để lấy thông tin học sinh với ID: ${id}`);
        const response = await axiosInstance.get(`/students/${id}`);
        console.log(`Đã nhận được dữ liệu học sinh:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching student ${id}:`, error);
        throw error;
    }
};

// Tạo học sinh mới
export const createStudent = async (params: StudentCreateParams): Promise<any> => {
    try {
        // Kiểm tra token
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Bạn cần đăng nhập để thực hiện chức năng này');
            throw new Error('Không có token xác thực');
        }

        // Hỗ trợ tạo cả user và student trong cùng một API call
        if (params.user) {
            console.log('Dữ liệu tạo học sinh với user:', JSON.stringify(params));
            
            try {
                const response = await axiosInstance.post('/students', params);
                toast.success('Thêm học sinh thành công');
                return response.data;
            } catch (error: any) {
                // Xử lý lỗi từ API
                if (error.response?.status === 403) {
                    toast.error('Bạn không có quyền thêm học sinh mới. Chỉ quản trị viên mới có quyền này.');
                    throw new Error('Không có quyền thực hiện');
                }
                throw error;
            }
        } else {
            console.log('Dữ liệu tạo học sinh thông thường:', JSON.stringify(params));
            
            const response = await axiosInstance.post('/students', params);
            toast.success('Thêm học sinh thành công');
            return response.data;
        }
    } catch (error: any) {
        console.error('Lỗi khi tạo học sinh:', error);
        
        // Xử lý lỗi chi tiết
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            
            if (error.response.status === 403) {
                // Lỗi không có quyền - thông báo cụ thể hơn
                console.error('Lỗi quyền truy cập:', error.response.data);
                toast.error('Tài khoản của bạn không có quyền tạo học sinh. Vui lòng đăng nhập bằng tài khoản admin.');
            } else if (error.response.status === 422) {
                // Hiển thị tất cả các lỗi validation
                if (error.response.data.errors) {
                    Object.entries(error.response.data.errors).forEach(([field, messages]) => {
                        console.error(`Field ${field}:`, messages);
                        (messages as string[]).forEach((msg: string) => {
                            toast.error(`${field}: ${msg}`);
                        });
                    });
                } else if (error.response.data.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường bắt buộc.');
                }
            } else if (error.response.status === 401) {
                // Lỗi xác thực - đăng xuất
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else {
                // Các lỗi khác
                if (error.response.data?.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error(`Lỗi ${error.response.status}: Không thể tạo học sinh`);
                }
            }
        } else if (error.request) {
            // Yêu cầu đã gửi nhưng không nhận được phản hồi
            console.error('Không nhận được phản hồi:', error.request);
            toast.error('Không nhận được phản hồi từ máy chủ. Vui lòng thử lại sau.');
        } else {
            // Lỗi khi thiết lập request
            console.error('Lỗi khi thiết lập request:', error.message);
            toast.error('Lỗi kết nối: ' + error.message);
        }
        
        throw error;
    }
};

// Cập nhật thông tin học sinh
export const updateStudent = async (id: number, data: StudentUpdateParams): Promise<Student> => {
    try {
        console.log("Updating student with data:", data);
        const response = await axiosInstance.put(`/students/${id}`, data);
        toast.success('Cập nhật học sinh thành công');
        return response.data;
    } catch (error: any) {
        console.error(`Error updating student ${id}:`, error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            
            if (error.response.status === 403) {
                toast.error('Tài khoản của bạn không có quyền cập nhật học sinh.');
            } else if (error.response.status === 422) {
                // Hiển thị lỗi validation
                if (error.response.data.errors) {
                    Object.entries(error.response.data.errors).forEach(([field, messages]) => {
                        (messages as string[]).forEach((msg: string) => {
                            toast.error(`${field}: ${msg}`);
                        });
                    });
                } else if (error.response.data.message) {
                    toast.error(error.response.data.message);
                }
            } else {
                toast.error(`Lỗi ${error.response.status}: Không thể cập nhật học sinh`);
            }
        } else {
            toast.error('Lỗi kết nối: Không thể cập nhật học sinh');
        }
        throw error;
    }
};

// Xóa một học sinh
export const deleteStudent = async (id: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/students/${id}`);
    } catch (error) {
        console.error(`Error deleting student ${id}:`, error);
        throw error;
    }
};

// Kiểm tra kết nối tới API
export const checkApiConnection = async (): Promise<boolean> => {
    try {
        const response = await axiosInstance.get('/students');
        console.log("API connection check:", response.status);
        return response.status === 200;
    } catch (error) {
        console.error("API connection failed:", error);
        return false;
    }
};

// Tạo học sinh mới (bao gồm tạo user)
export const createStudentWithUser = async (data: {
    name: string;
    email: string;
    password: string;
    role: 'student';
    class_id: number;
}): Promise<any> => {
    try {
        console.log("Creating student with user data:", data);
        console.log("API URL:", `${API_URL}/register`);
        console.log("Headers:", axiosInstance.defaults.headers);
        
        // Kiểm tra token
        const token = localStorage.getItem('token');
        console.log("Token available:", !!token);
        if (!token) {
            throw new Error("Không có token xác thực");
        }
        
        // Kiểm tra quyền admin
        try {
            const userResponse = await axiosInstance.get('/user');
            console.log("Current user:", userResponse.data);
            console.log("Is admin:", !!userResponse.data.admin);
            if (!userResponse.data.admin) {
                throw new Error("Người dùng không có quyền admin");
            }
        } catch (error) {
            console.error("Error checking admin permission:", error);
            throw new Error("Không thể kiểm tra quyền admin");
        }
        
        const response = await axiosInstance.post('/register', data);
        console.log("Create student with user response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error creating student with user:", error);
        if (error.response) {
            console.error("Error response data:", error.response.data);
            console.error("Error status:", error.response.status);
            console.error("Error headers:", error.response.headers);
        } else if (error.request) {
            console.error("Error request:", error.request);
        } else {
            console.error("Error message:", error.message);
        }
        throw error;
    }
}; 