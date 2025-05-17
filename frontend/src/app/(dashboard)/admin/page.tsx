import Announcements from "@/components/Announcements";
import AttendanceChart from "@/components/AttendanceChart";
import CountChart from "@/components/CountChart";
import EventCalendar from "@/components/EventCalendar";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import React from "react";

const AdminPage = () => {
    return (
        <div className="p-4 flex gap-4 flex-col">
            {/* User Card */}
            <div className="flex gap-4 justify-between flex-wrap">
                <UserCard />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full lg:w-2/3 flex flex-col gap-8">
                    {/* Chart  */}
                    <div className="flex gap-4 flex-col lg:flex-row">
                        <div className="w-full lg:w-1/3 h-[450px]">
                            <CountChart />
                        </div>
                        <div className="w-full lg:w-2/3 h-[450px]">
                            <AttendanceChart />
                        </div>
                    </div>
                    <div className="w-full h-[500px]">
                        <FinanceChart />
                    </div>
                </div>
                {/* Right Sidebar */}
                <div className="w-full lg:w-1/3 flex flex-col gap-8">
                    <EventCalendar />
                    <Announcements />
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
