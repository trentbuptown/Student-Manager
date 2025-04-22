import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import Table from "@/components/Table";
import Image from "next/image";
import Link from "next/link";
import { role, teachersData } from "@/lib/data";
import FormModal from "@/components/FormModal";

type Teacher = {
    id: number;
    teacherId: string;
    name: string;
    email?: string;
    photo: string;
    subjects: string[];
    classes: string[];
    phone: string;
    address: string;
};

const columns = [
    {
        header: "Thông tin",
        accessor: "Info",
    },
    {
        header: "Mã giáo viên",
        accessor: "teacherId",
        className: "hidden md:table-cell",
    },
    {
        header: "Môn học",
        accessor: "subjects",
        className: "hidden md:table-cell",
    },
    {
        header: "Dạy lớp",
        accessor: "classes",
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
    const renderRow = (item: Teacher) => (
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
            <td className="hidden md:table-cell">{item.teacherId}</td>
            <td className="hidden md:table-cell">{item.subjects.join(", ")}</td>
            <td className="hidden md:table-cell">{item.classes.join(", ")}</td>
            <td className="hidden md:table-cell">{item.phone}</td>
            <td className="hidden md:table-cell">{item.address}</td>
            <td>
                <div className="flex items-center gap-2">
                    {role === "admin" && (
                        <>
                            <FormModal
                                table="teacher"
                                type="update"
                                data={item}
                            />
                            <FormModal
                                table="teacher"
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
                    Danh sách giáo viên
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
                            <FormModal table="teacher" type="create" />
                        )}
                        {/* <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--yellow-pastel)] ">
                            <Image
                                src="/create.png"
                                alt=""
                                width={14}
                                height={14}
                            />
                        </button> */}
                    </div>
                </div>
            </div>
            <Table
                columns={columns}
                renderRow={renderRow}
                data={teachersData}
            />

            <Pagination />
        </div>
    );
};

export default TeacherListPage;
