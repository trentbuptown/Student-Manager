"use client";
import {
    RadialBarChart,
    RadialBar,
    Legend,
    ResponsiveContainer,
} from "recharts";

import Image from "next/image";
const data = [
    {
        name: "Total",
        count: 140,
        fill: "#ffffff",
    },
    {
        name: "Nữ ",
        count: 60,
        fill: "#ffccea",
    },
    {
        name: "Nam",
        count: 80,
        fill: "#bfecff",
    },
];

const CountChart = () => {
    return (
        <div className="bg-white rounded-xl w-full h-full p-4">
            {/* Title count chart */}
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold">Số lượng học sinh</h1>
                <Image src="/moreDark.png" alt="" width={20} height={20} />
            </div>
            {/* Chart Image */}
            <div className="relative w-full h-[75%]">
                <ResponsiveContainer>
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="40%"
                        outerRadius="100%"
                        barSize={32}
                        data={data}
                    >
                        <RadialBar background dataKey="count" />
                    </RadialBarChart>
                </ResponsiveContainer>
                <Image
                    src="/maleFemale.png"
                    alt=""
                    width={80}
                    height={80}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
            </div>
            {/* Chart Legend - Chu thich */}
            <div className="flex justify-center gap-16  ">
                <div className="flex flex-col gap-1 ">
                    <div className="w-5 h-5 bg-[var(--blue-pastel)] rounded-full" />
                    <h1 className="font-bold"> 1,012</h1>
                    <h2 className="text-xs text-gray-300">Boys (60%)</h2>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="w-5 h-5 bg-[var(--pink-pastel)] rounded-full" />
                    <h1 className="font-bold"> 1,012</h1>
                    <h2 className="text-xs text-gray-300">Girls (40%)</h2>
                </div>
            </div>
        </div>
    );
};

export default CountChart;
