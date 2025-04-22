import Image from "next/image";
import Link from "next/link";

const events = [
    {
        id: 1,
        title: "Khai giảng năm học mới ",
        time: "9:00 AM - 12:00 AM",
        description:
            "Buổi lễ gồm các tiết mục văn nghệ, diễn văn chào mừng của Ban Giám hiệu, phát biểu của giáo viên và học sinh",
    },
    {
        id: 2,
        title: "Hội thi nghiên cứu khoa học ",
        time: "8:00 AM - 5:00 PM",
        description:
            "Trình bày ý tưởng, sản phẩm, đề tài nghiên cứu của mình trước hội đồng giám khảo.",
    },
    {
        id: 3,
        title: "Ngày Nhà giáo Việt Nam",
        time: "9:00 AM - 12:00 AM",
        description:
            "Tổ chức vào ngày 20 tháng 11 để tri ân và tôn vinh các thầy cô giáo, những người đã đóng góp công sức, trí tuệ vào sự nghiệp giáo dục nước nhà. ",
    },
];

const Announcements = () => {
    return (
        <div className="bg-white p-4 rounded-md">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold my-4">Announcements</h1>
                <Link href="" className="text-gray-300 text-sm">
                    View All
                </Link>
            </div>
            <div className="flex flex-col gap-4 mt-4">
                {events.map((event, index) => {
                    const bgColors = [
                        "bg-[#e2f8ff]",
                        "bg-[#f2f1ff]",
                        "bg-[#fefce8]",
                    ];
                    const bgColor = bgColors[index % 3];

                    return (
                        <div
                            className={`p-5 rounded-md border-2 border-gray-100 ${bgColor}`}
                            key={event.id}
                        >
                            <div className="flex items-center justify-between">
                                <h1 className="font-medium">{event.title}</h1>
                                <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                                    {event.time}
                                </span>
                            </div>
                            <p className="mt-2 text-gray-400 text-sm">
                                {event.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Announcements;
