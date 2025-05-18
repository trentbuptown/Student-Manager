"use client";

import StudentForm from "@/components/forms/StudentForm";
import { useRouter, useParams } from "next/navigation";
import { getStudentById } from "@/services/studentService";
import { useEffect, useState } from "react";
import { Student } from "@/services/studentService";
import { toast } from "react-hot-toast";

export default function UpdateStudentPage() {
    const router = useRouter();
    const params = useParams();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchStudent = async () => {
            try {
                // Lấy id từ params thông qua useParams
                const id = Array.isArray(params.id) ? params.id[0] : params.id;
                
                if (!id) {
                    toast.error("ID học sinh không hợp lệ");
                    router.push("/list/students");
                    return;
                }
                
                // Kiểm tra xem id có phải là số hợp lệ không
                const studentId = parseInt(id);
                if (isNaN(studentId)) {
                    toast.error("ID học sinh phải là số");
                    router.push("/list/students");
                    return;
                }
                
                const studentData = await getStudentById(studentId);
                if (studentData) {
                    setStudent(studentData);
                } else {
                    toast.error("Không tìm thấy học sinh");
                    router.push("/list/students");
                }
            } catch (error) {
                console.error("Error fetching student:", error);
                toast.error("Không thể tải thông tin học sinh");
                router.push("/list/students");
            } finally {
                setLoading(false);
            }
        };

        fetchStudent();
    }, [params, router]);

    if (loading) {
        return (
            <div className="p-4 flex-1 m-4 mt-0 bg-white rounded-md flex items-center justify-center">
                <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" />
                <p className="ml-2 text-gray-500">Đang tải thông tin học sinh...</p>
            </div>
        );
    }

    if (!student) {
        return null;
    }

    // Debug thông tin user
    console.log("Student data from API:", student);
    console.log("User data to pass to form:", student.user);

    // Chuẩn bị dữ liệu cho form
    const formData = {
        id: student.id,
        name: student.name,
        birth_date: student.birth_date,
        gender: student.gender as "male" | "female" | "other",
        phone: student.phone,
        user_id: student.user_id,
        class_id: student.class_id,
        // Truyền thông tin user
        email: student.user?.email || "",
        username: student.user?.name || student.user?.username || ""
    };

    console.log("Form data prepared:", formData);

    return (
        <div className="p-4 flex-1 m-4 mt-0 bg-white rounded-md">
            <StudentForm 
                type="update"
                data={formData}
                onSuccess={() => router.push("/list/students")}
            />
        </div>
    );
}
