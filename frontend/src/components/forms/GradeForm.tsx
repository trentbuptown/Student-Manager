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
    name: z.string().min(1, { message: "Vui lòng nhập tên khối." }),
});

type GradeSchema = z.infer<typeof gradeSchema>;

type Grade = {
    id: number;
    name: string;
    classes?: any[];
    classes_count?: number;
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
        reset,
    } = useForm<GradeSchema>({
        resolver: zodResolver(gradeSchema),
        defaultValues: data || { name: "" },
    });

    const onSubmit = handleSubmit(async (formData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            if (type === "create") {
                const response = await createGrade(formData);
                toast.success("Đã tạo khối lớp thành công");
                reset();
            } else if (type === "update" && data?.id) {
                const response = await updateGrade(data.id, formData);
                toast.success("Đã cập nhật khối lớp thành công");
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            console.error("Error in form submission:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Có lỗi xảy ra khi gửi form"
            );
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Thất bại khi xử lý yêu cầu"
            );
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
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 p-2 rounded-md">
                    {error}
                </div>
            )}

            <button
                className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                disabled={isSubmitting}
                type="submit"
            >
                {isSubmitting
                    ? "Đang xử lý..."
                    : type === "create"
                    ? "Thêm mới"
                    : "Cập nhật"}
            </button>
        </form>
    );
};

export default GradeForm;
