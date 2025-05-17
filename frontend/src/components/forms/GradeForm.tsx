"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { z } from "zod";
import { useState } from "react";
import { toast } from "react-toastify";
import { createGrade, updateGrade } from "@/services/gradeService";

// Định nghĩa schema xác thực cho form khối
const gradeSchema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: "Vui lòng nhập tên khối." }),
    description: z.string().optional()
});

type GradeSchema = z.infer<typeof gradeSchema>;

type Grade = {
    id: number;
    name: string;
    description?: string;
    classes?: any[];
};

const GradeForm = ({
    type,
    data,
    onSuccess,
}: {
    type: "create" | "update";
    data?: Grade;
    onSuccess?: () => void;
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<GradeSchema>({
        resolver: zodResolver(gradeSchema),
        defaultValues: data || { name: "" }
    });

    const onSubmit = handleSubmit(async (formData) => {
        console.log("Form data submitted:", formData);
        setIsSubmitting(true);
        setError(null);

        try {
            // Add direct URL for API call
            if (type === "create") {
                console.log("Creating new grade:", formData);
                const response = await fetch('http://127.0.0.1:8000/api/grades', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ name: formData.name }),
                });

                console.log("Response status:", response.status);
                const responseData = await response.json();
                console.log("Response data:", responseData);

                if (!response.ok) {
                    throw new Error(responseData.message || "Không thể tạo khối");
                }

                toast.success("Đã tạo khối lớp thành công");
                reset(); // Reset form sau khi tạo thành công

                if (onSuccess) {
                    onSuccess();
                }
            } else if (type === "update" && data?.id) {
                console.log("Updating grade:", data.id, formData);
                const response = await fetch(`http://127.0.0.1:8000/api/grades/${data.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ name: formData.name }),
                });

                console.log("Response status:", response.status);
                const responseData = await response.json();
                console.log("Response data:", responseData);

                if (!response.ok) {
                    throw new Error(responseData.message || "Không thể cập nhật khối");
                }

                toast.success("Đã cập nhật khối lớp thành công");

                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (err) {
            console.error("Error in form submission:", err);
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi gửi form");
            toast.error(err instanceof Error ? err.message : "Thất bại khi xử lý yêu cầu");
        } finally {
            setIsSubmitting(false);
        }
    });

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <div className="flex items-center gap-2">
                <Image src="/adduser.png" alt="" width={40} height={40} />
                <h1 className="text-xl font-semibold">
                    {type === "create"
                        ? "Thêm khối lớp mới"
                        : "Chỉnh sửa khối lớp"}
                </h1>
            </div>

            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Tên khối"
                    name="name"
                    defaultValue={data?.name}
                    register={register}
                    error={errors?.name}
                    className="w-full"
                    placeholder="Ví dụ: Khối 10, Khối 11, Khối 12"
                />
                
                <InputField
                    label="Mô tả (tùy chọn)"
                    name="description"
                    defaultValue={data?.description}
                    register={register}
                    error={errors?.description}
                    className="w-full md:w-1/2"
                />
                
                {data?.id && (
                    <InputField
                        label="Id khối"
                        name="id"
                        defaultValue={data?.id}
                        register={register}
                        error={errors?.id}
                        disabled={true}
                        className="w-full md:w-1/3"
                    />
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 p-2 rounded-md">
                    {error}
                </div>
            )}

            <button 
                className="bg-blue-400 text-white p-2 rounded-md"
                disabled={isSubmitting}
                type="submit"
            >
                {isSubmitting ? "Đang xử lý..." : (type === "create" ? "Thêm mới" : "Cập nhật")}
            </button>
        </form>
    );
};

export default GradeForm; 