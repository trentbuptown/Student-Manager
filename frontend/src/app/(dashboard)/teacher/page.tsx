import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalendar";
import EventCalendar from "@/components/EventCalendar";
import Link from "next/link";
import { FaUserTie, FaCalendarAlt, FaChalkboardTeacher } from "react-icons/fa";

const TeacherPage = () => {
    return (
        <div className="p-4 gap-4 flex flex-col">
            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Link href="/teacher/list" className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg flex items-center">
                    <FaUserTie className="text-2xl mr-3" />
                    <div>
                        <h3 className="font-bold">Quản lý giáo viên</h3>
                        <p className="text-sm">Xem và quản lý danh sách giáo viên</p>
                    </div>
                </Link>
                <div className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg flex items-center">
                    <FaCalendarAlt className="text-2xl mr-3" />
                    <div>
                        <h3 className="font-bold">Lịch giảng dạy</h3>
                        <p className="text-sm">Xem lịch giảng dạy của bạn</p>
                    </div>
                </div>
                <div className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg flex items-center">
                    <FaChalkboardTeacher className="text-2xl mr-3" />
                    <div>
                        <h3 className="font-bold">Lớp học</h3>
                        <p className="text-sm">Quản lý lớp học của bạn</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                {/* Schedule  */}
                <div className="w-full lg:w-2/3 ">
                    <div className="h-full bg-white p-4 rounded-md">
                        <h1 className="text-xl font-semibold">
                            Thời khóa biểu lớp C4
                        </h1>
                        <BigCalendar />
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className=" w-full lg:w-1/3 gap-8 flex flex-col">
                    <EventCalendar />
                    <Announcements />
                </div>
            </div>
        </div>
    );
};

export default TeacherPage;
