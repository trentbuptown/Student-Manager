import BigCalendar from "@/components/BigCalendar";
import Performance from "@/components/Performance";
import Announcements from "@/components/Announcements";
import Image from "next/image";
import Link from "next/link";
import FormModal from "@/components/FormModal";

const TeacherDetailPage = () => {
    return (
        <div className="p-4 gap-4 flex flex-col lg:flex-row">
            {/* Left side */}
            <div className="w-full lg:w-2/3">
                <div className="flex gap-4 flex-col lg:flex-row">
                    {/* User Info Card  */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="bg-[var(--blue-pastel)] py-6 px-4 rounded-md flex flex-1 gap-4 ">
                            <div className="w-1/3">
                                <Image
                                    src="https://static.vecteezy.com/system/resources/previews/036/356/817/non_2x/ai-generated-attractive-manager-asian-businesswoman-ceo-confident-standing-front-of-exterior-modern-office-building-free-photo.jpg"
                                    alt=""
                                    width={144}
                                    height={144}
                                    className="w-36 h-36 rounded-full object-cover"
                                />
                            </div>

                            <div className="w-2/3 flex flex-col gap-4 justify-between">
                                <div className="flex items-center gap-4">
                                    <h1 className="text-xl font-semibold">
                                        Boww Boww
                                    </h1>
                                    <FormModal
                                        table="teacher"
                                        type="update"
                                        data={{
                                            id: 1,
                                            username: "Boww Boww",
                                            email: "teacher@gmail.com",
                                            password: "12345678",
                                            firstName: "Boww",
                                            lastName: "Boww",
                                            phone: "0987654321",
                                            address: "123 Street",
                                            birthday: "2000-01-01",
                                            sex: "male",
                                            img: "https://static.vecteezy.com/system/resources/previews/036/356/817/non_2x/ai-generated-attractive-manager-asian-businesswoman-ceo-confident-standing-front-of-exterior-modern-office-building-free-photo.jpg",
                                        }}
                                    />
                                </div>
                                <p className="text-sm text-gray-500">
                                    Giáo viên chủ nhiệm của lớp 5A, đồng thời là
                                    giáo viên bộ môn Toán.
                                </p>
                                <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                                    <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                        <Image
                                            src="/date.png"
                                            alt=""
                                            width={14}
                                            height={14}
                                        />
                                        <span className="whitespace-nowrap">
                                            Tháng 1 năm 2025
                                        </span>
                                    </div>
                                    <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                        <Image
                                            src="/phone.png"
                                            alt=""
                                            width={14}
                                            height={14}
                                        />
                                        <span>0987654321</span>
                                    </div>
                                    <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                        <Image
                                            src="/mail.png"
                                            alt=""
                                            width={14}
                                            height={14}
                                        />
                                        <span className="whitespace-nowrap">
                                            teacher@gmail.com
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Extra Info Card  */}
                        <div className="flex-1 flex gap-4 justify-between flex-wrap">
                            {/* CARD */}
                            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                                <Image
                                    src="/singleAttendance.png"
                                    alt=""
                                    width={24}
                                    height={24}
                                    className="w-6 h-6"
                                />
                                <div className="">
                                    <h1 className="text-xl font-semibold">
                                        90%
                                    </h1>
                                    <span className="text-sm text-gray-400">
                                        Điểm danh
                                    </span>
                                </div>
                            </div>
                            {/* CARD */}
                            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                                <Image
                                    src="/singleBranch.png"
                                    alt=""
                                    width={24}
                                    height={24}
                                    className="w-6 h-6"
                                />
                                <div className="">
                                    <h1 className="text-xl font-semibold">2</h1>
                                    <span className="text-sm text-gray-400">
                                        Chuyên môn
                                    </span>
                                </div>
                            </div>
                            {/* CARD */}
                            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                                <Image
                                    src="/singleLesson.png"
                                    alt=""
                                    width={24}
                                    height={24}
                                    className="w-6 h-6"
                                />
                                <div className="">
                                    <h1 className="text-xl font-semibold">6</h1>
                                    <span className="text-sm text-gray-400">
                                        Bài giảng
                                    </span>
                                </div>
                            </div>
                            {/* CARD */}
                            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                                <Image
                                    src="/singleClass.png"
                                    alt=""
                                    width={24}
                                    height={24}
                                    className="w-6 h-6"
                                />
                                <div className="">
                                    <h1 className="text-xl font-semibold">6</h1>
                                    <span className="text-sm text-gray-400">
                                        Lớp phụ trách
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Calendar  */}
                <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
                    <h1>Thời khóa biểu của Giáo viên</h1>
                    <BigCalendar />
                </div>
            </div>
            {/* Right side */}
            <div className="flex flex-col gap-4 w-full lg:w-1/3">
                <div className="bg-white p-4 rounded-md">
                    <h1 className="text-xl font-semibold">
                        Thông tin giảng dạy
                    </h1>
                    <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
                        <Link
                            className="p-3 rounded-md bg-[var(--light-blue)] hover:shadow-lg hover:-translate-y-1 transform transition duration-300"
                            href="/"
                        >
                            Lớp dạy
                        </Link>
                        <Link
                            className="p-3 rounded-md bg-[var(--light-pink)] hover:shadow-lg hover:-translate-y-1 transform transition duration-300"
                            href="/"
                        >
                            Bài giảng
                        </Link>
                        <Link
                            className="p-3 rounded-md bg-[var(--light-yellow)] hover:shadow-lg hover:-translate-y-1 transform transition duration-300"
                            href="/"
                        >
                            Bài kiểm tra
                        </Link>
                        <Link
                            className="p-3 rounded-md bg-[var(--light-blue)] hover:shadow-lg hover:-translate-y-1 transform transition duration-300"
                            href="/"
                        >
                            Bài tập
                        </Link>
                        <Link
                            className="p-3 rounded-md bg-[var(--light-purple)] hover:shadow-lg hover:-translate-y-1 transform transition duration-300"
                            href="/"
                        >
                            Học sinh thuộc lớp của giáo viên
                        </Link>
                    </div>
                </div>
                <Performance />
                <Announcements />
            </div>
        </div>
    );
};

export default TeacherDetailPage;
