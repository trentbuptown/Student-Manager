"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import Image from "next/image";
const data = [
    {
        name: "Jan",
        income: 40000,
        expense: 24000,
    },
    {
        name: "Feb",
        income: 20000,
        expense: 14000,
    },
    {
        name: "Mar",
        income: 30000,
        expense: 20000,
    },
    {
        name: "Apr",
        income: 35000,
        expense: 15000,
    },
    {
        name: "May",
        income: 60000,
        expense: 20000,
    },
    {
        name: "Jun",
        income: 50000,
        expense: 24000,
    },
    {
        name: "Jul",
        income: 40000,
        expense: 50000,
    },
    {
        name: "Aug",
        income: 30000,
        expense: 40000,
    },
    {
        name: "Sept",
        income: 40000,
        expense: 10000,
    },
    {
        name: "Oct",
        income: 40000,
        expense: 24000,
    },
    {
        name: "Nov",
        income: 40000,
        expense: 30000,
    },
    {
        name: "Dec",
        income: 50000,
        expense: 40000,
    },
];

const financeData = [
    {
        id: "1",
        name: "Tổng thu nhập",
        count: "200.000.000 VNĐ ",
    },
    {
        id: "2",
        name: "Tổng chi tiêu",
        count: "100.000.000 VNĐ",
    },
];
const FinanceChart = () => {
    return (
        <div className="bg-white rounded-xl w-full h-full p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold">Thống kê tài chính </h1>
                <Image src="/moreDark.png" alt="" width={20} height={20} />
            </div>

            <ResponsiveContainer width="100%" height="90%">
                <LineChart
                    width={500}
                    height={300}
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={10}
                        tick={{ fill: "#d1d5db" }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickMargin={20}
                        tick={{ fill: "#d1d5db" }}
                    />
                    <Tooltip />
                    <Legend
                        align="center"
                        verticalAlign="top"
                        wrapperStyle={{
                            paddingTop: "10px",
                            paddingBottom: "30px",
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="income"
                        name="Thu nhập"
                        stroke="var(--blue-pastel)"
                        strokeWidth={5}
                    />
                    <Line
                        type="monotone"
                        dataKey="expense"
                        name="Chi tiêu"
                        stroke="var(--pink-pastel)"
                        strokeWidth={5}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default FinanceChart;
