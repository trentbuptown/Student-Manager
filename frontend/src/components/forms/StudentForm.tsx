"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { studentSchema, StudentFormData } from "@/lib/formValidationSchemas";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createStudent, updateStudent, StudentCreateParams, StudentUpdateParams, checkApiConnection, createStudentWithUser } from "@/services/studentService";
import { getClasses, Class } from "@/services/classService";
import axios from "axios";
import { isAdmin } from "@/services/auth.service";
import axiosClient from "@/services/axiosClient";

// Định nghĩa kiểu dữ liệu cho form
interface StudentFormProps {
    type: "create" | "update";
    data?: StudentFormData; // Bỏ phần user vì chúng ta đã truyền trực tiếp các trường username và email
    onSuccess?: () => void;
}

const StudentForm = ({
    type,
    data,
    onSuccess
}: StudentFormProps) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [apiConnected, setApiConnected] = useState<boolean | null>(null);

    // Kiểm tra kết nối API
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const isConnected = await checkApiConnection();
                setApiConnected(isConnected);
                if (!isConnected) {
                    toast.error("Không thể kết nối tới máy chủ API. Vui lòng kiểm tra kết nối của bạn.");
                }
            } catch (error) {
                console.error("Error checking API connection:", error);
                setApiConnected(false);
                toast.error("Không thể kết nối tới máy chủ API. Vui lòng kiểm tra kết nối của bạn.");
            }
        };

        checkConnection();
    }, []);

    // Lấy danh sách lớp học
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setLoadingClasses(true);
                const classesData = await getClasses();
                setClasses(Array.isArray(classesData) ? classesData : []);
            } catch (error) {
                console.error("Error fetching classes:", error);
                toast.error("Không thể tải danh sách lớp học");
                setClasses([]);
            } finally {
                setLoadingClasses(false);
            }
        };

        fetchClasses();
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm<StudentFormData>({
        resolver: zodResolver(studentSchema),
        defaultValues: {
            name: data?.name || "",
            birth_date: data?.birth_date || "",
            gender: data?.gender || "male",
            phone: data?.phone || "",
            class_id: data?.class_id || 0,
            email: data?.email || "",
            username: data?.username || ""
        }
    });

    // Tải thông tin học sinh khi component được tạo hoặc dữ liệu thay đổi
    useEffect(() => {
        if (type === "update" && data) {
            console.log("Loading existing student data:", data);
            
            // Format ngày sinh về định dạng YYYY-MM-DD
            let formattedBirthDate = data.birth_date || "";
            if (formattedBirthDate) {
                try {
                    // Nếu là string đại diện ngày, chuyển sang đối tượng Date
                    const date = new Date(formattedBirthDate);
                    if (!isNaN(date.getTime())) { // Kiểm tra xem date có hợp lệ không
                        // Chuyển về định dạng YYYY-MM-DD cho input type="date"
                        formattedBirthDate = date.toISOString().split('T')[0];
                        console.log("Formatted birth date:", formattedBirthDate);
                    } else {
                        console.error("Invalid date:", formattedBirthDate);
                    }
                } catch (e) {
                    console.error("Error formatting birth date:", e);
                }
            }
            
            // Đảm bảo các trường được cập nhật khi data thay đổi
            setValue("name", data.name || "");
            setValue("birth_date", formattedBirthDate);
            setValue("gender", data.gender || "male");
            setValue("phone", data.phone || "");
            setValue("class_id", data.class_id || 0);
            
            // Thiết lập thông tin tài khoản trực tiếp từ data
            console.log("Setting account info - email:", data.email, "username:", data.username);
            setValue("email", data.email || "");
            setValue("username", data.username || "");
        }
    }, [data, type, setValue]);

    // Quan sát các giá trị form để debug
    const watchedValues = watch();
    useEffect(() => {
        if (type === "update") {
            console.log("Current form values:", watchedValues);
        }
    }, [watchedValues, type]);

    // Log để kiểm tra form state
    console.log("Form errors state:", errors);
    
    // Thêm log để kiểm tra các giá trị form
    console.log("Form values:", watchedValues);

    const onSubmit = handleSubmit(async (formData) => {
        try {
            setIsSubmitting(true);
            setError(null);

            console.log("Form data submitted:", formData);
            console.log("Form validation errors:", errors);

            // Kiểm tra các trường bắt buộc
            if (!formData.name || !formData.birth_date || !formData.gender || !formData.class_id || !formData.email) {
                console.error("Missing required fields:", {
                    name: !formData.name,
                    birth_date: !formData.birth_date,
                    gender: !formData.gender,
                    class_id: !formData.class_id,
                    email: !formData.email
                });
                throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc");
            }

            // Chuẩn bị dữ liệu gửi đi
            let response: any;
            if (type === "create") {
                // Tạo student với user mới 
                console.log("Preparing student creation with new user account");
                
                // Chuẩn bị dữ liệu student với user mới
                // Chú ý: Sử dụng username làm tên đăng nhập trong hệ thống, name là họ tên đầy đủ
                const studentData: StudentCreateParams = {
                    name: formData.name.trim(), // Họ tên đầy đủ của học sinh
                    birth_date: formData.birth_date,
                    gender: formData.gender,
                    phone: formData.phone?.trim() || "",
                    class_id: formData.class_id,
                    user_id: 0, // Sẽ được backend tạo mới
                    user: {
                        name: formData.username?.trim() || formData.name.trim(), // Tên đăng nhập
                        email: formData.email,
                        password: formData.password || "password123" // Mật khẩu mặc định nếu không được cung cấp
                    }
                };

                // Đảm bảo user object tồn tại và password đủ dài
                if (studentData.user) {
                    if (!studentData.user.password || studentData.user.password.length < 8) {
                        studentData.user.password = "password123"; // Sử dụng mật khẩu mặc định nếu không đủ độ dài
                    }
                }

                console.log("Student data to be sent to /students API:", studentData);
                try {
                    // Sử dụng service createStudent để gọi API /students thay vì /register
                    const createResponse = await createStudent(studentData);
                    console.log("Student creation successful:", createResponse);
                    response = createResponse;
                } catch (error: any) {
                    console.error("Student creation failed:", error);
                    // Lỗi đã được xử lý trong service createStudent
                    throw error;
                }
            } else {
                console.log("Calling updateStudent API...");
                // Chuẩn bị dữ liệu cập nhật học sinh
                const studentData: StudentUpdateParams = {
                    name: formData.name.trim(),
                    birth_date: formData.birth_date,
                    gender: formData.gender,
                    phone: formData.phone?.trim() || "",
                    class_id: formData.class_id,
                    // Thêm thông tin tài khoản để cập nhật
                    email: formData.email.trim(),
                    username: formData.username?.trim()
                };
                
                console.log("Updating student with ID:", data?.id, "Data:", studentData);
                try {
                    // Sử dụng service updateStudent
                    response = await updateStudent(data?.id || 0, studentData);
                    console.log("Student update successful:", response);
                } catch (error: any) {
                    console.error("Student update failed:", error);
                    if (error.response?.status === 403) {
                        toast.error("Tài khoản của bạn không có quyền cập nhật học sinh.");
                    }
                    throw error;
                }
            }

            console.log("API Response:", response);

            if (response) {
                toast.success(
                    type === "create"
                        ? "Thêm học sinh thành công"
                        : "Cập nhật học sinh thành công"
                );
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push("/list/students");
                }
            }
        } catch (error: any) {
            console.error("Error submitting form:", error);
            
            let errorMessage = "Có lỗi xảy ra khi xử lý yêu cầu";
            
            if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error status:", error.response.status);
                console.error("Error headers:", error.response.headers);
                
                if (error.response.status === 500) {
                    errorMessage = "Lỗi máy chủ (500). Vui lòng kiểm tra log hoặc liên hệ quản trị viên.";
                    console.error("Server error details:", error.response.data);
                    try {
                        const errorDetails = JSON.stringify(error.response.data, null, 2);
                        console.error("Full error response:", errorDetails);
                        errorMessage += "\nChi tiết lỗi: " + errorDetails;
                    } catch (jsonError) {
                        console.error("Could not stringify error response");
                    }
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data?.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response.status === 403) {
                    errorMessage = "Bạn không có quyền thực hiện chức năng này";
                } else if (error.response.status === 401) {
                    errorMessage = "Lỗi xác thực. Vui lòng đăng nhập lại.";
                } else if (error.response.status === 422) {
                    // Lỗi validation
                    const validationErrors = error.response.data.errors;
                    if (validationErrors) {
                        errorMessage = "Dữ liệu không hợp lệ: ";
                        for (const field in validationErrors) {
                            errorMessage += `${field} - ${validationErrors[field].join(', ')}; `;
                        }
                    }
                } else if (error.response.data && Object.keys(error.response.data).length === 0) {
                    // Trường hợp response.data là đối tượng rỗng
                    errorMessage = error.message || `Lỗi không xác định (${error.response.status}). Vui lòng thử lại.`;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    });

    return (
        <form className="flex flex-col gap-3" onSubmit={(e) => {
            console.log("Form submit event triggered");
            
            // Kiểm tra và hiển thị tổng quan lỗi validation
            if (Object.keys(errors).length > 0) {
                console.log("Form has validation errors:", errors);
                const errorFields = Object.keys(errors).map(field => {
                    return `${field}: ${errors[field as keyof typeof errors]?.message}`;
                }).join(', ');
                setError(`Form có lỗi validation: ${errorFields}`);
            }
            
            onSubmit(e);
        }}>
            <div className="flex items-center gap-2 mb-2 border-b pb-2">
                <Image src="/adduser.png" alt="" width={28} height={28} className="rounded-md" />
                <h1 className="text-lg font-semibold text-blue-700">
                    {type === "create"
                        ? "Thêm học sinh mới"
                        : "Chỉnh sửa học sinh"}
                </h1>
            </div>
            
            {apiConnected === false && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                        </svg>
                        <span>Không thể kết nối tới máy chủ API. Form sẽ không hoạt động cho đến khi kết nối được khôi phục.</span>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Cột trái: Thông tin học sinh và tài khoản */}
                <div className="flex flex-col gap-3">
                    {/* Thông tin học sinh */}
                    <div>
                        <h2 className="text-sm font-medium mb-2 text-gray-700 border-b pb-1">Thông tin học sinh</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <InputField
                                label={<>Họ và tên <span className="text-red-500">*</span></>}
                                name="name"
                                defaultValue={data?.name}
                                register={register}
                                error={errors?.name}
                                placeholder="Nhập họ và tên học sinh"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                }
                            />
                            <p className="text-xs text-gray-500 -mt-2 mb-1">Họ và tên đầy đủ của học sinh sẽ được hiển thị trong hệ thống.</p>
                            
                            <InputField
                                label={<>Ngày sinh <span className="text-red-500">*</span></>}
                                name="birth_date"
                                type="date"
                                defaultValue={data?.birth_date}
                                register={register}
                                error={errors?.birth_date}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                }
                            />

                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-600">Giới tính <span className="text-red-500">*</span></label>
                                <select
                                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                                    {...register("gender")}
                                    defaultValue={data?.gender || "male"}
                                >
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                                {errors.gender?.message && (
                                    <p className="text-xs text-red-400">
                                        {errors.gender.message.toString()}
                                    </p>
                                )}
                            </div>

                            <InputField
                                label="Số điện thoại"
                                name="phone"
                                defaultValue={data?.phone}
                                register={register}
                                error={errors?.phone}
                                placeholder="Nhập số điện thoại"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                }
                            />

                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-600">Lớp học <span className="text-red-500">*</span></label>
                                {loadingClasses ? (
                                    <div className="text-sm text-gray-600 h-10 flex items-center">Đang tải danh sách lớp...</div>
                                ) : (
                                    <select
                                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                                        {...register("class_id", { valueAsNumber: true })}
                                        defaultValue={data?.class_id || ""}
                                    >
                                        <option value="">Chọn lớp học</option>
                                        {Array.isArray(classes) && classes.map((classItem) => (
                                            <option key={classItem.id} value={classItem.id}>
                                                {classItem.name} - Khối {classItem.grade?.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {errors.class_id?.message && (
                                    <p className="text-xs text-red-400">
                                        {errors.class_id.message.toString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Thông tin tài khoản */}
                    <div>
                        <h2 className="text-sm font-medium mb-2 text-gray-700 border-b pb-1">Thông tin tài khoản</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <InputField
                                label="Tên đăng nhập"
                                name="username"
                                defaultValue={data?.username}
                                register={register}
                                error={errors?.username}
                                placeholder="Nhập tên đăng nhập"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                }
                            />
                            <p className="text-xs text-gray-500 -mt-2 mb-1">Tên đăng nhập dùng để đăng nhập vào hệ thống (khác với họ tên đầy đủ).</p>

                            <InputField
                                label={<>Email <span className="text-red-500">*</span></>}
                                name="email"
                                type="email"
                                defaultValue={data?.email}
                                register={register}
                                error={errors?.email}
                                placeholder="Nhập email"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                }
                            />

                            {type === "create" && (
                                <InputField
                                    label="Mật khẩu"
                                    name="password"
                                    type="password"
                                    register={register}
                                    error={errors?.password}
                                    placeholder="Nhập mật khẩu"
                                    icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    }
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Cột phải: Ảnh đại diện */}
                <div className="flex flex-col gap-3">
                    <div>
                        <h2 className="text-sm font-medium mb-2 text-gray-700 border-b pb-1">Ảnh đại diện</h2>
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
                                <Image
                                    src="/default-avatar.png"
                                    alt="Ảnh đại diện"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <p className="text-sm text-gray-500">Sử dụng ảnh mặc định</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            <div className="flex justify-end mt-4">
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
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
                            {type === "create" ? "Thêm học sinh" : "Cập nhật"}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default StudentForm;
