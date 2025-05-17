"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import dynamic from "next/dynamic";
import { teacherSchema } from "@/lib/formValidationSchemas";
import { subjectsData } from "@/lib/data";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createTeacher, updateTeacher, TeacherCreateParams, TeacherUpdateParams } from "@/services/teacherService";

// Tải động CldUploadWidget để tránh lỗi khi không có cấu hình
const CldUploadWidget = dynamic(
  () => import('next-cloudinary').then((mod) => mod.CldUploadWidget),
  { 
    ssr: false,
    loading: () => <p>Đang tải...</p>,
    // Xử lý lỗi khi không thể tải component
    onError: (err: Error) => {
      console.error("Không thể tải CldUploadWidget:", err);
      return <p>Không thể tải widget tải lên</p>;
    }
  } as any // Sử dụng any để tránh lỗi về onError không tồn tại trong kiểu
);

// Định nghĩa kiểu dữ liệu cho form
interface TeacherFormData {
    id?: number;
    name: string;
    specialization: string;
    is_gvcn: boolean | "true" | "false";
    user_id?: number;
    user_name: string;
    email: string;
    username?: string;
    password?: string;
    phone?: string;
    address?: string;
    birthday?: string;
    sex: "MALE" | "FEMALE";
    profile_photo?: string;
}

type Subject = {
    id: number;
    subjectId: string;
    name: string;
    teachers: string[];
};

const TeacherForm = ({
    type,
    data,
    subjects = subjectsData,
    onSuccess,
}: {
    type: "create" | "update";
    data?: any;
    subjects?: Subject[];
    onSuccess?: () => void;
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
    const [imgInfo, setImgInfo] = useState<any>(data?.user?.profile_photo || null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<TeacherFormData>({
        resolver: zodResolver(teacherSchema),
        // If data exists, use it as default values
        defaultValues: data
            ? {
                  id: data.id,
                  name: data.name,
                  specialization: data.specialization,
                  is_gvcn: data.is_gvcn,
                  user_id: data.user_id,
                  // Thông tin user
                  user_name: data.user?.name,
                  email: data.user?.email,
                  username: data.user?.username,
                  phone: data.user?.phone,
                  address: data.user?.address,
                  birthday: data.user?.birthday ? new Date(data.user.birthday).toISOString().split('T')[0] : undefined,
                  sex: data.user?.sex || 'MALE',
                  profile_photo: data.user?.profile_photo,
              }
            : undefined,
    });

    // Watch the image URL to display a preview
    const imgValue = watch("profile_photo");

    // Xử lý tải ảnh lên bằng input file thông thường
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Giả lập URL ảnh từ file
        const imageUrl = URL.createObjectURL(file);
        setValue("profile_photo", imageUrl);
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

            // Chuẩn bị dữ liệu gửi đi
            const teacherData: TeacherCreateParams | TeacherUpdateParams = {
                name: formData.name.trim(),
                specialization: formData.specialization.trim(),
                is_gvcn: formData.is_gvcn === "true" || formData.is_gvcn === true,
                user_id: parseInt(String(formData.user_id)) || 0,
                phone: formData.phone?.trim(),
                address: formData.address?.trim(),
                user: {
                    name: formData.user_name.trim(),
                    email: formData.email.trim(),
                    username: formData.username?.trim(),
                    password: type === "create" ? formData.password : undefined,
                    birthday: formData.birthday,
                    sex: formData.sex,
                    profile_photo: formData.profile_photo
                }
            };

            // Xóa các trường không cần thiết nếu không có giá trị
            if (!teacherData.phone) delete teacherData.phone;
            if (!teacherData.address) delete teacherData.address;
            if (teacherData.user) {
                if (!teacherData.user.username) delete teacherData.user.username;
                if (!teacherData.user.birthday) delete teacherData.user.birthday;
                if (!teacherData.user.profile_photo) delete teacherData.user.profile_photo;
            }

            console.log("Submitting data:", JSON.stringify(teacherData));

            // Gọi API tạo hoặc cập nhật giáo viên
            let response;
            if (type === "create") {
                response = await createTeacher(teacherData as TeacherCreateParams);
            } else {
                response = await updateTeacher(data.id, teacherData as TeacherUpdateParams);
            }

            if (response) {
                toast.success(
                    type === "create"
                        ? "Thêm giáo viên thành công"
                        : "Cập nhật giáo viên thành công"
                );
                
                // Refresh dữ liệu
                router.refresh();
                
                // Gọi callback nếu có
                if (onSuccess) {
                    onSuccess();
                }
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
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
            <div className="flex items-center gap-2 mb-2 border-b pb-2">
                <Image src="/adduser.png" alt="" width={28} height={28} className="rounded-md" />
                <h1 className="text-lg font-semibold text-blue-700">
                    {type === "create"
                        ? "Thêm giáo viên mới"
                        : "Chỉnh sửa giáo viên"}
                </h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Cột trái: Thông tin giáo viên và tài khoản */}
                <div className="flex flex-col gap-3">
                    {/* Thông tin giáo viên */}
                    <div className="border border-gray-200 p-3 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
                        <h2 className="text-sm font-medium mb-2 text-gray-700 border-b pb-1">Thông tin giáo viên</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <InputField
                                label="Họ và tên"
                                name="name"
                                defaultValue={data?.name}
                                register={register}
                                error={errors?.name}
                                placeholder="Nhập họ và tên giáo viên"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                }
                            />
                            <InputField
                                label="Chuyên môn"
                                name="specialization"
                                defaultValue={data?.specialization}
                                register={register}
                                error={errors?.specialization}
                                placeholder="Nhập chuyên môn giảng dạy"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                    </svg>
                                }
                            />
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-600">Chủ nhiệm</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <select
                                        className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:outline-none transition-all duration-150 hover:ring-gray-400"
                                        {...register("is_gvcn")}
                                        defaultValue={data?.is_gvcn ? "true" : "false"}
                                    >
                                        <option value="true">Có</option>
                                        <option value="false">Không</option>
                                    </select>
                                </div>
                                {errors.is_gvcn?.message && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        {errors.is_gvcn.message.toString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Thông tin tài khoản */}
                    <div className="border border-gray-200 p-3 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
                        <h2 className="text-sm font-medium mb-2 text-gray-700 border-b pb-1">Thông tin tài khoản</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <InputField
                                    label="Email"
                                    name="email"
                                    defaultValue={data?.user?.email}
                                    register={register}
                                    error={errors?.email}
                                    placeholder="email@example.com"
                                    icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    }
                                />
                                <InputField
                                    label="Tên người dùng"
                                    name="username"
                                    defaultValue={data?.user?.username}
                                    register={register}
                                    error={errors?.username}
                                    placeholder="username"
                                    icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {type === "create" && (
                                    <InputField
                                        label="Mật khẩu"
                                        name="password"
                                        type="password"
                                        defaultValue=""
                                        register={register}
                                        error={errors?.password}
                                        placeholder="••••••••"
                                        icon={
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        }
                                    />
                                )}
                                <InputField
                                    label="Tên hiển thị"
                                    name="user_name"
                                    defaultValue={data?.user?.name}
                                    register={register}
                                    error={errors?.user_name}
                                    placeholder="Tên hiển thị"
                                    icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Thông tin liên hệ, cá nhân và ảnh đại diện */}
                <div className="flex flex-col gap-3">
                    {/* Thông tin liên hệ và cá nhân */}
                    <div className="border border-gray-200 p-3 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
                        <h2 className="text-sm font-medium mb-2 text-gray-700 border-b pb-1">Thông tin liên hệ & cá nhân</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <InputField
                                label="Số điện thoại"
                                name="phone"
                                defaultValue={data?.phone}
                                register={register}
                                error={errors?.phone}
                                placeholder="0123456789"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                }
                            />
                            <InputField
                                label="Địa chỉ"
                                name="address"
                                defaultValue={data?.address}
                                register={register}
                                error={errors?.address}
                                placeholder="Địa chỉ liên hệ"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                }
                            />
                            <InputField
                                label="Ngày sinh"
                                name="birthday"
                                type="date"
                                defaultValue={
                                    data?.user?.birthday
                                        ? new Date(data.user.birthday)
                                            .toISOString()
                                            .split("T")[0]
                                        : undefined
                                }
                                register={register}
                                error={errors?.birthday}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                }
                            />
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-600">Giới tính</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <select
                                        className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:outline-none transition-all duration-150 hover:ring-gray-400"
                                        {...register("sex")}
                                        defaultValue={data?.user?.sex || "MALE"}
                                    >
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                    </select>
                                </div>
                                {errors.sex?.message && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        {errors.sex.message.toString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Ảnh đại diện */}
                    <div className="border border-gray-200 p-3 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
                        <h2 className="text-sm font-medium mb-2 text-gray-700 border-b pb-1">Ảnh đại diện</h2>
                        <div className="flex items-center gap-4">
                            {/* Hiển thị ảnh đã tải lên */}
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-[80px] h-[80px] rounded-full border-2 border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50">
                                    {imgValue ? (
                                        <Image
                                            src={imgValue}
                                            alt="Avatar"
                                            width={80}
                                            height={80}
                                            className="object-cover w-full h-full"
                                            onError={() => {
                                                setValue("profile_photo", "");
                                                setImgInfo(null);
                                            }}
                                        />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                </div>
                                {imgInfo && (
                                    <p className="text-xs text-gray-500 text-center">
                                        {imgInfo?.original_filename || "Ảnh đại diện"}
                                    </p>
                                )}
                            </div>

                            {/* Tùy chọn tải lên */}
                            <div className="flex-1">
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
                                                setValue("profile_photo", result.info.secure_url);
                                                setImgInfo(result.info);
                                                toast.success("Tải ảnh thành công");
                                            }
                                        }}
                                        onError={(error: any) => {
                                            console.error("Lỗi khi tải ảnh:", error);
                                            toast.error("Không thể tải ảnh lên");
                                        }}
                                    >
                                        {({ open }) => (
                                            <button
                                                type="button"
                                                onClick={() => open()}
                                                className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-md hover:bg-blue-600 transition flex items-center gap-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                                                </svg>
                                                Tải ảnh lên
                                            </button>
                                        )}
                                    </CldUploadWidget>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs text-amber-600 mb-1">
                                            Chế độ giả lập: Cloudinary chưa được cấu hình
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="block w-full text-sm text-gray-500
                                            file:mr-3 file:py-1.5 file:px-3
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-medium
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100 cursor-pointer"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-3 mt-2 border-t pt-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="bg-gray-100 text-gray-700 px-4 py-2 text-sm rounded-md hover:bg-gray-200 transition flex items-center gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Hủy
                </button>
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-600 transition flex items-center gap-1"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {type === "create" ? "Thêm giáo viên" : "Cập nhật"}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default TeacherForm;
