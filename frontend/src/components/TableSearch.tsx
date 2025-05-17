"use client";

import Image from "next/image";
import { useState } from "react";

const TableSearch = ({ onSearch }: { onSearch: (term: string) => void }) => {
    const [searchTerm, setSearchTerm] = useState("");
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchTerm);
    };
    
    return (
        <form className="flex items-center" onSubmit={handleSearch}>
            <div className="flex items-center gap-2 border border-gray-300 rounded-md p-2">
                <Image src="/search.png" alt="" width={14} height={14} />
                <input
                    type="text"
                    className="text-sm outline-none w-full"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </form>
    );
};

export default TableSearch;
