import Pagination from "@/components/Pagination";
import Image from "next/image";
import { role, reportsData } from "@/lib/data";
import TableSearch from "@/components/TableSearch";
import Table from "@/components/Table";
import FormModal from "@/components/FormModal";

type Report = {
    id: number;
    student: string;
    class: string;
    subject: string;
    semester: number;
    year: string;
    fifteenScore: number;
    midtermScore: number;
    finalScore: number;
    averageScore: number;
    behavior: string;
};

const columns = [
    {
        header: "Học sinh",
        accessor: "student",
    },
    {
        header: "Lớp",
        accessor: "name",
    },
    {
        header: "Môn học",
        accessor: "subject",
        className: "hidden md:table-cell",
    },
    {
        header: "15ph",
        accessor: "fifteenScore",
        className: "hidden md:table-cell",
    },
    {
        header: "1 tiết",
        accessor: "midtermScore",
        className: "hidden md:table-cell",
    },
    {
        header: "Cuối kỳ",
        accessor: "finalScore",
        className: "hidden md:table-cell",
    },
    {
        header: "Điểm tb",
        accessor: "averageScore",
    },
    {
        header: "Xếp loại",
        accessor: "behavior",
        className: "hidden md:table-cell",
    },
    {
        header: "Học kỳ",
        accessor: "Semester",
        className: "hidden md:table-cell",
    },
    {
        header: "Năm học",
        accessor: "year",
        className: "hidden md:table-cell",
    },
    {
        header: "Chỉnh sửa",
        accessor: "action",
    },
];

const ReportListPage = () => {
    const renderRow = (item: Report) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-[var(--light-blue)]"
        >
            <td className="flex items-center gap-4 p-4">{item.student}</td>
            <td>{item.class}</td>
            <td className="hidden md:table-cell">{item.subject}</td>
            <td className="hidden md:table-cell">{item.fifteenScore}</td>
            <td className="hidden md:table-cell">{item.midtermScore}</td>
            <td className="hidden md:table-cell">{item.finalScore}</td>
            <td>{item.averageScore}</td>
            <td className="hidden md:table-cell">{item.behavior}</td>
            <td className="hidden md:table-cell">{item.semester}</td>
            <td className="hidden md:table-cell">{item.year}</td>
            <td>
                <div className="flex items-center gap-2">
                    {role === "admin" && (
                        <>
                            <FormModal
                                table="report"
                                type="update"
                                data={item}
                            />
                            <FormModal
                                table="report"
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
                    Điểm tổng kết
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
                            <FormModal table="report" type="create" />
                        )}
                    </div>
                </div>
            </div>
            <Table columns={columns} renderRow={renderRow} data={reportsData} />

            <Pagination />
        </div>
    );
};

export default ReportListPage;
