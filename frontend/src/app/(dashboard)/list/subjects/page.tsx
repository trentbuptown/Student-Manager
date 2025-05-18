'use client';

import { useEffect, useState } from 'react';
import Pagination from "@/components/Pagination";
import Image from "next/image";
import Link from "next/link";
import { role, subjectsData } from "@/lib/data";
import TableSearch from "@/components/TableSearch";
import Table from "@/components/Table";
import FormModal from "@/components/FormModal";
import subjectService, { Subject } from '@/services/subjectService';
import { toast } from 'sonner';

const columns = [
    {
        header: "Tên môn học",
        accessor: "name",
    },
    {
        header: "Mã môn học",
        accessor: "id",
        className: "hidden md:table-cell",
    },
    {
        header: "Giáo viên giảng dạy",
        accessor: "teachers",
        className: "hidden md:table-cell",
    },
    {
        header: "Chỉnh sửa",
        accessor: "actions",
    },
];

const SubjectListPage = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubjects = async () => {
        console.log('fetchSubjects called');
        try {
            setLoading(true);
            const response = await subjectService.getAll();
            console.log("Fetched subjects:", response);
            setSubjects(response);
        } catch (error) {
            console.error("Error fetching subjects:", error);
            setSubjects([]);
            toast.error('Không thể tải danh sách môn học. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    // Hàm refresh để tải lại dữ liệu
    const handleRefresh = () => {
        console.log("Refreshing subjects list...");
        fetchSubjects();
    };

    if (loading) {
        return <div className="p-4">Đang tải danh sách môn học...</div>;
    }

    const renderRow = (item: Subject) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-[var(--light-blue)]"
        >
            <td className="flex items-center gap-4 p-4">{item.name}</td>
            <td className="hidden md:table-cell">{item.id}</td>
            <td className="hidden md:table-cell">{item.teachers?.map(teacher => teacher.name).join(", ") || ''}</td>
            <td>
                <div className="flex items-center gap-2">
                    {role === "admin" && (
                        <>
                            <FormModal
                                table="subject"
                                type="update"
                                data={item}
                                onSuccess={handleRefresh}
                            />
                            <FormModal
                                table="subject"
                                type="delete"
                                id={item.id}
                                onSuccess={handleRefresh}
                            />
                        </>
                    )}
                </div>
            </td>
        </tr>
    );

    return (
        <div className=" p-4 flex-1 m-4 mt-0 bg-white rounded-md">
            {/* Title */}
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold hidden md:block ">
                    Danh sách môn học
                </h1>
                <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                    <TableSearch onSearch={(term) => console.log(term)} />
                    <div className="flex gap-4 items-center self-end">
                        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--yellow-pastel)] ">
                            <Image
                                src="/filter.png"
                                alt=""
                                width={14}
                                height={14}
                            />
                        </button>
                        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--yellow-pastel)] ">
                            <Image
                                src="/sort.png"
                                alt=""
                                width={14}
                                height={14}
                            />
                        </button>
                        {role === "admin" && (
                            <FormModal 
                                table="subject" 
                                type="create" 
                                onSuccess={handleRefresh}
                            />
                        )}
                    </div>
                </div>
            </div>
            <Table
                columns={columns}
                renderRow={renderRow}
                data={subjects || []}
            />

            <Pagination currentPage={1} totalPages={1} onPageChange={(page) => console.log(page)} />
        </div>
    );
};

export default SubjectListPage;
