import axios from "axios";
import { toast } from "react-toastify";

export type Grade = {
    id: number;
    name: string;
    classes?: Class[];
    classes_count?: number;
    created_at?: string;
    updated_at?: string;
};

export type Class = {
    id: number;
    name: string;
    grade_id: number;
    teacher_id?: number;
};

export type GradeCreateParams = {
    name: string;
};

export type GradeUpdateParams = {
    name: string;
};

const API_URL = "http://localhost:8000/api";

export const getAllGrades = async (): Promise<Grade[]> => {
    try {
        const response = await axios.get(`${API_URL}/grades`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching grades:", error);
        toast.error("Không thể lấy danh sách khối lớp");
        throw error;
    }
};

export const getGradeById = async (id: number): Promise<Grade> => {
    try {
        const response = await axios.get(`${API_URL}/grades/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching grade ${id}:`, error);
        toast.error("Không thể lấy thông tin khối lớp");
        throw error;
    }
};

export const createGrade = async (data: GradeCreateParams): Promise<Grade> => {
    try {
        const response = await axios.post(`${API_URL}/grades`, data, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            withCredentials: true,
        });
        return response.data.data;
    } catch (error) {
        console.error("Error creating grade:", error);
        if (axios.isAxiosError(error) && error.response?.data?.message) {
            toast.error(error.response.data.message);
        } else {
            toast.error("Không thể tạo khối lớp mới");
        }
        throw error;
    }
};

export const updateGrade = async (
    id: number,
    data: GradeUpdateParams
): Promise<Grade> => {
    try {
        const response = await axios.put(`${API_URL}/grades/${id}`, data, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            withCredentials: true,
        });
        return response.data.data;
    } catch (error) {
        console.error(`Error updating grade ${id}:`, error);
        if (axios.isAxiosError(error) && error.response?.data?.message) {
            toast.error(error.response.data.message);
        } else {
            toast.error("Không thể cập nhật khối lớp");
        }
        throw error;
    }
};

export const deleteGrade = async (id: number): Promise<void> => {
    try {
        await axios.delete(`${API_URL}/grades/${id}`, {
            withCredentials: true,
        });
    } catch (error) {
        console.error(`Error deleting grade ${id}:`, error);
        if (axios.isAxiosError(error) && error.response?.data?.message) {
            toast.error(error.response.data.message);
        } else {
            toast.error("Không thể xóa khối lớp");
        }
        throw error;
    }
};
