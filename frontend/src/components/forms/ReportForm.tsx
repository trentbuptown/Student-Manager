"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { reportSchema, ReportSchema } from "@/lib/formValidationSchemas";
import { classesData, subjectsData } from "@/lib/data";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Class = {
    id: number;
    name: string;
    capacity: number;
    grade: number;
    supervisor: string;
};

type Subject = {
    id: number;
    subjectId: string;
    name: string;
    teachers: string[];
};

const ReportForm = ({
    type,
    data,
    classes = classesData,
    subjects = subjectsData,
}: {
    type: "create" | "update";
    data?: any;
    classes?: Class[];
    subjects?: Subject[];
}) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Save the uploaded image info
    const [imgInfo, setImgInfo] = useState<any>(data?.imgInfo || null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm({
        resolver: zodResolver(reportSchema),
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
                    ? "Thêm điểm thành công"
                    : "Cập nhật điểm thành công"
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
                        ? "Thêm báo cáo mới"
                        : "Chỉnh sửa báo cáo"}
                </h1>
            </div>
            <span className="text-xs text-gray-400 font-medium">
                Báo cáo điểm học sinh
            </span>
            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Học sinh"
                    name="student"
                    defaultValue={data?.student}
                    register={register}
                    error={errors.studentId}
                />
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Lớp</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("classId")}
                        defaultValue={data?.classId}
                    >
                        {classes.map((classItem: Class) => (
                            <option value={classItem.id} key={classItem.id}>
                                {classItem.name}
                            </option>
                        ))}
                    </select>
                    {errors.classId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.classId.message.toString()}
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Môn học</label>
                    <select
                        multiple
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("subjectId")}
                        defaultValue={data?.subjects}
                    >
                        {subjects.map(
                            (subject: { id: number; name: string }) => (
                                <option value={subject.id} key={subject.id}>
                                    {subject.name}
                                </option>
                            )
                        )}
                    </select>
                    {errors.subjectId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.subjectId.message.toString()}
                        </p>
                    )}
                </div>
                <InputField
                    label="Điểm 15 phút"
                    name="fifteenScore"
                    defaultValue={data?.fifteenScore}
                    register={register}
                    error={errors.fifteenMinExam}
                    type="number"
                />
                <InputField
                    label="Điểm 1 tiết"
                    name="midtermScore"
                    defaultValue={data?.midtermScore}
                    register={register}
                    error={errors.midtermExam}
                    type="number"
                />
                <InputField
                    label="Điểm cuối kỳ"
                    name="finalScore"
                    defaultValue={data?.finalScore}
                    register={register}
                    error={errors.finalExam}
                    type="number"
                />
                <InputField
                    label="Điểm tổng kết"
                    name="averageScore"
                    defaultValue={data?.averageScore}
                    register={register}
                    error={errors.average}
                    type="number"
                />
                <InputField
                    label="Hạnh kiểm"
                    name="behavior"
                    defaultValue={data?.behavior}
                    register={register}
                    error={errors.behavior}
                    type="number"
                />
            </div>

            {error && <span className="text-red-500">{error}</span>}

            <button
                className="bg-blue-400 text-white p-2 rounded-md hover:bg-blue-500 transition-colors disabled:bg-gray-300"
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

export default ReportForm;
