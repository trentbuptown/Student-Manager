import Link from "next/link";
import Image from "next/image";
import { role } from "@/lib/data";

const menuItems = [
    {
        title: "MENU",
        items: [
            {
                icon: "/home.png",
                label: "Trang chủ",
                href: "/dashboard",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: "/teacher.png",
                label: "Giáo viên",
                href: "/list/teachers",
                visible: ["admin", "teacher"],
            },
            {
                icon: "/student.png",
                label: "Học sinh",
                href: "/list/students",
                visible: ["admin", "teacher"],
            },
            {
                icon: "/subject.png",
                label: "Môn học",
                href: "/list/subjects",
                visible: ["admin"],
            },
            {
                icon: "/class.png",
                label: "Lớp học",
                href: "/list/classes",
                visible: ["admin", "teacher"],
            },
            {
                icon: "/lesson.png",
                label: "Bài học",
                href: "/list/lessons",
                visible: ["admin", "teacher"],
            },
            {
                icon: "/exam.png",
                label: "Kỳ thi",
                href: "/list/exams",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: "/assignment.png",
                label: "Bài tập",
                href: "/list/assignments",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: "/result.png",
                label: "Kết quả",
                href: "/list/results",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: "/attendance.png",
                label: "Điểm danh",
                href: "/attendance",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: "/calendar.png",
                label: "Sự kiện",
                href: "/list/events",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: "/message.png",
                label: "Quy định",
                href: "/messages",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: "/announcement.png",
                label: "Thông báo",
                href: "/list/announcements",
                visible: ["admin", "teacher", "student", "parent"],
            },
        ],
    },
    {
        title: "OTHER",
        items: [
            {
                icon: "/profile.png",
                label: "Hồ sơ",
                href: "/profile",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: "/setting.png",
                label: "Cài đặt",
                href: "/settings",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: "/logout.png",
                label: "Đăng xuất",
                href: "/logout",
                visible: ["admin", "teacher", "student", "parent"],
            },
        ],
    },
];

const Menu = () => {
    return (
        <div className="mt-4 text-sm">
            {menuItems.map((i) => (
                <div className="flex flex-col gap-1" key={i.title}>
                    <span className="hidden lg:block text-gray-400 font-light my-4 ">
                        {i.title}
                    </span>
                    {i.items.map((item) => {
                        if (item.visible.includes(role)) {
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-[var(--blue-pastel)]"
                                >
                                    <Image
                                        src={item.icon}
                                        alt=""
                                        width={20}
                                        height={20}
                                    />
                                    <span className="hidden lg:block">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        }
                        return null;
                    })}
                </div>
            ))}
        </div>
    );
};

export default Menu;
