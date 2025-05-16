'use client';

import { useState } from 'react';

// Dữ liệu mẫu cho danh sách học sinh
const initialStudents = [
    {
        id: 1,
        name: 'Nguyễn Văn A',
        studentId: '21522001',
        class: '12A1',
        status: 'present', // present, absent, late
        note: '',
    },
    {
        id: 2,
        name: 'Trần Thị B',
        studentId: '21522002',
        class: '12A1',
        status: 'present',
        note: '',
    },
    {
        id: 3,
        name: 'Lê Văn C',
        studentId: '21522003',
        class: '12A1',
        status: 'absent',
        note: 'Có đơn xin phép',
    },
    {
        id: 4,
        name: 'Phạm Thị D',
        studentId: '21522004',
        class: '12A1',
        status: 'late',
        note: 'Đến trễ 15 phút',
    },
    {
        id: 5,
        name: 'Hoàng Văn E',
        studentId: '21522005',
        class: '12A1',
        status: 'present',
        note: '',
    },
];

// Dữ liệu mẫu cho danh sách lớp
const classes = ['12A1', '12A2', '12A3', '12A4', '12A5'];

export default function Attendance() {
    const [selectedClass, setSelectedClass] = useState(classes[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState(initialStudents);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.includes(searchTerm)
    );

    const handleStatusChange = (studentId: number, status: string) => {
        setStudents(students.map(student =>
            student.id === studentId ? { ...student, status } : student
        ));
    };

    const handleNoteChange = (studentId: number, note: string) => {
        setStudents(students.map(student =>
            student.id === studentId ? { ...student, note } : student
        ));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present':
                return 'bg-green-100 text-green-800';
            case 'absent':
                return 'bg-red-100 text-red-800';
            case 'late':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSave = () => {
        // Xử lý lưu điểm danh
        alert('Đã lưu điểm danh!');
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Điểm danh</h1>
                <p className="mt-1 text-gray-500">Quản lý điểm danh học sinh</p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
                    <select
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        {classes.map((className) => (
                            <option key={className} value={className}>
                                {className}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                    <input
                        type="date"
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                        placeholder="Tìm theo tên hoặc mã học sinh..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    STT
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mã học sinh
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Họ và tên
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ghi chú
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStudents.map((student, index) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.studentId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            className={`text-sm rounded-full px-3 py-1 font-medium ${getStatusColor(student.status)}`}
                                            value={student.status}
                                            onChange={(e) => handleStatusChange(student.id, e.target.value)}
                                        >
                                            <option value="present">Có mặt</option>
                                            <option value="absent">Vắng mặt</option>
                                            <option value="late">Đi trễ</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="text"
                                            className="w-full p-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-[#1a42bf]"
                                            placeholder="Thêm ghi chú..."
                                            value={student.note}
                                            onChange={(e) => handleNoteChange(student.id, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#1a42bf] text-white rounded-lg hover:bg-[#153288]"
                >
                    Lưu điểm danh
                </button>
            </div>
        </div>
    );
} 