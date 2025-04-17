"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";

const schema = z.object({
    username: z
        .string()
        .min(3, { message: "Tên người dùng phải chứa ít nhất 4 ký tự. " })
        .max(20, {
            message: "Tên người dùng không được vượt quá 20 ký tự.",
        }),
    email: z.string().email({
        message: "Email không hợp lệ.",
    }),
    password: z
        .string()
        .min(8, { message: "Mật khẩu phải chứa ít nhất 8 ký tự. " }),
    firstName: z.string().min(1, { message: "Vui lòng nhập tên. " }),
    lastName: z.string().min(1, { message: "Vui lòng nhập họ." }),
    phone: z.string().min(1, { message: "Vui lòng nhập số điện thoại. " }),
    address: z.string().min(1, { message: "Vui lòng nhập địa chỉ. " }),
    birthday: z.date({ message: "Vui lòng nhập ngày sinh. " }),
    sex: z.enum(["male", "female"], { message: "Vui lòng nhập giới tính. " }),
    img: z.instanceof(File, { message: "Vui lòng nhập hình ảnh. " }),
});

const TeacherForm = ({
    type,
    data,
}: {
    type: "create" | "update";
    data?: any;
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = handleSubmit((data) => {
        console.log(data);
    });

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <div className="flex items-center gap-2">
                <Image src="/adduser.png" alt="" width={40} height={40} />
                <h1 className="text-xl font-semibold"> Thêm giáo viên mới</h1>
            </div>
            <span className="text-xs text-gray-400 font-medium">
                Thông tin xác thực
            </span>
            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Tên người dùng "
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
                    label="Mật khẩu "
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
                    label="Tên"
                    name="firstName"
                    defaultValue={data?.firstName}
                    register={register}
                    error={errors.firstName}
                />
                <InputField
                    label="Họ"
                    name="lastName"
                    defaultValue={data?.lastName}
                    register={register}
                    error={errors.lastName}
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
                    defaultValue={data?.birthday}
                    register={register}
                    error={errors.birthday}
                    type="date"
                />
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Giới tính</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("sex")}
                        defaultValue={data?.sex}
                    >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                    </select>
                    {errors.sex?.message && (
                        <p className="text-xs text-red-400">
                            {errors.sex.message.toString()}
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center mt-2">
                    <label
                        className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
                        htmlFor="img"
                    >
                        <Image
                            src="/upload.png"
                            alt=""
                            width={28}
                            height={28}
                        />
                        <span>Upload a photo</span>
                    </label>
                    <input
                        type="file"
                        id="img"
                        {...register("img")}
                        className="hidden"
                    />
                    {errors.img?.message && (
                        <p className="text-xs text-red-400">
                            {errors.img.message.toString()}
                        </p>
                    )}
                </div>
            </div>
            <button className="bg-blue-400 text-white p-2 rounded-md">
                {type === "create" ? "Create" : "Update"}
            </button>
        </form>
    );
};

export default TeacherForm;
