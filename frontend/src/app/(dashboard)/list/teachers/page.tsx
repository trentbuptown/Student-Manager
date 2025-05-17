"use client";

import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import Table from "@/components/Table";
import Image from "next/image";
import Link from "next/link";
import { role } from "@/lib/data";
import FormModal from "@/components/FormModal";
import { useEffect, useState } from "react";
import { Teacher, getAllTeachers, deleteTeacher } from "@/services/teacherService";
import { toast } from "react-toastify";

const columns = [
    {
        header: "Thông tin",
        accessor: "Info",
    },
    {
        header: "Chuyên môn",
        accessor: "specialization",
        className: "hidden md:table-cell",
    },
    {
        header: "Chủ nhiệm",
        accessor: "is_gvcn",
        className: "hidden md:table-cell",
    },
    {
        header: "Email",
        accessor: "email",
        className: "hidden md:table-cell",
    },
    {
        header: "Số điện thoại",
        accessor: "phone",
        className: "hidden md:table-cell",
    },
    {
        header: "Địa chỉ",
        accessor: "address",
        className: "hidden md:table-cell",
    },
    {
        header: "Chỉnh sửa",
        accessor: "actions",
    },
];

const TeacherListPage = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Lấy danh sách giáo viên khi component mount
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                setLoading(true);
                const data = await getAllTeachers();
                setTeachers(data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách giáo viên:", error);
                toast.error("Không thể tải danh sách giáo viên");
            } finally {
                setLoading(false);
            }
        };
        
        fetchTeachers();
    }, []);
    
    // Xử lý xóa giáo viên
    const handleDeleteTeacher = async (id: number) => {
        try {
            const result = await deleteTeacher(id);
            if (result.success) {
                // Cập nhật danh sách giáo viên sau khi xóa
                setTeachers(teachers.filter(teacher => teacher.id !== id));
                toast.success(result.message || "Xóa giáo viên thành công");
            } else {
                toast.error(result.message || "Không thể xóa giáo viên");
            }
        } catch (error) {
            console.error("Lỗi khi xóa giáo viên:", error);
            toast.error("Đã xảy ra lỗi khi xóa giáo viên");
        }
    };
    
    // Lọc giáo viên theo từ khóa tìm kiếm
    const filteredTeachers = teachers.filter(teacher => 
        teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        teacher.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.user?.phone && teacher.user.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
    
    // Xử lý tìm kiếm
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
    };

    const renderRow = (item: Teacher) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-[var(--light-blue)]"
        >
            <td className="flex items-center gap-4 p-4">
                <Image
                    src={item.user?.profile_photo || "https://via.placeholder.com/40"}
                    alt=""
                    width={40}
                    height={40}
                    className="md:hidden lg:block rounded-full w-10 h-10 object-cover"
                />
                <div className="flex flex-col">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.user?.email}</p>
                </div>
            </td>
            <td className="hidden md:table-cell">{item.specialization || "-"}</td>
            <td className="hidden md:table-cell">{item.is_gvcn ? "Có" : "Không"}</td>
            <td className="hidden md:table-cell">{item.user?.email || "-"}</td>
            <td className="hidden md:table-cell">{item.user?.phone || "-"}</td>
            <td className="hidden md:table-cell">{item.user?.address || "-"}</td>
            <td>
                <div className="flex items-center gap-2">
                    {role === "admin" && (
                        <>
                            <FormModal
                                table="teacher"
                                type="update"
                                data={item}
                                onSuccess={() => {
                                    // Refresh danh sách giáo viên sau khi cập nhật
                                    getAllTeachers().then(data => setTeachers(data));
                                }}
                            />
                            <button
                                className="w-7 h-7 bg-[var(--purple-pastel)] flex items-center justify-center rounded-full cursor-pointer"
                                onClick={() => {
                                    if (window.confirm("Bạn có chắc chắn muốn xóa giáo viên này?")) {
                                        handleDeleteTeacher(item.id);
                                    }
                                }}
                            >
                                <Image src="/delete.png" alt="" width={16} height={16} />
                            </button>
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
                    Danh sách giáo viên
                </h1>
                <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                    <TableSearch onSearch={handleSearch} />
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
                                table="teacher" 
                                type="create" 
                                onSuccess={() => {
                                    // Refresh danh sách giáo viên sau khi thêm mới
                                    getAllTeachers().then(data => setTeachers(data));
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p>Đang tải dữ liệu...</p>
                </div>
            ) : (
                <>
                    <Table
                        columns={columns}
                        renderRow={renderRow}
                        data={currentItems}
                    />
                    
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </div>
    );
};

export default TeacherListPage;

