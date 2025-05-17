"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import dynamic from "next/dynamic";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import { classesData } from "@/lib/data";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Tải động CldUploadWidget để tránh lỗi khi không có cấu hình
const CldUploadWidget = dynamic(
  () => import('next-cloudinary').then((mod) => mod.CldUploadWidget),
  { 
    ssr: false,
    loading: () => <p>Đang tải...</p>
  }
);

type Class = {
    id: number;
    name: string;
    capacity: number;
    grade: number;
    supervisor: string;
};

const StudentForm = ({
    type,
    data,
    classes = classesData,
}: {
    type: "create" | "update";
    data?: any;
    classes?: Class[];
}) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cloudinaryAvailable, setCloudinaryAvailable] = useState(false);

    // Kiểm tra xem Cloudinary có được cấu hình không
    useEffect(() => {
        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            if (cloudName && cloudName !== 'your_cloud_name') {
                setCloudinaryAvailable(true);
            } else {
                setCloudinaryAvailable(false);
                console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME không được cấu hình hoặc chưa được thay đổi khỏi giá trị mặc định');
            }
        } catch (error) {
            setCloudinaryAvailable(false);
            console.error('Lỗi khi kiểm tra cấu hình Cloudinary:', error);
        }
    }, []);

    // Save the uploaded image info
    const [imgInfo, setImgInfo] = useState<any>(data?.imgInfo || null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm({
        resolver: zodResolver(studentSchema),
        defaultValues: data || {}
    });

    const imgValue = watch("img");

    // Xử lý tải ảnh lên bằng input file thông thường
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Giả lập URL ảnh từ file
        const imageUrl = URL.createObjectURL(file);
        setValue("img", imageUrl);
        setImgInfo({ 
            original_filename: file.name,
            secure_url: imageUrl
        });
        
        toast.success("Tải ảnh thành công (chế độ giả lập)");
    };

    const onSubmit = handleSubmit(async (formData) => {
        try {
            setIsSubmitting(true);
            setError(null);

            // Add the image information to the form data
            const dataToSubmit = {
                ...formData,
                imgInfo: imgInfo, // Include the complete image info object
            };

            console.log("Submitting data:", dataToSubmit);

            // Add logic to send data to API here
            // const response = await fetch('/api/students', {
            //   method: type === "create" ? "POST" : "PUT",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify(dataToSubmit)
            // });

            toast.success(
                type === "create"
                    ? "Thêm học sinh thành công"
                    : "Cập nhật học sinh thành công"
            );

            // Redirect after successful creation/update
            // router.push("/students");
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
                        ? "Thêm học sinh mới"
                        : "Chỉnh sửa học sinh"}
                </h1>
            </div>
            <span className="text-xs text-gray-400 font-medium">
                Thông tin xác thực
            </span>
            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Tên người dùng"
                    name="username"
                    defaultValue={data?.username}
                    register={register}
                    error={errors?.username}
                />
                <InputField
                    label="Email"
                    name="email"
                    defaultValue={data?.email}
                    register={register}
                    error={errors?.email}
                />
                <InputField
                    label="Mật khẩu"
                    name="password"
                    type="password"
                    defaultValue={data?.password}
                    register={register}
                    error={errors?.password}
                />
            </div>
            <span className="text-xs text-gray-400 font-medium">
                Personal Information
            </span>
            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Mã học sinh"
                    name="id"
                    defaultValue={data?.studentId}
                    register={register}
                    error={errors?.id}
                />
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
                <InputField
                    label="Tên"
                    name="name"
                    defaultValue={data?.name}
                    register={register}
                    error={errors.name}
                />
                <InputField
                    label="Họ"
                    name="surname"
                    defaultValue={data?.surname}
                    register={register}
                    error={errors.surname}
                />
                <InputField
                    label="Số điện thoại"
                    name="phone"
                    defaultValue={data?.phone}
                    register={register}
                    error={errors.phone}
                />
                <InputField
                    label="Địa chỉ"
                    name="address"
                    defaultValue={data?.address}
                    register={register}
                    error={errors.address}
                />
                <InputField
                    label="Ngày sinh"
                    name="birthday"
                    type="date"
                    defaultValue={data?.birthday}
                    register={register}
                    error={errors.birthday}
                />
                <InputField
                    label="Tên phụ huynh"
                    name="parentId"
                    defaultValue={data?.parentId}
                    register={register}
                    error={errors.parentId}
                />

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Giới tính</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("sex")}
                        defaultValue={data?.sex || "MALE"}
                    >
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                    </select>
                    {errors.sex?.message && (
                        <p className="text-xs text-red-400">
                            {errors.sex.message.toString()}
                        </p>
                    )}
                </div>
            </div>
            <span className="text-xs text-gray-400 font-medium">
                Ảnh đại diện
            </span>
            <div className="flex flex-col gap-4">
                {/* Hiển thị ảnh đã tải lên */}
                {imgValue && (
                    <div className="flex flex-col items-center gap-2">
                        <Image
                            src={imgValue}
                            alt="Avatar"
                            width={100}
                            height={100}
                            className="rounded-full object-cover w-[100px] h-[100px]"
                            onError={() => {
                                setValue("img", "");
                                setImgInfo(null);
                            }}
                        />
                        <p className="text-xs text-gray-500">
                            {imgInfo?.original_filename || "Ảnh đại diện"}
                        </p>
                    </div>
                )}

                {/* Tùy chọn tải lên */}
                <div className="flex flex-col gap-2">
                    {cloudinaryAvailable ? (
                        <CldUploadWidget
                            uploadPreset="student_manager"
                            options={{
                                maxFiles: 1,
                                resourceType: "image",
                                folder: "student_manager/avatars",
                            }}
                            onSuccess={(result: any) => {
                                if (result.info) {
                                    setValue("img", result.info.secure_url);
                                    setImgInfo(result.info);
                                    toast.success("Tải ảnh thành công");
                                }
                            }}
                        >
                            {({ open }) => (
                                <button
                                    type="button"
                                    onClick={() => open()}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition w-fit"
                                >
                                    Tải ảnh lên
                                </button>
                            )}
                        </CldUploadWidget>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-amber-600">
                                Chế độ giả lập: Cloudinary chưa được cấu hình
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                        </div>
                    )}
                </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition w-fit self-end"
                disabled={isSubmitting}
            >
                {isSubmitting
                    ? "Đang xử lý..."
                    : type === "create"
                    ? "Thêm học sinh"
                    : "Cập nhật"}
            </button>
        </form>
    );
};

export default StudentForm;
