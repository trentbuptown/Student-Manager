"use client";

import { on } from "events";
import dynamic from "next/dynamic";
import Image from "next/image";
import { JSX, useState } from "react";
import subjectService from '@/services/subjectService';
import { deleteClass } from '@/services/classService';
import { toast } from 'sonner';

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
    loading: () => <p>Loading...</p>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
    loading: () => <p>Loading...</p>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
    loading: () => <p>Loading...</p>,
});
const GradeForm = dynamic(() => import("./forms/GradeForm"), {
    loading: () => <p>Loading...</p>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
    loading: () => <p>Loading...</p>,
});
const ReportForm = dynamic(() => import("./forms/ReportForm"), {
    loading: () => <p>Loading...</p>,
});

const forms: {
    [key: string]: (
        type: "create" | "update",
        data?: any,
        onSuccess?: () => void
    ) => JSX.Element;
} = {
    teacher: (type, data, onSuccess) => (
        <TeacherForm type={type} data={data} onSuccess={onSuccess} />
    ),
    student: (type, data, onSuccess) => (
        <StudentForm type={type} data={data} onSuccess={onSuccess} />
    ),
    class: (type, data, onSuccess) => (
        <ClassForm type={type} data={data} onSuccess={onSuccess} />
    ),
    grade: (type, data, onSuccess) => (
        <GradeForm type={type} data={data} onSuccess={onSuccess} />
    ),
    subject: (type, data, onSuccess) => (
        <SubjectForm type={type} data={data} onSuccess={onSuccess} />
    ),
    report: (type, data, onSuccess) => (
        <ReportForm type={type} data={data} />
    ),
};

const FormModal = ({
    table,
    type,
    data,
    id,
    onSuccess,
}: {
    table:
        | "student"
        | "class"
        | "grade"
        | "subject"
        | "teacher"
        | "attendance"
        | "announcement"
        | "assignment"
        | "lesson"
        | "result"
        | "event"
        | "exam"
        | "report";

    type: "create" | "update" | "delete";
    data?: any;
    id?: number;
    onSuccess?: () => void;
}) => {
    const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
    const bgColor =
        type === "create"
            ? "bg-[var(--yellow-pastel)]"
            : type === "update"
            ? "bg-[var(--blue-pastel)]"
            : "bg-[var(--purple-pastel)]";

    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        console.log('FormModal: handleSuccess called');
        setOpen(false);
        if (onSuccess) {
            console.log('FormModal: Calling parent onSuccess');
            onSuccess();
        } else {
            console.log('FormModal: No parent onSuccess function provided');
            // Nếu không có onSuccess, tải lại trang sau khi xóa hoặc cập nhật
            if (type === 'delete') {
                console.log('FormModal: Reloading page after deletion');
                // Chờ 1 giây trước khi tải lại trang để hiển thị thông báo thành công
                setTimeout(() => window.location.reload(), 1000);
            } else if (table === 'subject') {
                console.log('FormModal: Reloading page for subject updates');
                window.location.reload();
            }
        }
    };

    const Form = () => {
        const handleDeleteConfirm = async () => {
            if (id === undefined) {
                console.error("Delete action requires an ID.");
                toast.error(`Không thể xóa: Thiếu ID ${table}.`);
                return;
            }
            try {
                console.log(`===== DELETING ${table.toUpperCase()} WITH ID: ${id} =====`);
                
                let response;
                
                // Sử dụng service tương ứng với table
                if (table === 'subject') {
                    console.log(`Making DELETE request to /subjects/${id}`);
                    response = await subjectService.delete(id);
                } else if (table === 'class') {
                    console.log(`Making DELETE request to /classes/${id}`);
                    try {
                        await deleteClass(id);
                        response = { message: 'Đã xóa lớp học thành công' };
                    } catch (error: any) {
                        // Bỏ qua lỗi 404 vì có thể lớp học đã bị xóa trước đó
                        if (error.response && error.response.status === 404) {
                            console.log('Lớp học không tồn tại hoặc đã bị xóa trước đó');
                            response = { message: 'Lớp học đã được xóa' };
                        } else {
                            throw error; // Ném lại các lỗi khác
                        }
                    }
                } else {
                    // Các table khác chưa được hỗ trợ
                    toast.error(`Chưa hỗ trợ xóa ${table}`);
                    return;
                }
                
                console.log('Delete response:', response);
                toast.success(`Xóa ${table} thành công.`);
                handleSuccess();
            } catch (error: any) {
                console.error('Error deleting:', error);
                
                // Hiển thị thông báo lỗi chi tiết từ API response
                let errorMessage = 'Lỗi không xác định';
                
                if (error.response) {
                    console.log('Error response data:', error.response.data);
                    
                    // Trường hợp có message trong response data
                    if (error.response.data?.message) {
                        errorMessage = error.response.data.message;
                    } 
                    // Trường hợp error status là 422 và không có message cụ thể
                    else if (error.response.status === 422) {
                        if (table === 'class') {
                            errorMessage = 'Không thể xóa lớp học này vì đang có học sinh trong lớp';
                        } else {
                            errorMessage = 'Dữ liệu không hợp lệ';
                        }
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                toast.error(`Không thể xóa: ${errorMessage}`);
            }
        };

        if (type === "delete" && id) {
            return (
                <form
                    action=""
                    className="p-4 gap-4 flex flex-col items-center justify-center"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleDeleteConfirm();
                    }}
                >
                    <Image src="/warning.png" alt="" width={150} height={150} />
                    <span className="text-center font-semibold text-2xl uppercase">
                        Bạn có chắc chắn muốn xóa?
                    </span>
                    <span className="text-center font-medium text-lg text-gray-500">
                        Dữ liệu sẽ không thể được khôi phục.
                    </span>
                    <div className="flex gap-8 mt-8">
                        <button
                            className="bg-gray-400 text-white py-2 px-4 rounded-md border-none w-max self-center font-semibold hover:shadow-lg hover:-translate-y-1 transform transition duration-300"
                            onClick={() => setOpen(false)}
                            type="button"
                        >
                            Hủy
                        </button>
                        <button
                            className="bg-red-600 text-white py-2 px-4 rounded-md border-none w-max self-center font-semibold hover:shadow-lg hover:-translate-y-1 transform transition duration-300"
                            type="submit"
                        >
                            Xóa
                        </button>
                    </div>
                </form>
            );
        }
        
        if (type === "create" || type === "update") {
            console.log(`Rendering form for table: ${table}, type: ${type}`);
            console.log('Form data:', data);
            console.log('onSuccess function provided:', !!onSuccess);
            
            // Đặc biệt xử lý cho subjectForm
            if (table === 'subject') {
                console.log('Rendering SubjectForm with:', { type, data, onSuccess: !!onSuccess });
            }
            
            return forms[table](type, data, handleSuccess);
        }
        
        return "Form not found!";
    };
    return (
        <>
            <button
                className={`${size} ${bgColor} flex items-center justify-center rounded-full cursor-pointer `}
                onClick={() => setOpen(true)}
            >
                <Image src={`/${type}.png`} alt="" width={16} height={16} />
            </button>
            {open && (
                <div className="fixed inset-0 z-[9999] w-screen h-screen bg-black/60 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] z-50">
                        <Form />
                        <div
                            className="absolute top-4 right-4 cursor-pointer"
                            onClick={() => setOpen(false)}
                        >
                            <Image
                                src="/close.png"
                                alt=""
                                width={14}
                                height={14}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FormModal;
