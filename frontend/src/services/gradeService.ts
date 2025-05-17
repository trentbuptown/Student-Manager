import axiosClient from "./axiosClient";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

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

const API_URL = "/grades";

export const getAllGrades = async (): Promise<Grade[]> => {
    try {
        const response = await axiosClient.get(API_URL);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching grades:", error);
        toast.error("Không thể lấy danh sách khối lớp");
        throw error;
    }
};

export const getGradeById = async (id: number): Promise<Grade> => {
    try {
        const response = await axiosClient.get(`${API_URL}/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching grade ${id}:`, error);
        toast.error("Không thể lấy thông tin khối lớp");
        throw error;
    }
};

export const createGrade = async (data: GradeCreateParams): Promise<Grade> => {
    try {
        const response = await axiosClient.post(API_URL, data);
        return response.data.data;
    } catch (error: any) {
        console.error("Error creating grade:", error);
        if (error.response?.data?.message) {
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
        const response = await axiosClient.put(`${API_URL}/${id}`, data);
        return response.data.data;
    } catch (error: any) {
        console.error(`Error updating grade ${id}:`, error);
        if (error.response?.data?.message) {
            toast.error(error.response.data.message);
        } else {
            toast.error("Không thể cập nhật khối lớp");
        }
        throw error;
    }
};

export const deleteGrade = async (id: number): Promise<void> => {
    try {
        await axiosClient.delete(`${API_URL}/${id}`);
    } catch (error: any) {
        console.error(`Error deleting grade ${id}:`, error);
        if (error.response?.data?.message) {
            toast.error(error.response.data.message);
        } else {
            toast.error("Không thể xóa khối lớp");
        }
        throw error;
    }
};
