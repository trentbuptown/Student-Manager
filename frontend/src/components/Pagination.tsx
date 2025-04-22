const Pagination = () => {
    return (
        <div className="p-4 flex items-center justify-between text-gray-500">
            <button
                disabled
                className="bg-slate-200 text-xs font-semibold py-2 px-4 rounded-md  disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--blue-pastel)]"
            >
                Prev
            </button>
            <div className="flex items-center gap-2 text-sm ">
                <button className="w-8 h-8 rounded-full hover:bg-[var(--blue-pastel)]">
                    1
                </button>
                <button className="w-8 h-8 rounded-full bg-[var(--blue-pastel)]">
                    2
                </button>
                <button className="w-8 h-8 rounded-full  hover:bg-[var(--blue-pastel)]">
                    3
                </button>
                ...
                <button className="w-8 h-8 rounded-full hover:bg-[var(--blue-pastel)]">
                    10
                </button>
            </div>
            <button className="bg-slate-200 text-xs font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--blue-pastel)]">
                Next
            </button>
        </div>
    );
};

export default Pagination;
