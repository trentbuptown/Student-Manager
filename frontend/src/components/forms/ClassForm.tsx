"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { classSchema, ClassSchema } from "@/lib/formValidationSchemas";
import { teachersData, classesData } from "@/lib/data";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

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
type Class = {
    id: number;
    name: string;
    capacity: number;
    grade: number;
    supervisor: string;
    _count?: { students: number };
};

const ClassForm = ({
    type,
    data,
    teachers = teachersData,
    classes = classesData,
}: {
    type: "create" | "update";
    data?: any;
    teachers?: Teacher[];
    classes?: Class[];
}) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<ClassSchema>({
        resolver: zodResolver(classSchema),
    });

    const onSubmit = handleSubmit(async (formData) => {
        try {
            setIsSubmitting(true);
            setError(null);

            // Add the image information to the form data
            const dataToSubmit = {
                ...formData,
            };

            console.log("Submitting data:", dataToSubmit);

            // Add logic to send data to API here
            // const response = await fetch('/api/teachers', {
            //   method: type === "create" ? "POST" : "PUT",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify(dataToSubmit)
            // });

            toast.success(
                type === "create"
                    ? "Thêm lớp học thành công"
                    : "Cập nhật lớp học thành công"
            );

            // Redirect after successful creation/update
            // router.push("/teachers");
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
                        ? "Thêm lớp học mới"
                        : "Chỉnh sửa lớp học "}
                </h1>
            </div>

            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Lớp học"
                    name="name"
                    defaultValue={data?.name}
                    register={register}
                    error={errors?.name}
                />
                <InputField
                    label="Số lượng "
                    name="capacity"
                    defaultValue={data?.capacity}
                    register={register}
                    error={errors?.capacity}
                />
                {data && (
                    <InputField
                        label="Id lớp"
                        name="id"
                        defaultValue={data?.id}
                        register={register}
                        error={errors?.id}
                    />
                )}
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">
                        Giáo viên chủ nhiệm
                    </label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("supervisorId")}
                        defaultValue={data?.teachers}
                    >
                        {teachers.map((teacher: Teacher) => (
                            <option value={teacher.id} key={teacher.id}>
                                {teacher.name}
                            </option>
                        ))}
                    </select>
                    {errors.supervisorId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.supervisorId.message.toString()}
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Khối lớp</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("gradeId")}
                        defaultValue={data?.gradeId}
                    >
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                    </select>
                    {errors.gradeId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.gradeId.message.toString()}
                        </p>
                    )}
                </div>
            </div>

            <button className="bg-blue-400 text-white p-2 rounded-md">
                {type === "create" ? "Thêm mới" : "Cập nhật"}
            </button>
        </form>
    );
};

export default ClassForm;
