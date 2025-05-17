'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import RegulationModal from '@/components/modals/RegulationModal';
import { ruleService, Rule } from '@/services/ruleService';
import { toast } from 'react-hot-toast';

export default function Messages() {
    const [searchTerm, setSearchTerm] = useState('');
    const [regulations, setRegulations] = useState<Rule[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRegulation, setEditingRegulation] = useState<Rule | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [isLoading, setIsLoading] = useState(true);

    // Fetch regulations when component mounts
    useEffect(() => {
        fetchRegulations();
    }, []);

    const fetchRegulations = async () => {
        try {
            const data = await ruleService.getAll();
            setRegulations(data);
        } catch (error) {
            toast.error('Không thể tải danh sách quy định');
            console.error('Error fetching regulations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredRegulations = regulations.filter(reg =>
        reg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddRegulation = () => {
        setModalMode('add');
        setEditingRegulation(null);
        setIsModalOpen(true);
    };

    const handleEditRegulation = (regulation: Rule) => {
        setModalMode('edit');
        setEditingRegulation(regulation);
        setIsModalOpen(true);
    };

    const handleDeleteRegulation = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa quy định này?')) {
            try {
                await ruleService.delete(id);
                setRegulations(regulations.filter(reg => reg.id !== id));
                toast.success('Xóa quy định thành công');
            } catch (error) {
                toast.error('Không thể xóa quy định');
                console.error('Error deleting regulation:', error);
            }
        }
    };

    const handleModalSubmit = async (data: { title: string; content: string }) => {
        try {
            if (modalMode === 'add') {
                // TODO: Lấy admin_id từ context hoặc state
                const admin_id = 1; // Tạm thời hardcode
                const newRegulation = await ruleService.create({ ...data, admin_id });
                setRegulations([...regulations, newRegulation]);
                toast.success('Thêm quy định thành công');
            } else if (editingRegulation) {
                const updatedRegulation = await ruleService.update(editingRegulation.id, data);
                setRegulations(regulations.map(reg =>
                    reg.id === editingRegulation.id ? updatedRegulation : reg
                ));
                toast.success('Cập nhật quy định thành công');
            }
        } catch (error) {
            toast.error(modalMode === 'add' ? 'Không thể thêm quy định' : 'Không thể cập nhật quy định');
            console.error('Error submitting regulation:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a42bf]"></div>
            </div>
        );
    }

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
                                    className="p-1 rounded-md bg-blue-300 hover:bg-blue-5000"
                                >
                                    <Image src="/update.png" alt="Sửa" width={20} height={20} />
                                </button>
                                <button
                                    onClick={() => handleDeleteRegulation(reg.id)}
                                    className="p-1 rounded-md bg-red-300 hover:bg-red-500"
                                >
                                    <Image src="/delete.png" alt="Xóa" width={20} height={20} />
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm">{reg.content}</p>
                        <div className="text-xs text-gray-400 mt-2">
                            Cập nhật lần cuối: {new Date(reg.updated_at).toLocaleString('vi-VN')}
                        </div>
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