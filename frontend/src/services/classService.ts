import { toast } from "react-toastify";
import axios from "axios";

export type Class = {
    id: number;
    name: string;
    grade_id: number;
    supervisor: string;
    capacity: number;
    grade?: {
        id: number;
        name: string;
    };
};

export type ClassCreateParams = {
    name: string;
    capacity: number;
    grade_id: number;
    supervisor: string;
};

export type ClassUpdateParams = {
    name?: string;
    capacity?: number;
    grade_id?: number;
    supervisor?: string;
};

const API_URL = "/api/classes";

// Lấy danh sách tất cả lớp học
export const getClasses = async (): Promise<Class[]> => {
    try {
        const response = await axios.get(API_URL);
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("Không thể tải danh sách lớp học");
        return [];
    }
};

// Lấy thông tin chi tiết một lớp học
export const getClassById = async (id: number) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// Tạo lớp học mới
export const createClass = async (data: Omit<Class, "id">) => {
    try {
        const response = await axios.post(API_URL, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Cập nhật thông tin lớp học
export const updateClass = async (id: number, data: Partial<Class>) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Xóa một lớp học
export const deleteClass = async (id: number) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
