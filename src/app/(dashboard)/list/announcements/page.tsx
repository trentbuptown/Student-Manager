import Pagination from "@/components/Pagination";
import Image from "next/image";
import Link from "next/link";
import { role, announcementsData } from "@/lib/data";
import TableSearch from "@/components/TableSearch";
import Table from "@/components/Table";
import FormModal from "@/components/FormModal";

type Announcement = {
    id: number;
    title: string;
    class: string;
    date: string;
};

const columns = [
    {
        header: "Tiêu đề",
        accessor: "title",
    },
    {
        header: "Lớp",
        accessor: "class",
    },
    {
        header: "Ngày",
        accessor: "date",
        className: "hidden md:table-cell",
    },
    {
        header: "Chỉnh sửa",
        accessor: "action",
    },
];

const SubjectListPage = () => {
    const renderRow = (item: Announcement) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-[var(--light-blue)]"
        >
            <td className="flex items-center gap-4 p-4">{item.title}</td>
            <td>{item.class}</td>
            <td className="hidden md:table-cell">{item.date}</td>

            <td>
                <div className="flex items-center gap-2">
                    {role === "admin" && (
                        <>
                            <FormModal
                                table="announcement"
                                type="update"
                                data={item}
                            />
                            <FormModal
                                table="announcement"
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
                    Các thông báo
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
                            <FormModal table="announcement" type="create" />
                        )}
                    </div>
                </div>
            </div>
            <Table
                columns={columns}
                renderRow={renderRow}
                data={announcementsData}
            />

            <Pagination />
        </div>
    );
};

export default SubjectListPage;
