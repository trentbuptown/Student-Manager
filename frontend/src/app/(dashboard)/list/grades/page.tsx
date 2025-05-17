"use client";

import Pagination from "@/components/Pagination";
import Image from "next/image";
import { role } from "@/lib/data";
import TableSearch from "@/components/TableSearch";
import Table from "@/components/Table";
import FormModal from "@/components/FormModal";
import { useEffect, useState } from "react";
import { getAllGrades, deleteGrade, Grade } from "@/services/gradeService";
import { getClasses, deleteClass, Class } from "@/services/classService";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

const classColumns = [
    {
        header: "Tên lớp",
        accessor: "name",
    },
    {
        header: "Khối",
        accessor: "grade",
        render: (value: Grade) => value.name,
    },
    {
        header: "Giáo viên chủ nhiệm",
        accessor: "supervisor",
    },
    {
        header: "Sĩ số",
        accessor: "capacity",
    },
    {
        header: "Chỉnh sửa",
        accessor: "actions",
    },
];

const gradeColumns = [
    {
        header: "Tên khối",
        accessor: "name",
    },
    {
        header: "Số lớp",
        accessor: "classes_count",
    },
    {
        header: "Chỉnh sửa",
        accessor: "actions",
    },
];

const ClassManagementPage = () => {
    const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"classes" | "grades">("classes");
    const [grades, setGrades] = useState<Grade[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Lọc lớp học theo khối nếu có chọn khối
    const filteredClasses = selectedGrade
        ? classes.filter((c) => c.grade_id === selectedGrade)
        : classes;

    // Hàm fetch dữ liệu danh sách khối
    const fetchGrades = async () => {
        try {
            setLoading(true);
            const response = await getAllGrades();
            if (response.status === "success") {
                setGrades(response.data);
                setTotalPages(Math.ceil(response.data.length / 10));
            }
        } catch (error) {
            console.error("Error fetching grades:", error);
            toast.error("Không thể tải danh sách khối lớp");
        } finally {
            setLoading(false);
        }
    };

    // Hàm fetch dữ liệu danh sách lớp học
    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await getClasses();
            if (response.status === "success") {
                setClasses(response.data);
                setTotalPages(Math.ceil(response.data.length / 10));
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
            toast.error("Không thể tải danh sách lớp học");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrades();
        fetchClasses();
    }, []);

    const handleSearch = (term: string) => {
        // Lọc dữ liệu dựa trên từ khóa tìm kiếm
        const filtered = term
            ? classes.filter(
                  (c) =>
                      c.name.toLowerCase().includes(term.toLowerCase()) ||
                      c.grade?.name
                          .toLowerCase()
                          .includes(term.toLowerCase()) ||
                      c.supervisor.toLowerCase().includes(term.toLowerCase())
              )
            : classes;
        setClasses(filtered);
        setCurrentPage(1);
        setTotalPages(Math.ceil(filtered.length / 10));
    };

    const handleDeleteClass = async (id: number) => {
        try {
            await deleteClass(id);
            toast.success("Xóa lớp học thành công");
            fetchClasses();
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(
                    error.response?.data?.message || "Không thể xóa lớp học"
                );
            } else {
                toast.error("Không thể xóa lớp học");
            }
        }
    };

    const handleDeleteGrade = async (id: number) => {
        try {
            await deleteGrade(id);
            toast.success("Xóa khối thành công");
            fetchGrades();
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(
                    error.response?.data?.message || "Không thể xóa khối"
                );
            } else {
                toast.error("Không thể xóa khối");
            }
        }
    };

    const renderRow = (item: Class) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-[var(--light-blue)]"
        >
            <td className="flex items-center gap-4 p-4">{item.name}</td>
            <td>{item.grade?.name}</td>
            <td>{item.supervisor}</td>
            <td>{item.capacity}</td>
            <td>
                <div className="flex items-center gap-2">
                    {role === "admin" && (
                        <>
                            <FormModal
                                table="class"
                                type="update"
                                data={item}
                                onSuccess={fetchClasses}
                            />
                            <FormModal
                                table="class"
                                type="delete"
                                id={item.id}
                                onSuccess={() => handleDeleteClass(item.id)}
                            />
                        </>
                    )}
                </div>
            </td>
        </tr>
    );

    const renderGradeRow = (item: Grade) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-[var(--light-blue)]"
        >
            <td className="flex items-center gap-4 p-4">
                <button
                    onClick={() => {
                        setSelectedGrade(item.id);
                        setActiveTab("classes");
                    }}
                    className="text-blue-500 hover:text-blue-700 hover:underline"
                >
                    {item.name}
                </button>
            </td>
            <td>{item.classes_count || 0}</td>
            <td>
                <div className="flex items-center gap-2">
                    <button
                        className="w-7 h-7 bg-[var(--blue-pastel)] flex items-center justify-center rounded-full cursor-pointer"
                        onClick={() => {
                            document
                                .getElementById(`updateGradeModal-${item.id}`)
                                ?.classList.remove("hidden");
                        }}
                    >
                        <Image
                            src="/update.png"
                            alt="Cập nhật"
                            width={16}
                            height={16}
                        />
                    </button>
                    <button
                        className="w-7 h-7 bg-[var(--purple-pastel)] flex items-center justify-center rounded-full cursor-pointer"
                        onClick={() => handleDeleteGrade(item.id)}
                    >
                        <Image
                            src="/delete.png"
                            alt="Xóa"
                            width={16}
                            height={16}
                        />
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="p-4 flex-1 m-4 mt-0 bg-white rounded-md">
            <div className="flex flex-col space-y-4">
                <h1 className="text-lg font-semibold hidden md:block">
                    Quản lý lớp học và khối
                </h1>

                {selectedGrade && (
                    <div className="flex items-center mb-2">
                        <span className="text-gray-500 mr-2">
                            Đang lọc theo khối:
                        </span>
                        <span className="font-medium">
                            {grades.find((g) => g.id === selectedGrade)?.name}
                        </span>
                        <button
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() => setSelectedGrade(null)}
                        >
                            <Image
                                src="/close.png"
                                alt="Xóa lọc"
                                width={14}
                                height={14}
                            />
                        </button>
                    </div>
                )}

                <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
                    <button
                        className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                            ${
                                activeTab === "classes"
                                    ? "bg-white shadow text-blue-600"
                                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("classes")}
                    >
                        Lớp học
                    </button>
                    <button
                        className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                            ${
                                activeTab === "grades"
                                    ? "bg-white shadow text-blue-600"
                                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("grades")}
                    >
                        Khối lớp
                    </button>
                </div>

                <div className="mt-2">
                    {activeTab === "classes" && (
                        <div>
                            <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto justify-between mb-4">
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
                                        <FormModal
                                            table="class"
                                            type="create"
                                            onSuccess={fetchClasses}
                                        />
                                    )}
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" />
                                    <p className="mt-2 text-gray-500">
                                        Đang tải dữ liệu lớp học...
                                    </p>
                                </div>
                            ) : classes.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">
                                        Không có dữ liệu lớp học
                                    </p>
                                    {role === "admin" && (
                                        <button
                                            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        "createClassModal"
                                                    )
                                                    ?.classList.remove("hidden")
                                            }
                                        >
                                            Thêm lớp học mới
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <Table
                                    columns={classColumns}
                                    renderRow={renderRow}
                                    data={filteredClasses}
                                />
                            )}
                        </div>
                    )}

                    {activeTab === "grades" && (
                        <div>
                            <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto justify-between mb-4">
                                <TableSearch onSearch={handleSearch} />
                                <div className="flex gap-4 items-center self-end">
                                    {role === "admin" && (
                                        <button
                                            className="w-8 h-8 bg-[var(--yellow-pastel)] flex items-center justify-center rounded-full cursor-pointer"
                                            onClick={() => {
                                                document
                                                    .getElementById(
                                                        "createGradeModal"
                                                    )
                                                    ?.classList.remove(
                                                        "hidden"
                                                    );
                                            }}
                                        >
                                            <Image
                                                src="/create.png"
                                                alt="Tạo mới"
                                                width={16}
                                                height={16}
                                            />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" />
                                    <p className="mt-2 text-gray-500">
                                        Đang tải dữ liệu khối lớp...
                                    </p>
                                </div>
                            ) : grades.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">
                                        Không có dữ liệu khối lớp
                                    </p>
                                    {role === "admin" && (
                                        <button
                                            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        "createGradeModal"
                                                    )
                                                    ?.classList.remove("hidden")
                                            }
                                        >
                                            Thêm khối lớp mới
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <Table
                                    columns={gradeColumns}
                                    renderRow={renderGradeRow}
                                    data={grades}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default ClassManagementPage;
