"use client";
import {
    BarChart,
    Bar,
    Rectangle,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const data = [
    {
        name: "Thứ 2 ",
        present: 120,
        absent: 20,
    },
    {
        name: "Thứ 3 ",
        present: 100,
        absent: 40,
    },
    {
        name: "Thứ 4 ",
        present: 90,
        absent: 50,
    },
    {
        name: "Thứ 5 ",
        present: 80,
        absent: 60,
    },
    {
        name: "Thứ 6 ",
        present: 60,
        absent: 80,
    },
];

const AttendanceChart = () => {
    return (
        <div className="bg-white rounded-lg  h-full p-4">
            {/* Title count chart */}
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold">Điểm danh </h1>
                <img src="/moreDark.png" alt="" width={20} height={20} />
            </div>
            {/* Chart  */}
            <ResponsiveContainer width="100%" height="90%">
                <BarChart width={500} height={300} data={data} barSize={20}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#ddd"
                    />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#d1d5db" }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#d1d5db" }}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: "10px",
                            borderColor: "lightgray",
                        }}
                    />
                    <Legend
                        align="left"
                        verticalAlign="top"
                        wrapperStyle={{
                            paddingTop: "20px",
                            paddingBottom: "40px",
                        }}
                    />
                    <Bar
                        dataKey="present"
                        name="Có mặt"
                        fill="var(--purple-pastel)"
                        legendType="circle"
                        radius={[10, 10, 0, 0]}
                    />
                    <Bar
                        dataKey="absent"
                        name="Vắng mặt"
                        fill="var(--blue-pastel)"
                        legendType="circle"
                        radius={[10, 10, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AttendanceChart;
