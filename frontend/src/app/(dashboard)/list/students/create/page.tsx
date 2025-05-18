"use client";

import StudentForm from "@/components/forms/StudentForm";
import { useRouter } from "next/navigation";

export default function CreateStudentPage() {
    const router = useRouter();

    return (
        <div className="p-4 flex-1 m-4 mt-0 bg-white rounded-md">
            <StudentForm 
                type="create"
                onSuccess={() => router.push("/list/students")}
            />
        </div>
    );
} 