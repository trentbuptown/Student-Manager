"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { login, LoginData, isAuthenticated, isTeacher, isStudent, isAdmin } from "@/services/auth.service";
import toast from 'react-hot-toast';

const LoginPage = () => {
    const [formData, setFormData] = useState<LoginData>({
        email: "",
        password: "",
    });
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [redirecting, setRedirecting] = useState<boolean>(false);
    const router = useRouter();

    // Kiểm tra nếu người dùng đã đăng nhập, chuyển hướng họ đến trang tương ứng
    useEffect(() => {
        const checkAuth = async () => {
            if (typeof window !== 'undefined') {
                if (isAuthenticated()) {
                    setRedirecting(true);
                    console.log('User is already authenticated, redirecting...');
                    
                    // Chuyển hướng dựa trên vai trò
                    if (isTeacher()) {
                        console.log('Redirecting to teacher dashboard');
                        router.replace('/teacher-dashboard');
                    } else if (isStudent()) {
                        console.log('Redirecting to student dashboard');
                        router.replace('/student-dashboard');
                    } else if (isAdmin()) {
                        console.log('Redirecting to admin dashboard');
                        router.replace('/dashboard');
                    } else {
                        console.log('Role not determined, redirecting to home');
                        router.replace('/');
                    }
                }
            }
        };
        
        checkAuth();
    }, [router]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // Kiểm tra validation
            if (!formData.email || !formData.password) {
                setError("Vui lòng nhập đầy đủ thông tin đăng nhập");
                setIsLoading(false);
                return;
            }

            console.log('Đang đăng nhập với:', formData.email);
            const response = await login(formData);
            console.log('Phản hồi đăng nhập:', response);
            
            // Hiển thị thông báo thành công
            toast.success('Đăng nhập thành công!');
            
            // Chuyển hướng dựa trên vai trò của người dùng
            setRedirecting(true);
            const user = response.user;
            
            if (user.teacher) {
                console.log("Người dùng là giáo viên, chuyển hướng đến /teacher-dashboard");
                router.push('/teacher-dashboard');
            } else if (user.student) {
                console.log("Người dùng là học sinh, chuyển hướng đến /student-dashboard");
                router.push('/student-dashboard');
            } else if (user.admin) {
                console.log("Người dùng là admin, chuyển hướng đến /dashboard");
                router.push('/dashboard');
            } else {
                console.log("Vai trò không xác định, chuyển hướng đến trang chủ");
                router.push('/');
            }
        } catch (err: any) {
            console.error("Lỗi đăng nhập:", err);
            setError(err.response?.data?.message || "Có lỗi xảy ra khi đăng nhập");
            toast.error('Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
        } finally {
            setIsLoading(false);
        }
    };

    if (redirecting) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--blue-pastel)]">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-xl font-semibold mb-4">Đăng nhập thành công!</h2>
                    <p className="mb-4">Đang chuyển hướng đến trang chính...</p>
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen items-center justify-center bg-[var(--blue-pastel)] p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="bg-white flex flex-col md:flex-row rounded-xl overflow-hidden w-full max-w-5xl shadow-lg">
                <div className="hidden md:block md:w-1/2 relative">
                    <Image
                        src="/signin.jpg"
                        alt="Students illustration"
                        width={600}
                        height={600}
                        className="w-full h-full object-cover"
                        priority
                    />
                </div>

                {/* Phần form bên phải */}
                <div className="w-full md:w-1/2 bg-white">
                    <div className="p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold">
                            Đăng nhập ngay!
                        </h1>
                        <h2 className="text-gray-400 text-sm max-w-xs pb-4">
                            Chào mừng bạn đến với hệ thống quản lý trường học.
                            Hãy đăng nhập để tiếp tục nhé.
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="p-2.5 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium"
                                >
                                    Mật khẩu
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="p-2.5 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md text-sm py-3 w-full mt-6 transition-colors ${
                                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
