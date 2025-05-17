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
import { createTeacher, updateTeacher } from "@/services/teacherService";

// Tải động CldUploadWidget để tránh lỗi khi không có cấu hình
const CldUploadWidget = dynamic(
  () => import('next-cloudinary').then((mod) => mod.CldUploadWidget),
  { 
    ssr: false,
    loading: () => <p>Đang tải...</p>,
    // Xử lý lỗi khi không thể tải component
    onError: (err) => {
      console.error("Không thể tải CldUploadWidget:", err);
      return <p>Không thể tải widget tải lên</p>;
    }
  }
);

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
    } = useForm({
        // resolver: zodResolver(teacherSchema),
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
            const teacherData = {
                name: formData.name,
                specialization: formData.specialization,
                is_gvcn: formData.is_gvcn,
                user_id: formData.user_id || 0, // 0 là giá trị mặc định, sẽ được thay thế bởi API
                user: {
                    name: formData.user_name,
                    email: formData.email,
                    username: formData.username,
                    password: formData.password, // Chỉ cần cho tạo mới
                    phone: formData.phone,
                    address: formData.address,
                    birthday: formData.birthday,
                    sex: formData.sex,
                    profile_photo: formData.profile_photo
                }
            };

            console.log("Submitting data:", teacherData);

            // Gọi API tạo hoặc cập nhật giáo viên
            let response;
            if (type === "create") {
                response = await createTeacher(teacherData);
            } else {
                response = await updateTeacher(data.id, teacherData);
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
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <div className="flex items-center gap-2">
                <Image src="/adduser.png" alt="" width={40} height={40} />
                <h1 className="text-xl font-semibold">
                    {type === "create"
                        ? "Thêm giáo viên mới"
                        : "Chỉnh sửa giáo viên"}
                </h1>
            </div>
            <span className="text-xs text-gray-400 font-medium">
                Thông tin giáo viên
            </span>
            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Họ và tên"
                    name="name"
                    defaultValue={data?.name}
                    register={register}
                    error={errors?.name}
                />
                <InputField
                    label="Chuyên môn"
                    name="specialization"
                    defaultValue={data?.specialization}
                    register={register}
                    error={errors?.specialization}
                />
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Chủ nhiệm</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("is_gvcn")}
                        defaultValue={data?.is_gvcn ? "true" : "false"}
                    >
                        <option value="true">Có</option>
                        <option value="false">Không</option>
                    </select>
                    {errors.is_gvcn?.message && (
                        <p className="text-xs text-red-400">
                            {errors.is_gvcn.message.toString()}
                        </p>
                    )}
                </div>
            </div>
            <span className="text-xs text-gray-400 font-medium">
                Thông tin tài khoản
            </span>
            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Tên người dùng"
                    name="username"
                    defaultValue={data?.user?.username}
                    register={register}
                    error={errors?.username}
                />
                <InputField
                    label="Email"
                    name="email"
                    defaultValue={data?.user?.email}
                    register={register}
                    error={errors?.email}
                />
                {type === "create" && (
                    <InputField
                        label="Mật khẩu"
                        name="password"
                        type="password"
                        defaultValue=""
                        register={register}
                        error={errors?.password}
                    />
                )}
            </div>
            <span className="text-xs text-gray-400 font-medium">
                Thông tin cá nhân
            </span>
            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Tên hiển thị"
                    name="user_name"
                    defaultValue={data?.user?.name}
                    register={register}
                    error={errors?.user_name}
                />
                <InputField
                    label="Số điện thoại"
                    name="phone"
                    defaultValue={data?.user?.phone}
                    register={register}
                    error={errors?.phone}
                />
                <InputField
                    label="Địa chỉ"
                    name="address"
                    defaultValue={data?.user?.address}
                    register={register}
                    error={errors?.address}
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
                />
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Giới tính</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("sex")}
                        defaultValue={data?.user?.sex || "MALE"}
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
                                setValue("profile_photo", "");
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
                    ? "Thêm giáo viên"
                    : "Cập nhật"}
            </button>
        </form>
    );
};

export default TeacherForm;
