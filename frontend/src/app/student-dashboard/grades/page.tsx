'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/utils/auth';
import { FaChartLine } from 'react-icons/fa';

interface Grade {
  subject_name: string;
  oral_test: string;
  fifteen_minute_test: string;
  forty_five_minute_test: string;
  final_exam: string;
  average: number;
  semester: number;
  school_year: string;
}

export default function StudentGrades() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [selectedYear, setSelectedYear] = useState<string>('2023-2024');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gpa, setGpa] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        const userData = getUser();
        if (!userData) return;
        
        setUser(userData);
        
        try {
          // Tạo dữ liệu mẫu cho điểm số
          const sampleGrades: Grade[] = [
            {
              subject_name: 'Toán học',
              oral_test: '8.5, 9',
              fifteen_minute_test: '8, 9, 8.5',
              forty_five_minute_test: '8.5',
              final_exam: '9',
              average: 8.7,
              semester: 1,
              school_year: '2023-2024'
            },
            {
              subject_name: 'Vật lý',
              oral_test: '8, 7.5',
              fifteen_minute_test: '7, 8, 8',
              forty_five_minute_test: '7.5',
              final_exam: '8',
              average: 7.8,
              semester: 1,
              school_year: '2023-2024'
            },
            {
              subject_name: 'Hóa học',
              oral_test: '9, 8.5',
              fifteen_minute_test: '8.5, 9, 8',
              forty_five_minute_test: '9',
              final_exam: '8.5',
              average: 8.7,
              semester: 1,
              school_year: '2023-2024'
            },
            {
              subject_name: 'Sinh học',
              oral_test: '7.5, 8',
              fifteen_minute_test: '8, 7.5, 8',
              forty_five_minute_test: '8',
              final_exam: '7.5',
              average: 7.8,
              semester: 1,
              school_year: '2023-2024'
            },
            {
              subject_name: 'Ngữ văn',
              oral_test: '8, 8.5',
              fifteen_minute_test: '7.5, 8, 8.5',
              forty_five_minute_test: '8',
              final_exam: '8.5',
              average: 8.2,
              semester: 1,
              school_year: '2023-2024'
            },
            {
              subject_name: 'Lịch sử',
              oral_test: '9, 8',
              fifteen_minute_test: '8.5, 9, 8',
              forty_five_minute_test: '8.5',
              final_exam: '9',
              average: 8.7,
              semester: 1,
              school_year: '2023-2024'
            },
            {
              subject_name: 'Địa lý',
              oral_test: '8.5, 9',
              fifteen_minute_test: '9, 8.5, 9',
              forty_five_minute_test: '9',
              final_exam: '8.5',
              average: 8.8,
              semester: 1,
              school_year: '2023-2024'
            },
            {
              subject_name: 'Tiếng Anh',
              oral_test: '9, 9.5',
              fifteen_minute_test: '9, 9.5, 9',
              forty_five_minute_test: '9.5',
              final_exam: '9',
              average: 9.2,
              semester: 1,
              school_year: '2023-2024'
            },
            {
              subject_name: 'Tin học',
              oral_test: '9.5, 10',
              fifteen_minute_test: '9, 9.5, 10',
              forty_five_minute_test: '9.5',
              final_exam: '9',
              average: 9.4,
              semester: 1,
              school_year: '2023-2024'
            },
            {
              subject_name: 'GDCD',
              oral_test: '8, 8.5',
              fifteen_minute_test: '8.5, 8, 9',
              forty_five_minute_test: '8.5',
              final_exam: '8',
              average: 8.3,
              semester: 1,
              school_year: '2023-2024'
            }
          ];
          
          setGrades(sampleGrades);
          
          // Tính điểm trung bình chung
          const totalAverage = sampleGrades.reduce((sum, grade) => sum + grade.average, 0);
          setGpa(parseFloat((totalAverage / sampleGrades.length).toFixed(2)));
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu điểm:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, []);

  // Lọc điểm theo học kỳ và năm học
  const filteredGrades = grades.filter(grade => 
    grade.semester === parseInt(selectedSemester) && 
    grade.school_year === selectedYear
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Bảng điểm học tập</h1>
      
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-full md:w-1/4">
            <label htmlFor="semester-select" className="block text-sm font-medium text-gray-700 mb-1">
              Học kỳ
            </label>
            <select
              id="semester-select"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="1">Học kỳ 1</option>
              <option value="2">Học kỳ 2</option>
            </select>
          </div>
          
          <div className="w-full md:w-1/4">
            <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-1">
              Năm học
            </label>
            <select
              id="year-select"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2023-2024">2023-2024</option>
              <option value="2022-2023">2022-2023</option>
              <option value="2021-2022">2021-2022</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <FaChartLine className="text-green-600 text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Điểm trung bình học kỳ</h3>
            <p className="text-xl font-semibold">{gpa}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Xếp loại học lực</h3>
          <p className="text-xl font-semibold">
            {gpa >= 9 ? 'Xuất sắc' : 
             gpa >= 8 ? 'Giỏi' : 
             gpa >= 7 ? 'Khá' : 
             gpa >= 5 ? 'Trung bình' : 'Yếu'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Hạng trong lớp</h3>
          <p className="text-xl font-semibold">5 / 35</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium">Bảng điểm chi tiết</h2>
          <p className="text-sm text-gray-500 mt-1">
            Học kỳ {selectedSemester}, năm học {selectedYear}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STT
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Môn học
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điểm miệng
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điểm 15 phút
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điểm 1 tiết
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điểm cuối kỳ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điểm TB
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGrades.map((grade, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {grade.subject_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.oral_test}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.fifteen_minute_test}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.forty_five_minute_test}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.final_exam}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{grade.average}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
} 