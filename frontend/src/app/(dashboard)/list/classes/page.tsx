"use client";

import Pagination from "@/components/Pagination";
import Image from "next/image";
import TableSearch from "@/components/TableSearch";
import Table from "@/components/Table";
import FormModal from "@/components/FormModal";
import { useEffect, useState } from "react";
import { getAllGrades, deleteGrade, Grade } from "@/services/gradeService";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";

type Class = {
    id: number;
    name: string;
    capacity: number;
    grade: string | number;
    supervisor: string;
};

const classColumns = [
    {
        header: "Tên lớp",
        accessor: "name",
    },
    {
        header: "Số lượng",
        accessor: "capacity",
    },
    {
        header: "Khối",
        accessor: "grade",
        className: "hidden md:table-cell",
    },
    {
        header: "Giáo viên chủ nhiệm",
        accessor: "supervisor",
        className: "hidden md:table-cell",
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
        accessor: "classCount",
        className: "hidden md:table-cell",
    },
    {
        header: "Chỉnh sửa",
        accessor: "actions",
    },
];

const ClassManagementPage = () => {
    const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'classes' | 'grades'>('classes');
    const [grades, setGrades] = useState<Grade[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [gradeToDelete, setGradeToDelete] = useState<number | null>(null);

    // Lọc lớp học theo khối nếu có chọn khối
    const filteredClasses = selectedGrade
        ? classes.filter(c => Number(c.grade) === selectedGrade)
        : classes;

    // Hàm fetch dữ liệu danh sách khối
    const fetchGrades = async () => {
        setLoading(true);
        try {
            const data = await getAllGrades();
            setGrades(data);
        } catch (error) {
            console.error("Failed to fetch grades:", error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm fetch dữ liệu danh sách lớp học
    const fetchClasses = async () => {
        // Sẽ thực hiện khi có API thực tế
        // Hiện tại để mảng trống
        setClasses([]);
    };

    useEffect(() => {
        fetchGrades();
        fetchClasses();
    }, []);

    const renderClassRow = (item: Class) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-[var(--light-blue)]"
        >
            <td className="flex items-center gap-4 p-4">{item.name}</td>
            <td>{item.capacity}</td>
            <td className="hidden md:table-cell">{item.grade}</td>
            <td className="hidden md:table-cell">{item.supervisor}</td>
            <td>
                <div className="flex items-center gap-2">
                            <FormModal
                                table="class"
                                type="update"
                                data={item}
                            />
                            <FormModal
                                table="class"
                                type="delete"
                                id={item.id}
                            />
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
                        setActiveTab('classes');
                    }}
                    className="text-blue-500 hover:text-blue-700 hover:underline"
                >
                    {item.name}
                </button>
            </td>
            <td className="hidden md:table-cell">{item.classes?.length || 0}</td>
            <td>
                <div className="flex items-center gap-2">
                    <button
                        className="w-7 h-7 bg-[var(--blue-pastel)] flex items-center justify-center rounded-full cursor-pointer"
                        onClick={() => {
                            document.getElementById(`updateGradeModal-${item.id}`)?.classList.remove('hidden');
                        }}
                    >
                        <Image src="/update.png" alt="Cập nhật" width={16} height={16} />
                    </button>
                    <button
                        className="w-7 h-7 bg-[var(--purple-pastel)] flex items-center justify-center rounded-full cursor-pointer"
                        onClick={() => {
                            setGradeToDelete(item.id);
                            setShowDeleteModal(true);
                        }}
                    >
                        <Image src="/delete.png" alt="Xóa" width={16} height={16} />
                    </button>
                    
                    {/* Modal cập nhật khối */}
                    <div id={`updateGradeModal-${item.id}`} className="fixed inset-0 z-[9999] w-screen h-screen bg-black/60 flex items-center justify-center hidden">
                        <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] z-50">
                            <GradeForm 
                                type="update" 
                                data={item} 
                                onSuccess={() => {
                                    document.getElementById(`updateGradeModal-${item.id}`)?.classList.add('hidden');
                                    fetchGrades();
                                }}
                            />
                            <div
                                className="absolute top-4 right-4 cursor-pointer"
                                onClick={() => {
                                    document.getElementById(`updateGradeModal-${item.id}`)?.classList.add('hidden');
                                }}
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
                </div>
            </td>
        </tr>
    );

    // Dynamic import cho GradeForm
    const GradeForm = dynamic(() => import("@/components/forms/GradeForm"), {
        loading: () => <p>Loading form...</p>,
    });

    // Hàm xử lý xóa khối
    const handleDeleteGrade = async (id: number) => {
        try {
            const result = await deleteGrade(id);
            
            if (result.success) {
                toast.success(result.message || "Xóa khối thành công");
                setShowDeleteModal(false);
                setGradeToDelete(null);
                fetchGrades(); // Cập nhật lại danh sách khối
            } else {
                toast.error(result.message || "Không thể xóa khối. Khối có thể đang chứa lớp học.");
            }
        } catch (error) {
            console.error("Lỗi khi xóa khối:", error);
            toast.error("Có lỗi xảy ra khi xóa khối");
        }
    };

    return (
        <div className="p-4 flex-1 m-4 mt-0 bg-white rounded-md">
            {/* Title and Tab Selection */}
            <div className="flex flex-col space-y-4">
                <h1 className="text-lg font-semibold hidden md:block">
                    Quản lý lớp học và khối
                </h1>
                
                {selectedGrade && (
                    <div className="flex items-center mb-2">
                        <span className="text-gray-500 mr-2">Đang lọc theo khối:</span>
                        <span className="font-medium">{grades.find(g => g.id === selectedGrade)?.name}</span>
                        <button 
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() => setSelectedGrade(null)}
                        >
                            <Image src="/close.png" alt="Xóa lọc" width={14} height={14} />
                        </button>
                    </div>
                )}

                {/* Tab navigation */}
                <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
                    <button
                        className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                            ${activeTab === 'classes' 
                                ? 'bg-white shadow text-blue-600' 
                                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('classes')}
                    >
                        Lớp học
                    </button>
                    <button
                        className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                            ${activeTab === 'grades' 
                                ? 'bg-white shadow text-blue-600' 
                                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('grades')}
                    >
                        Khối lớp
                    </button>
                </div>

                {/* Tab content */}
                <div className="mt-2">
                    {activeTab === 'classes' && (
                        <div>
                            {/* Phần Lớp học */}
                            <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto justify-between mb-4">
                    <TableSearch />
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
                            <FormModal table="class" type="create" />
                                </div>
                            </div>
                            
                            {loading || filteredClasses.length === 0 ? (
                                <div className="text-center py-8">
                                    {loading ? (
                                        <div>
                                            <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
                                                <span className="sr-only">Đang tải...</span>
                                            </div>
                                            <p className="mt-2 text-gray-500">Đang tải dữ liệu lớp học...</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-gray-500">Không có dữ liệu lớp học</p>
                                            <button 
                                                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                                                onClick={() => document.getElementById('createClassModal')?.classList.remove('hidden')}
                                            >
                                                Thêm lớp học mới
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Table 
                                    columns={classColumns} 
                                    renderRow={renderClassRow} 
                                    data={filteredClasses} 
                                />
                            )}
                        </div>
                    )}

                    {activeTab === 'grades' && (
                        <div>
                            {/* Phần Khối lớp */}
                            <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto justify-between mb-4">
                                <TableSearch />
                                <div className="flex gap-4 items-center self-end">
                                    <button
                                        className="w-8 h-8 bg-[var(--yellow-pastel)] flex items-center justify-center rounded-full cursor-pointer"
                                        onClick={() => {
                                            document.getElementById('createGradeModal')?.classList.remove('hidden');
                                        }}
                                    >
                                        <Image src="/create.png" alt="Tạo mới" width={16} height={16} />
                                    </button>
                                </div>
                            </div>
                            
                            {loading || grades.length === 0 ? (
                                <div className="text-center py-8">
                                    {loading ? (
                                        <div>
                                            <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
                                                <span className="sr-only">Đang tải...</span>
                                            </div>
                                            <p className="mt-2 text-gray-500">Đang tải dữ liệu khối lớp...</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-gray-500">Không có dữ liệu khối lớp</p>
                                            <button 
                                                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                                                onClick={() => document.getElementById('createGradeModal')?.classList.remove('hidden')}
                                            >
                                                Thêm khối lớp mới
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Table 
                                    columns={gradeColumns} 
                                    renderRow={renderGradeRow} 
                                    data={grades} 
                                />
                            )}
                            
                            {/* Modal tạo khối mới */}
                            <div id="createGradeModal" className="fixed inset-0 z-[9999] w-screen h-screen bg-black/60 flex items-center justify-center hidden">
                                <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] z-50">
                                    <GradeForm 
                                        type="create"
                                        onSuccess={() => {
                                            document.getElementById('createGradeModal')?.classList.add('hidden');
                                            fetchGrades();
                                        }}
                                    />
                                    <div
                                        className="absolute top-4 right-4 cursor-pointer"
                                        onClick={() => {
                                            document.getElementById('createGradeModal')?.classList.add('hidden');
                                        }}
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
                        </div>
                    )}
                </div>
            </div>

            {/* Modal xác nhận xóa khối */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[9999] w-screen h-screen bg-black/60 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] z-50">
                        <div className="p-4 gap-4 flex flex-col items-center justify-center">
                            <Image src="/warning.png" alt="" width={150} height={150} />
                            <span className="text-center font-semibold text-2xl uppercase">
                                Bạn có chắc chắn muốn xóa?
                            </span>
                            <span className="text-center font-medium text-lg text-gray-500">
                                Dữ liệu sẽ không thể được khôi phục. Các lớp thuộc khối này sẽ không bị xóa.
                            </span>
                            <div className="flex gap-8 mt-8">
                                <button 
                                    className="bg-gray-400 text-white py-2 px-4 rounded-md border-none w-max self-center font-semibold hover:shadow-lg hover:-translate-y-1 transform transition duration-300"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setGradeToDelete(null);
                                    }}
                                >
                                    Hủy
                                </button>
                                <button 
                                    className="bg-red-600 text-white py-2 px-4 rounded-md border-none w-max self-center font-semibold hover:shadow-lg hover:-translate-y-1 transform transition duration-300"
                                    onClick={() => {
                                        if (gradeToDelete) {
                                            handleDeleteGrade(gradeToDelete);
                                        }
                                    }}
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                        <div
                            className="absolute top-4 right-4 cursor-pointer"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setGradeToDelete(null);
                            }}
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

            {/* Modal tạo lớp học mới */}
            <div id="createClassModal" className="fixed inset-0 z-[9999] w-screen h-screen bg-black/60 flex items-center justify-center hidden">
                <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] z-50">
                    <FormModal 
                        table="class" 
                        type="create" 
                    />
                    <div
                        className="absolute top-4 right-4 cursor-pointer"
                        onClick={() => {
                            document.getElementById('createClassModal')?.classList.add('hidden');
                        }}
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

            <Pagination />
        </div>
    );
};

export default ClassManagementPage;
