"use client";

import React from 'react';
import { Score } from '@/services/scoreService';

type ScoreTableProps = {
  data: Score[];
  columns: {
    Header: string;
    accessor: string;
    Cell?: (props: { value: any, row?: any }) => React.ReactNode;
  }[];
  onEdit: (item: Score) => void;
  onDelete: (id: number) => void;
};

const ScoreTable: React.FC<ScoreTableProps> = ({
  data,
  columns,
  onEdit,
  onDelete
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full mt-4 border-collapse">
        <thead>
          <tr className="text-left text-gray-500 text-sm border-b">
            {columns.map((column) => (
              <th key={column.accessor} className="py-3 px-4 font-semibold">
                {column.Header}
              </th>
            ))}
            <th className="py-3 px-4 text-right font-semibold">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                {columns.map((column) => {
                  const value = item[column.accessor as keyof Score];
                  return (
                    <td key={`${item.id}-${column.accessor}`} className="py-3 px-4">
                      {column.Cell ? column.Cell({ value, row: { original: item } }) : String(value)}
                    </td>
                  );
                })}
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="py-4 px-4 text-center text-gray-500">
                Chưa có điểm nào. Bắt đầu thêm mới!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ScoreTable; 