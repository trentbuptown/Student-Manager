import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface LoginResponse {
    status: string;
    message: string;
    user: any;
    token: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export const login = async (data: LoginData): Promise<LoginResponse> => {
    const response = await axios.post(`${API_URL}/login`, data, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    });
    return response.data;
};

export const logout = async (): Promise<void> => {
    await axios.post(`${API_URL}/logout`, {}, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    });
}; 