import Pagination from "@/components/Pagination";
import Image from "next/image";
import Link from "next/link";
import { role, studentsData } from "@/lib/data";
import TableSearch from "@/components/TableSearch";
import Table from "@/components/Table";
import FormModal from "@/components/FormModal";

type Student = {
    id: number;
    studentId: string;
    name: string;
    surname: string;
    email?: string;
    class: string;
    grade: number;
    phone?: string;
    address: string;
    photo: string;
};

const columns = [
    {
        header: "Thông tin",
        accessor: "Info",
    },
    {
        header: "Mã học sinh",
        accessor: "studentId",
        className: "hidden md:table-cell",
    },
    {
        header: "Khối",
        accessor: "grade",
        className: "hidden md:table-cell",
    },
    {
        header: "Lớp",
        accessor: "class",
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

const StudentListPage = () => {
    const renderRow = (item: Student) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-[var(--light-blue)]"
        >
            <td className="flex items-center gap-4 p-4">
                <Image
                    src={item.photo}
                    alt=""
                    width={40}
                    height={40}
                    className="md:hidden lg:block rounded-full w-10 h-10 object-cover"
                />
                <div className="flex flex-col">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.email}</p>
                </div>
            </td>
            <td className="hidden md:table-cell">{item.studentId}</td>
            <td className="hidden md:table-cell">{item.grade}</td>
            <td className="hidden md:table-cell">{item.class}</td>
            <td className="hidden md:table-cell">{item.phone}</td>
            <td className="hidden md:table-cell">{item.address}</td>
            <td>
                <div className="flex items-center gap-2">
                    {role === "admin" && (
                        <>
                            <FormModal
                                table="student"
                                type="update"
                                data={item}
                            />
                            <FormModal
                                table="student"
                                type="delete"
                                id={item.id}
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
                    Danh sách học sinh
                </h1>
                <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
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
                        {role === "admin" && (
                            <FormModal table="student" type="create" />
                        )}
                    </div>
                </div>
            </div>
            <Table
                columns={columns}
                renderRow={renderRow}
                data={studentsData}
            />

            <Pagination />
        </div>
    );
};

export default StudentListPage;
