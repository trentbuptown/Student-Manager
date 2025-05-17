import axiosClient from './axiosClient';

export interface Rule {
    id: number;
    title: string;
    content: string;
    admin_id: number;
    created_at: string;
    updated_at: string;
}

export const ruleService = {
    // Lấy danh sách quy định
    getAll: async () => {
        const response = await axiosClient.get('/rules');
        return response.data.data;
    },

    // Tạo quy định mới
    create: async (data: { title: string; content: string; admin_id: number }) => {
        const response = await axiosClient.post('/rules', data);
        return response.data.data;
    },

    // Cập nhật quy định
    update: async (id: number, data: { title?: string; content?: string; admin_id?: number }) => {
        const response = await axiosClient.put(`/rules/${id}`, data);
        return response.data.data;
    },

    // Xóa quy định
    delete: async (id: number) => {
        const response = await axiosClient.delete(`/rules/${id}`);
        return response.data;
    }
}; 