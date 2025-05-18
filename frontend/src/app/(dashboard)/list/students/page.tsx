"use client";

import Pagination from "@/components/Pagination";
import Image from "next/image";
import Link from "next/link";
import { role } from "@/lib/data";
import TableSearch from "@/components/TableSearch";
import Table from "@/components/Table";
import FormModal from "@/components/FormModal";
import { useState, useEffect } from "react";
import { getStudents, deleteStudent, Student } from "@/services/studentService";
import { getClasses, Class } from "@/services/classService";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import ChangePasswordModal from "@/components/ChangePasswordModal";

const columns = [
    {
        header: "Thông tin",
        accessor: "Info",
    },
    {
        header: "Lớp",
        accessor: "class",
        className: "hidden md:table-cell",
    },
    {
        header: "Khối",
        accessor: "grade",
        className: "hidden md:table-cell",
    },
    {
        header: "Số điện thoại",
        accessor: "phone",
        className: "hidden md:table-cell",
    },
    {
        header: "Giới tính",
        accessor: "gender",
        className: "hidden md:table-cell",
    },
    {
        header: "Ngày sinh",
        accessor: "birth_date",
        className: "hidden md:table-cell",
    },
    {
        header: "Chỉnh sửa",
        accessor: "actions",
    },
];

const StudentListPage = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const itemsPerPage = 10;

    // Lấy danh sách học sinh và lớp học
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [studentsData, classesData] = await Promise.all([
                    getStudents(),
                    getClasses()
                ]);
                
                console.log("Students data:", studentsData);
                console.log("Classes data:", classesData);
                
                setStudents(Array.isArray(studentsData) ? studentsData : []);
                setClasses(Array.isArray(classesData) ? classesData : []);
                setTotalPages(Math.ceil((Array.isArray(studentsData) ? studentsData.length : 0) / itemsPerPage));
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Không thể tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Xử lý tìm kiếm
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        
        if (!term.trim()) {
            setTotalPages(Math.ceil(students.length / itemsPerPage));
            setCurrentPage(1);
            return;
        }
        
        const lowercasedTerm = term.toLowerCase();
        const filtered = students.filter(student => 
            student.name?.toLowerCase().includes(lowercasedTerm) ||
            student.phone?.toLowerCase().includes(lowercasedTerm) ||
            student.class?.name?.toLowerCase().includes(lowercasedTerm) ||
            student.user?.email?.toLowerCase().includes(lowercasedTerm)
        );
        
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(1);
    };

    // Xử lý xóa học sinh
    const handleDeleteStudent = async (id: number) => {
        try {
            await deleteStudent(id);
            setStudents(students.filter(student => student.id !== id));
            toast.success("Xóa học sinh thành công");
        } catch (error) {
            console.error("Error deleting student:", error);
            toast.error("Không thể xóa học sinh");
        }
    };

    // Xử lý mở modal đổi mật khẩu
    const handleOpenPasswordModal = (userId: number) => {
        setSelectedStudentId(userId);
        setPasswordModalOpen(true);
    };

    // Xử lý đóng modal đổi mật khẩu
    const handleClosePasswordModal = () => {
        setPasswordModalOpen(false);
        setSelectedStudentId(null);
    };

    // Lấy tên lớp và khối từ class_id
    const getClassAndGradeInfo = (classId: number) => {
        if (!Array.isArray(classes) || classes.length === 0) {
            return {
                className: "Chưa phân lớp",
                gradeName: "Chưa có thông tin"
            };
        }
        
        const classInfo = classes.find(c => c.id === classId);
        return {
            className: classInfo?.name || "Chưa phân lớp",
            gradeName: classInfo?.grade?.name || "Chưa có thông tin"
        };
    };

    // Định dạng ngày sinh
    const formatBirthDate = (dateString: string) => {
        if (!dateString) return "Chưa có thông tin";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    // Chuyển đổi giới tính sang tiếng Việt
    const formatGender = (gender: string) => {
        switch (gender) {
            case 'male': return 'Nam';
            case 'female': return 'Nữ';
            case 'other': return 'Khác';
            default: return 'Không xác định';
        }
    };

    // Lọc dữ liệu theo tìm kiếm
    const filteredData = searchTerm
        ? students.filter(student => 
            student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.class?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : students;

    // Phân trang
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const renderRow = (item: Student) => {
        const { className, gradeName } = getClassAndGradeInfo(item.class_id);
        
        return (
            <tr
                key={item.id}
                className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-[var(--light-blue)]"
            >
                <td className="flex items-center gap-4 p-4">
                    <Image
                        src="/default-avatar.png"
                        alt=""
                        width={40}
                        height={40}
                        className="md:hidden lg:block rounded-full w-10 h-10 object-cover"
                    />
                    <div className="flex flex-col">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-xs text-gray-500">{item.user?.email || "Chưa có email"}</p>
                    </div>
                </td>
                <td className="hidden md:table-cell">{className}</td>
                <td className="hidden md:table-cell">{gradeName}</td>
                <td className="hidden md:table-cell">{item.phone || "Chưa có SĐT"}</td>
                <td className="hidden md:table-cell">{formatGender(item.gender)}</td>
                <td className="hidden md:table-cell">{formatBirthDate(item.birth_date)}</td>
                <td>
                    <div className="flex items-center gap-2">
                        <button
                            className="p-2 rounded-md bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                            title="Đổi mật khẩu"
                            onClick={() => handleOpenPasswordModal(item.user?.id || 0)}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </button>
                        {role === "admin" && (
                            <>
                                <Link
                                    href={`/list/students/${item.id}`}
                                    className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </Link>
                                <button
                                    onClick={() => handleDeleteStudent(item.id)}
                                    className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="p-4 flex-1 m-4 mt-0 bg-white rounded-md">
            {/* Title */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-lg font-semibold hidden md:block">
                    Danh sách học sinh
                </h1>
                <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                    <TableSearch onSearch={handleSearch} />
                    <div className="flex gap-4 items-center self-end">
                        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--yellow-pastel)]">
                            <Image
                                src="/filter.png"
                                alt=""
                                width={14}
                                height={14}
                            />
                        </button>
                        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--yellow-pastel)]">
                            <Image
                                src="/sort.png"
                                alt=""
                                width={14}
                                height={14}
                            />
                        </button>
                        {role === "admin" && (
                            <Link
                                href="/list/students/create"
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--yellow-pastel)]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" />
                    <p className="mt-2 text-gray-500">Đang tải dữ liệu học sinh...</p>
                </div>
            ) : students.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">Không có dữ liệu học sinh</p>
                    {role === "admin" && (
                        <Link
                            href="/list/students/create"
                            className="mt-4 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--yellow-pastel)]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </Link>
                    )}
                </div>
            ) : (
                <Table
                    columns={columns}
                    renderRow={renderRow}
                    data={paginatedData}
                />
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {/* Modal đổi mật khẩu */}
            {passwordModalOpen && selectedStudentId && (
                <ChangePasswordModal 
                    userId={selectedStudentId}
                    isOpen={passwordModalOpen}
                    onClose={handleClosePasswordModal}
                />
            )}
        </div>
    );
};

export default StudentListPage;
