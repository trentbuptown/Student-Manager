"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, FormEvent, ChangeEvent } from "react";

interface FormData {
    username: string;
    password: string;
}

const LoginPage = () => {
    const [formData, setFormData] = useState<FormData>({
        username: "",
        password: "",
    });
    const [error, setError] = useState<string>("");
    const router = useRouter();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Kiểm tra validation
        if (!formData.username || !formData.password) {
            setError("Vui lòng nhập đầy đủ thông tin đăng nhập");
            return;
        }

        // Xử lý đăng nhập ở đây
        // Đây là nơi bạn có thể thêm logic xác thực hoặc gọi API

        console.log("Đăng nhập với:", formData);

        // Giả lập chuyển hướng sau khi đăng nhập thành công
        // router.push("/dashboard");
    };

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
                                <div className="text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="username"
                                    className="text-sm font-medium"
                                >
                                    Tên đăng nhập
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
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
                                className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md text-sm py-3 w-full mt-6 transition-colors"
                            >
                                Đăng nhập
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
