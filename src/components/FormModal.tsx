"use client";

import { on } from "events";
import dynamic from "next/dynamic";
import Image from "next/image";
import { JSX, useState } from "react";

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
    loading: () => <p>Loading...</p>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
    loading: () => <p>Loading...</p>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
    loading: () => <p>Loading...</p>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
    loading: () => <p>Loading...</p>,
});
const ReportForm = dynamic(() => import("./forms/ReportForm"), {
    loading: () => <p>Loading...</p>,
});

const forms: {
    [key: string]: (type: "create" | "update", data?: any) => JSX.Element;
} = {
    teacher: (type, data) => <TeacherForm type={type} data={data} />,
    student: (type, data) => <StudentForm type={type} data={data} />,
    class: (type, data) => <ClassForm type={type} data={data} />,
    subject: (type, data) => <SubjectForm type={type} data={data} />,
    report: (type, data) => <ReportForm type={type} data={data} />,
};

const FormModal = ({
    table,
    type,
    data,
    id,
}: {
    table:
        | "student"
        | "class"
        | "subject"
        | "teacher"
        | "attendance"
        | "announcement"
        | "assignment"
        | "lesson"
        | "result"
        | "event"
        | "parent"
        | "exam"
        | "report";

    type: "create" | "update" | "delete";
    data?: any;
    id?: number;
}) => {
    const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
    const bgColor =
        type === "create"
            ? "bg-[var(--yellow-pastel)]"
            : type === "update"
            ? "bg-[var(--blue-pastel)]"
            : "bg-[var(--purple-pastel)]";

    const [open, setOpen] = useState(false);

    const Form = () => {
        return type === "delete" && id ? (
            <form
                action=""
                className="p-4 gap-4 flex flex-col items-center justify-center"
            >
                <Image src="/warning.png" alt="" width={150} height={150} />
                <span className="text-center font-semibold text-2xl uppercase">
                    Bạn có chắc chắn muốn xóa?
                </span>
                <span className="text-center font-medium text-lg text-gray-500">
                    Dữ liệu sẽ không thể được khôi phục.
                </span>
                <div className="flex gap-8 mt-8">
                    <button className="bg-gray-400 text-white py-2 px-4 rounded-md border-none w-max self-center font-semibold hover:shadow-lg hover:-translate-y-1 transform transition duration-300">
                        Hủy
                    </button>
                    <button className="bg-red-600 text-white py-2 px-4 rounded-md border-none w-max self-center font-semibold hover:shadow-lg hover:-translate-y-1 transform transition duration-300">
                        Xóa
                    </button>
                </div>
            </form>
        ) : type === "create" || type === "update" ? (
            forms[table](type, data)
        ) : (
            "Form not found!"
        );
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
