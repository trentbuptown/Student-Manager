"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { teachersData } from "@/lib/data";
import Image from "next/image";
import subjectService from '@/services/subjectService';
import { getAllTeachers, Teacher as TeacherInterface } from '@/services/teacherService';

const SubjectForm = ({
    type,
    data,
    onSuccess
}: {
    type: "create" | "update";
    data?: any;
    onSuccess?: () => void;
}) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [teachersList, setTeachersList] = useState<TeacherInterface[]>([]);
    const [loadingTeachers, setLoadingTeachers] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SubjectSchema>({
        resolver: zodResolver(subjectSchema),
        defaultValues: data
            ? {
                  id: data.id,
                  name: data.name,
                  teachers: data.teachers,
                  code: type === 'update' ? String(data.id) : data.code,
                  description: data.description,
              }
            : undefined,
    });

    useEffect(() => {
        const fetchTeachers = async () => {
            setLoadingTeachers(true);
            const fetchedTeachers = await getAllTeachers();
            setTeachersList(fetchedTeachers);
            setLoadingTeachers(false);
        };
        fetchTeachers();
    }, []);

    const onSubmit = handleSubmit(async (formData) => {
        try {
            setIsSubmitting(true);
            setError(null);

            console.log(formData);

            if (type === 'create') {
                await subjectService.create({
                    name: formData.name,
                    code: formData.code,
                    description: formData.description,
                });
            } else if (type === 'update' && formData.id) {
                await subjectService.update(formData.id, {
                     name: formData.name,
                    code: formData.code,
                    description: formData.description,
                });
            }

            toast.success(
                type === "create"
                    ? "Tạo môn học thành công"
                    : "Cập nhật môn học thành công"
            );

            if (onSuccess) {
                console.log('onSuccess called from SubjectForm');
                onSuccess();
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Something went wrong when submitting the form");
            toast.error(err.response?.data?.message || "Failed to process your request");
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
                    name="code"
                    defaultValue={type === 'update' ? String(data?.id) : data?.code}
                    register={register}
                    error={errors?.code}
                />

                <InputField
                    label="Mô tả"
                    name="description"
                    defaultValue={data?.description}
                    register={register}
                    error={errors?.description}
                />

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Giáo viên</label>
                    {loadingTeachers ? (
                        <div>Đang tải giáo viên...</div>
                    ) : (
                        <select
                            multiple
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                            {...register("teachers")}
                            defaultValue={data?.teachers}
                        >
                            {teachersList.map((teacher) => (
                                <option value={teacher.id} key={teacher.id}>
                                    {teacher.name}
                                </option>
                            ))}
                        </select>
                    )}
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
