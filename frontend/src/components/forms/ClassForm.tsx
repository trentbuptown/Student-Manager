"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { classSchema, ClassSchema } from "@/lib/formValidationSchemas";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createClass, updateClass } from "@/services/classService";
import { getAllGrades, Grade } from "@/services/gradeService";
import { getAllTeachers, Teacher } from "@/services/teacherService";

const ClassForm = ({
    type,
    data,
    onSuccess,
}: {
    type: "create" | "update";
    data?: any;
    onSuccess?: () => void;
}) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loadingGrades, setLoadingGrades] = useState(true);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loadingTeachers, setLoadingTeachers] = useState(true);
    const [studentCount, setStudentCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch grades
                setLoadingGrades(true);
                const gradesData = await getAllGrades();
                setGrades(gradesData);
                setLoadingGrades(false);
                
                // Fetch teachers
                setLoadingTeachers(true);
                const teachersData = await getAllTeachers();
                console.log("Tất cả giáo viên:", teachersData);
                
                // Kiểm tra cấu trúc dữ liệu
                if (teachersData.length > 0) {
                    console.log("Mẫu dữ liệu giáo viên:", teachersData[0]);
                    console.log("Kiểu dữ liệu is_gvcn:", typeof teachersData[0].is_gvcn);
                }
                
                // Hàm kiểm tra giáo viên có thể làm chủ nhiệm
                const isEligibleForGVCN = (teacher: any) => {
                    const isGVCN = teacher.is_gvcn;
                    return isGVCN === true || 
                           (typeof isGVCN === 'number' && isGVCN === 1) || 
                           (typeof isGVCN === 'string' && (isGVCN === "1" || isGVCN === "true"));
                };
                
                // Sắp xếp giáo viên: giáo viên chủ nhiệm lên đầu
                const sortedTeachers = [...teachersData].sort((a, b) => {
                    const aEligible = isEligibleForGVCN(a);
                    const bEligible = isEligibleForGVCN(b);
                    
                    if (aEligible && !bEligible) return -1;
                    if (!aEligible && bEligible) return 1;
                    return 0;
                });
                
                console.log("Danh sách giáo viên đã sắp xếp:", sortedTeachers);
                setTeachers(sortedTeachers);
                setLoadingTeachers(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Không thể tải dữ liệu cần thiết");
                setLoadingGrades(false);
                setLoadingTeachers(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Nếu có dữ liệu lớp học và đang ở chế độ cập nhật, lấy số lượng học sinh
        if (data && data.id && type === "update") {
            // Kiểm tra xem dữ liệu có thông tin về học sinh hay không
            if (data.students && Array.isArray(data.students)) {
                setStudentCount(data.students.length);
            } else if (data._count && data._count.students) {
                setStudentCount(data._count.students);
            }
        }
    }, [data, type]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<ClassSchema>({
        resolver: zodResolver(classSchema),
        defaultValues: data ? {
            id: data.id,
            name: data.name,
            gradeId: data.grade_id,
            supervisorId: data.teacher_id?.toString() || '',
        } : undefined,
    });

    const onSubmit = handleSubmit(async (formData) => {
        try {
            setIsSubmitting(true);
            setError(null);

            const dataToSubmit = {
                name: formData.name,
                grade_id: Number(formData.gradeId),
                teacher_id: formData.supervisorId ? Number(formData.supervisorId) : null
            };

            console.log("Submitting data:", dataToSubmit);

            if (type === "create") {
                await createClass(dataToSubmit);
                toast.success("Thêm lớp học thành công");
            } else if (type === "update" && data?.id) {
                await updateClass(data.id, dataToSubmit);
                toast.success("Cập nhật lớp học thành công");
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            console.error(err);
            setError("Đã xảy ra lỗi khi gửi biểu mẫu");
            toast.error("Không thể xử lý yêu cầu của bạn");
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
                {type === "update" && (
                    <div className="flex flex-col gap-2 w-full md:w-1/4">
                        <label className="text-xs text-gray-500">Sĩ số lớp</label>
                        <div className="text-sm text-gray-600 h-10 flex items-center ring-[1.5px] ring-gray-300 p-2 rounded-md">
                            {studentCount || 0} học sinh
                        </div>
                    </div>
                )}
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
                    {loadingTeachers ? (
                        <div className="text-sm text-gray-600 h-10 flex items-center">Đang tải giáo viên...</div>
                    ) : (
                        <select
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                            {...register("supervisorId")}
                            defaultValue={data?.teacher_id?.toString() || ''}
                        >
                            <option value="">-- Chọn giáo viên chủ nhiệm --</option>
                            {teachers.length > 0 ? (
                                teachers.map((teacher) => {
                                    // Kiểm tra xem giáo viên có phải là GVCN không
                                    const isGVCN = teacher.is_gvcn === true || 
                                                 (typeof teacher.is_gvcn === 'number' && teacher.is_gvcn === 1) || 
                                                 (typeof teacher.is_gvcn === 'string' && (teacher.is_gvcn === "1" || teacher.is_gvcn === "true"));
                                    
                                    return (
                                        <option 
                                            value={teacher.id} 
                                            key={teacher.id}
                                            className={isGVCN ? "font-medium text-blue-700" : "text-gray-500"}
                                        >
                                            {teacher.name} {teacher.specialization ? `(${teacher.specialization})` : ''} 
                                            {isGVCN ? " - Có thể làm GVCN" : ""}
                                        </option>
                                    );
                                })
                            ) : (
                                <option value="" disabled>Không có giáo viên</option>
                            )}
                        </select>
                    )}
                    {errors.supervisorId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.supervisorId.message.toString()}
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Khối lớp</label>
                    {loadingGrades ? (
                        <div className="text-sm text-gray-600 h-10 flex items-center">Đang tải khối lớp...</div>
                    ) : (
                        <select
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                            {...register("gradeId")}
                            defaultValue={data?.grade_id}
                        >
                            <option value="">-- Chọn khối lớp --</option>
                            {grades.map((grade) => (
                                <option value={grade.id} key={grade.id}>
                                    {grade.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {errors.gradeId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.gradeId.message.toString()}
                        </p>
                    )}
                </div>
            </div>

            {error && <span className="text-red-500">{error}</span>}

            <button 
                className="bg-blue-400 text-white p-2 rounded-md hover:bg-blue-500 transition-colors"
                disabled={isSubmitting}
            >
                {isSubmitting 
                    ? "Đang xử lý..." 
                    : type === "create" 
                        ? "Thêm mới" 
                        : "Cập nhật"
                }
            </button>
        </form>
    );
};

export default ClassForm;
