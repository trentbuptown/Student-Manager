"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { teachersData } from "@/lib/data";
import Image from "next/image";

type Teacher = {
    id: number;
    teacherId: string;
    name: string;
    email?: string;
    photo: string;
    subjects: string[];
    classes: string[];
    phone: string;
    address: string;
};

const SubjectForm = ({
    type,
    data,
    teachers = teachersData,
}: {
    type: "create" | "update";
    data?: any;
    teachers?: Teacher[];
}) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SubjectSchema>({
        resolver: zodResolver(subjectSchema),
        // Nếu có data, sử dụng nó làm giá trị mặc định
        defaultValues: data
            ? {
                  id: data.id,
                  name: data.name,
                  teachers: data.teachers,
              }
            : undefined,
    });

    const onSubmit = handleSubmit(async (formData) => {
        try {
            setIsSubmitting(true);
            setError(null);

            console.log(formData);
            // Thêm logic gửi dữ liệu đến API ở đây
            // const response = await fetch('/api/subjects', {...})

            toast.success(
                type === "create"
                    ? "Tạo môn học thành công"
                    : "Cập nhật môn học thành công"
            );

            // Chuyển hướng sau khi tạo/cập nhật thành công
            // router.push("/subjects");
        } catch (err) {
            console.error(err);
            setError("Something went wrong when submitting the form");
            toast.error("Failed to process your request");
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
                        ? "Thêm môn học mới"
                        : "Chỉnh sửa môn học"}
                </h1>
            </div>

            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Tên môn học"
                    name="name"
                    defaultValue={data?.name}
                    register={register}
                    error={errors?.name}
                />

                <InputField
                    label="Mã môn học"
                    name="subjectId"
                    defaultValue={data?.subjectId}
                    register={register}
                    error={errors?.id}
                />

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Giáo viên</label>
                    <select
                        multiple
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("teachers")}
                        defaultValue={data?.teachers}
                    >
                        {teachers.map((teacher: Teacher) => (
                            <option value={teacher.id} key={teacher.id}>
                                {teacher.name}
                            </option>
                        ))}
                    </select>
                    {errors.teachers?.message && (
                        <p className="text-xs text-red-400">
                            {errors.teachers.message.toString()}
                        </p>
                    )}
                </div>
            </div>

            {error && <span className="text-red-500">{error}</span>}

            <button
                className="bg-blue-400 text-white p-2 rounded-md"
                disabled={isSubmitting}
            >
                {isSubmitting
                    ? "Processing..."
                    : type === "create"
                    ? "Thêm mới"
                    : "Cập nhật"}
            </button>
        </form>
    );
};

export default SubjectForm;
