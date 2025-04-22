import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalendar";

const ParentPage = () => {
    return (
        <div className="p-4 gap-4 flex flex-col lg:flex-row">
            {/* Schedule  */}
            <div className="w-full lg:w-2/3 ">
                <div className="h-full bg-white p-4 rounded-md">
                    <h1 className="text-xl font-semibold">
                        Thời khóa biểu (Thanh Huyền)
                    </h1>
                    <BigCalendar />
                </div>
            </div>

            {/* Right Sidebar */}
            <div className=" w-full lg:w-1/3 gap-8 flex flex-col">
                <Announcements />
            </div>
        </div>
    );
};

export default ParentPage;
