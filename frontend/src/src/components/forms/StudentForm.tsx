"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import { classesData } from "@/lib/data";
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
    });

    const imgValue = watch("img");

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
                    defaultValue={
                        data?.birthday
                            ? data.birthday.toISOString().split("T")[0]
                            : ""
                    }
                    register={register}
                    error={errors.birthday}
                    type="date"
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
                        defaultValue={data?.sex}
                    >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                    </select>
                    {errors.sex?.message && (
                        <p className="text-xs text-red-400">
                            {errors.sex.message.toString()}
                        </p>
                    )}
                </div>

                {/* Image Upload Section */}
                <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center mt-2">
                    <label className="text-xs text-gray-500 block mb-2">
                        Ảnh cá nhân
                    </label>
                    <div className="flex items-center gap-4">
                        {/* Show image preview if available */}
                        {imgValue && (
                            <div className="h-20 w-20 relative rounded-md overflow-hidden">
                                <Image
                                    src={imgValue}
                                    alt="Ảnh đại diện"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <CldUploadWidget
                            uploadPreset="school"
                            onSuccess={(result: any, { widget }) => {
                                // Update the form with the image URL
                                const info = result.info;
                                setImgInfo(info);
                                setValue("img", info.secure_url);
                                widget.close();

                                // Show success message
                                toast.success("Tải ảnh thành công");
                            }}
                        >
                            {({ open }) => {
                                return (
                                    <div
                                        className="flex items-center gap-2 cursor-pointer p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                        onClick={() => open()}
                                    >
                                        <Image
                                            src="/upload.png"
                                            alt=""
                                            width={24}
                                            height={24}
                                        />
                                        <span className="text-sm">
                                            {imgValue
                                                ? "Đổi ảnh đại diện"
                                                : "Tải ảnh đại diện"}
                                        </span>
                                    </div>
                                );
                            }}
                        </CldUploadWidget>

                        {/* Add option to remove the image */}
                        {imgValue && (
                            <button
                                type="button"
                                className="text-sm text-red-500 hover:text-red-700"
                                onClick={() => {
                                    setValue("img", "");
                                    setImgInfo(null);
                                }}
                            >
                                Remove
                            </button>
                        )}
                    </div>

                    {/* Hidden input field to store the image URL */}
                    <input type="hidden" {...register("img")} />
                </div>
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

export default StudentForm;
