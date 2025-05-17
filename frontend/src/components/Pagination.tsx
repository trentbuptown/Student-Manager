"use client";

import Image from "next/image";
import { useState } from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ 
    currentPage = 1, 
    totalPages = 1, 
    onPageChange 
}: PaginationProps) => {
    // Tạo mảng các số trang để hiển thị
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5; // Số trang tối đa hiển thị
        
        if (totalPages <= maxPagesToShow) {
            // Nếu tổng số trang ít hơn maxPagesToShow, hiển thị tất cả
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Luôn hiển thị trang đầu tiên
            pageNumbers.push(1);
            
            // Tính toán trang bắt đầu và kết thúc để hiển thị
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);
            
            // Điều chỉnh nếu cần thiết
            if (startPage === 2) endPage = Math.min(totalPages - 1, startPage + 2);
            if (endPage === totalPages - 1) startPage = Math.max(2, endPage - 2);
            
            // Thêm dấu ... nếu cần
            if (startPage > 2) pageNumbers.push(-1); // -1 đại diện cho "..."
            
            // Thêm các trang ở giữa
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
            
            // Thêm dấu ... nếu cần
            if (endPage < totalPages - 1) pageNumbers.push(-2); // -2 đại diện cho "..."
            
            // Luôn hiển thị trang cuối cùng
            pageNumbers.push(totalPages);
        }
        
        return pageNumbers;
    };

    return (
        <div className="flex items-center justify-between p-4">
            <span className="text-sm text-gray-500">
                Trang {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
                <button 
                    className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <Image src="/left.png" alt="" width={14} height={14} />
                </button>
                
                {getPageNumbers().map((pageNumber, index) => {
                    if (pageNumber < 0) {
                        // Hiển thị dấu "..." cho các trang bị bỏ qua
                        return (
                            <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center">
                                ...
                            </span>
                        );
                    }
                    
                    return (
                        <button
                            key={pageNumber}
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                pageNumber === currentPage
                                    ? "bg-blue-600 text-white"
                                    : "border border-gray-300"
                            }`}
                            onClick={() => onPageChange(pageNumber)}
                        >
                            {pageNumber}
                        </button>
                    );
                })}
                
                <button 
                    className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <Image src="/right.png" alt="" width={14} height={14} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
