'use client';

import Image from "next/image";

// Giả lập dữ liệu thống kê
const stats = [
    {
        name: 'Tổng số học sinh',
        value: '1,234',
        icon: '/student.png',
        change: '+4.75%',
        changeType: 'increase'
    },
    {
        name: 'Tổng số giáo viên',
        value: '56',
        icon: '/teacher.png',
        change: '+1.2%',
        changeType: 'increase'
    },
    {
        name: 'Số môn học',
        value: '12',
        icon: '/subject.png',
        change: '0%',
        changeType: 'neutral'
    },
    {
        name: 'Lớp học đang hoạt động',
        value: '45',
        icon: '/class.png',
        change: '+2.3%',
        changeType: 'increase'
    },
];

// Giả lập dữ liệu hoạt động gần đây
const recentActivities = [
    {
        id: 1,
        user: 'Nguyễn Văn A',
        action: 'đã thêm điểm môn Toán cho lớp 10A1',
        timestamp: '2 phút trước',
        avatar: '/avatar.png'
    },
    {
        id: 2,
        user: 'Trần Thị B',
        action: 'đã cập nhật thời khóa biểu lớp 11A2',
        timestamp: '15 phút trước',
        avatar: '/avatar.png'
    },
    {
        id: 3,
        user: 'Lê Văn C',
        action: 'đã thêm thông báo mới',
        timestamp: '1 giờ trước',
        avatar: '/avatar.png'
    },
    {
        id: 4,
        user: 'Phạm Thị D',
        action: 'đã điểm danh lớp 12A3',
        timestamp: '2 giờ trước',
        avatar: '/avatar.png'
    },
];

export default function Dashboard() {
    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Tổng quan hệ thống
                </h1>
                <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1a42bf] hover:bg-[#153288]">
                    Tạo báo cáo
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div
                        key={item.name}
                        className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                    >
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="rounded-md bg-[var(--blue-pastel)] p-3">
                                        <Image
                                            src={item.icon}
                                            alt={item.name}
                                            width={24}
                                            height={24}
                                        />
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            {item.name}
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-gray-900">
                                                {item.value}
                                            </div>
                                            <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                                                item.changeType === 'increase'
                                                    ? 'text-green-600'
                                                    : item.changeType === 'decrease'
                                                    ? 'text-red-600'
                                                    : 'text-gray-500'
                                            }`}>
                                                {item.change}
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Hoạt động gần đây
                    </h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {recentActivities.map((activity) => (
                        <div
                            key={activity.id}
                            className="px-4 py-4 sm:px-6 hover:bg-gray-50"
                        >
                            <div className="flex items-center">
                                <Image
                                    src={activity.avatar}
                                    alt=""
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        <span className="font-semibold">{activity.user}</span>{' '}
                                        {activity.action}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {activity.timestamp}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 