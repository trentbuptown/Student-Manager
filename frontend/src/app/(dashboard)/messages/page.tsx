'use client';

import { useState } from 'react';
import Image from 'next/image';
import RegulationModal from '@/components/modals/RegulationModal';

// Dữ liệu mẫu cho các quy định
const initialRegulations = [
    {
        id: 1,
        title: 'Quy định về đồng phục học sinh',
        content: 'Học sinh phải mặc đồng phục đúng quy định của nhà trường, áo sơ mi trắng, quần/váy xanh đậm, đi giày hoặc dép có quai hậu.',
        lastUpdated: '2 phút trước',
    },
    {
        id: 2,
        title: 'Quy định về giờ học',
        content: 'Học sinh phải có mặt tại trường trước 7h00 sáng. Các tiết học bắt đầu đúng giờ, học sinh đi trễ phải có giấy phép của giáo viên chủ nhiệm.',
        lastUpdated: '15 phút trước',
    },
    {
        id: 3,
        title: 'Quy định về ứng xử',
        content: 'Học sinh phải có thái độ tôn trọng với thầy cô, nhân viên nhà trường và các bạn học sinh khác. Không được nói tục, chửi thề, gây gổ đánh nhau.',
        lastUpdated: '1 giờ trước',
    },
    {
        id: 4,
        title: 'Quy định về vệ sinh',
        content: 'Học sinh có trách nhiệm giữ gìn vệ sinh chung, bỏ rác đúng nơi quy định, không viết, vẽ lên bàn ghế, tường nhà trường.',
        lastUpdated: '2 giờ trước',
    },
    {
        id: 5,
        title: 'Quy định về điện thoại',
        content: 'Học sinh không được sử dụng điện thoại di động trong giờ học. Điện thoại phải tắt nguồn và cất trong cặp.',
        lastUpdated: '3 giờ trước',
    }
];

export default function Messages() {
    const [searchTerm, setSearchTerm] = useState('');
    const [regulations, setRegulations] = useState(initialRegulations);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRegulation, setEditingRegulation] = useState<any>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    const filteredRegulations = regulations.filter(reg =>
        reg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddRegulation = () => {
        setModalMode('add');
        setEditingRegulation(null);
        setIsModalOpen(true);
    };

    const handleEditRegulation = (regulation: any) => {
        setModalMode('edit');
        setEditingRegulation(regulation);
        setIsModalOpen(true);
    };

    const handleDeleteRegulation = (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa quy định này?')) {
            setRegulations(regulations.filter(reg => reg.id !== id));
        }
    };

    const handleModalSubmit = (data: any) => {
        if (modalMode === 'add') {
            const newRegulation = {
                id: regulations.length + 1,
                ...data,
                lastUpdated: 'Vừa xong',
            };
            setRegulations([...regulations, newRegulation]);
        } else {
            setRegulations(regulations.map(reg =>
                reg.id === editingRegulation.id
                    ? { ...reg, ...data, lastUpdated: 'Vừa cập nhật' }
                    : reg
            ));
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quy định trường học</h1>
                    <p className="mt-1 text-gray-500 text-base">Danh sách các quy định và nội quy của nhà trường</p>
                </div>
                <button
                    onClick={handleAddRegulation}
                    className="flex items-center gap-2 bg-[#1a42bf] text-white px-4 py-2 rounded-lg hover:bg-[#153288]"
                >
                    <span>Thêm quy định</span>
                </button>
            </div>

            {/* Search bar */}
            <div className="mb-6">
                <div className="relative max-w-3xl">
                    <input
                        type="text"
                        className="w-full pl-4 pr-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a42bf] text-base"
                        placeholder="Tìm kiếm quy định..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Card quy định */}
            <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
                {filteredRegulations.length === 0 && (
                    <div className="p-6 text-center text-gray-400">Không có quy định nào phù hợp.</div>
                )}
                {filteredRegulations.map((reg) => (
                    <div key={reg.id} className="p-4 hover:bg-gray-50 transition group">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900 text-base">{reg.title}</h3>
                            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEditRegulation(reg)}
                                    className="text-gray-400 hover:text-[#1a42bf]"
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={() => handleDeleteRegulation(reg.id)}
                                    className="text-gray-400 hover:text-red-600"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm">{reg.content}</p>
                        <div className="text-xs text-gray-400 mt-2">{reg.lastUpdated}</div>
                    </div>
                ))}
            </div>

            <RegulationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={editingRegulation}
                mode={modalMode}
            />
        </div>
    );
} 