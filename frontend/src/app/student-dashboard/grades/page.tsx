'use client';
// Force reload - v1 - Chỉ sử dụng dữ liệu mẫu

import { useEffect, useState } from 'react';
import { getUser } from '@/utils/auth';
import { FaChartLine } from 'react-icons/fa';
import axios from 'axios';

interface Grade {
  subject_name: string;
  oral_test: string | number;
  fifteen_minute_test: string | number;
  forty_five_minute_test: string | number;
  final_exam: string | number;
  average: number;
  average_score?: number;
  semester: number;
  school_year: string;
}

interface RankData {
  rank: number;
  total: number;
}

// Đặt thành true để sử dụng dữ liệu mẫu, false để sử dụng API
const USE_SAMPLE_DATA = true;

// Log để xác nhận cài đặt được áp dụng
console.log('USE_SAMPLE_DATA is set to:', USE_SAMPLE_DATA);

// Hàm helper để lấy điểm học sinh
const getStudentGrades = async (studentId: number, semester: string, schoolYear: string, token: string) => {
  if (USE_SAMPLE_DATA) {
    throw new Error('Chỉ sử dụng dữ liệu mẫu');
  }
  
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/students/${studentId}/grades`, {
      params: { semester, school_year: schoolYear },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy điểm học sinh:', error);
    throw error;
  }
};

// Hàm helper để lấy thứ hạng
const getStudentRank = async (studentId: number, semester: string, schoolYear: string, token: string) => {
  if (USE_SAMPLE_DATA) {
    return { rank: 5, total: 35 };
  }
  
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/students/${studentId}/rank`, {
      params: { semester, school_year: schoolYear },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy thứ hạng học sinh:', error);
    return { rank: 0, total: 0 };
  }
};

// Hàm helper để lấy điểm trung bình
const getStudentAverageGrade = async (studentId: number, semester: string, schoolYear: string, token: string) => {
  if (USE_SAMPLE_DATA) {
    return null;
  }
  
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/students/${studentId}/average-grade`, {
      params: { semester, school_year: schoolYear },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data.average_score;
  } catch (error) {
    console.error('Lỗi khi lấy điểm trung bình:', error);
    return null;
  }
};

export default function StudentGrades() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [selectedYear, setSelectedYear] = useState<string>('2023-2024');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gpa, setGpa] = useState<number>(0);
  const [rank, setRank] = useState<RankData>({ rank: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  // Hàm tải dữ liệu mẫu
  const loadSampleData = () => {
    console.log('Loading sample data - no API calls will be made');
    const sampleGrades: Grade[] = [
      {
        subject_name: 'Toán học',
        oral_test: '8.5, 9',
        fifteen_minute_test: '8, 9, 8.5',
        forty_five_minute_test: '8.5',
        final_exam: '9',
        average: 8.7,
        semester: parseInt(selectedSemester),
        school_year: selectedYear
      },
      // Các môn học khác được giữ nguyên như trước
      {
        subject_name: 'Vật lý',
        oral_test: '8, 7.5',
        fifteen_minute_test: '7, 8, 8',
        forty_five_minute_test: '7.5',
        final_exam: '8',
        average: 7.8,
        semester: parseInt(selectedSemester),
        school_year: selectedYear
      },
      {
        subject_name: 'Hóa học',
        oral_test: '9, 8.5',
        fifteen_minute_test: '8.5, 9, 8',
        forty_five_minute_test: '9',
        final_exam: '8.5',
        average: 8.7,
        semester: parseInt(selectedSemester),
        school_year: selectedYear
      },
      {
        subject_name: 'Sinh học',
        oral_test: '7.5, 8',
        fifteen_minute_test: '8, 7.5, 8',
        forty_five_minute_test: '8',
        final_exam: '7.5',
        average: 7.8,
        semester: parseInt(selectedSemester),
        school_year: selectedYear
      },
      {
        subject_name: 'Ngữ văn',
        oral_test: '8, 8.5',
        fifteen_minute_test: '7.5, 8, 8.5',
        forty_five_minute_test: '8',
        final_exam: '8.5',
        average: 8.2,
        semester: parseInt(selectedSemester),
        school_year: selectedYear
      },
      {
        subject_name: 'Lịch sử',
        oral_test: '9, 8',
        fifteen_minute_test: '8.5, 9, 8',
        forty_five_minute_test: '8.5',
        final_exam: '9',
        average: 8.7,
        semester: parseInt(selectedSemester),
        school_year: selectedYear
      },
      {
        subject_name: 'Địa lý',
        oral_test: '8.5, 9',
        fifteen_minute_test: '9, 8.5, 9',
        forty_five_minute_test: '9',
        final_exam: '8.5',
        average: 8.8,
        semester: parseInt(selectedSemester),
        school_year: selectedYear
      },
      {
        subject_name: 'Tiếng Anh',
        oral_test: '9, 9.5',
        fifteen_minute_test: '9, 9.5, 9',
        forty_five_minute_test: '9.5',
        final_exam: '9',
        average: 9.2,
        semester: parseInt(selectedSemester),
        school_year: selectedYear
      },
      {
        subject_name: 'Tin học',
        oral_test: '9.5, 10',
        fifteen_minute_test: '9, 9.5, 10',
        forty_five_minute_test: '9.5',
        final_exam: '9',
        average: 9.4,
        semester: parseInt(selectedSemester),
        school_year: selectedYear
      },
      {
        subject_name: 'GDCD',
        oral_test: '8, 8.5',
        fifteen_minute_test: '8.5, 8, 9',
        forty_five_minute_test: '8.5',
        final_exam: '8',
        average: 8.3,
        semester: parseInt(selectedSemester),
        school_year: selectedYear
      }
    ];
    
    setGrades(sampleGrades);
    
    // Tính điểm trung bình chung cho dữ liệu mẫu
    const totalAverage = sampleGrades.reduce((sum: number, grade: Grade) => sum + grade.average, 0);
    setGpa(parseFloat((totalAverage / sampleGrades.length).toFixed(2)));
    
    // Dữ liệu mẫu cho thứ hạng
    setRank({ rank: 5, total: 35 });
  };

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        setError(null);
        
        // Log để xác nhận useEffect đang chạy
        console.log('LoadData running, USE_SAMPLE_DATA =', USE_SAMPLE_DATA);
        
        // Nếu đang sử dụng dữ liệu mẫu, chỉ tải dữ liệu mẫu và kết thúc sớm
        if (USE_SAMPLE_DATA) {
          console.log('Using sample data only, skipping API calls');
          loadSampleData();
          setLoading(false);
          return;
        }
        
        const userData = getUser();
        
        if (!userData) {
          setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }
        
        setUser(userData);
        setLoading(true);
        
        try {
          // Lấy ID học sinh từ dữ liệu người dùng
          const studentId = userData.student?.id;
          
          if (!studentId) {
            setError('Không tìm thấy ID học sinh trong dữ liệu người dùng');
            // Sử dụng dữ liệu mẫu thay thế
            loadSampleData();
            setLoading(false);
            return;
          }
          
          // Sử dụng Promise.allSettled để không bị lỗi nếu một API bị lỗi
          const [gradesResult, rankResult, averageResult] = await Promise.allSettled([
            getStudentGrades(studentId, selectedSemester, selectedYear, userData.token),
            getStudentRank(studentId, selectedSemester, selectedYear, userData.token),
            getStudentAverageGrade(studentId, selectedSemester, selectedYear, userData.token)
          ]);
          
          // Xử lý kết quả từ API điểm số
          if (gradesResult.status === 'fulfilled' && gradesResult.value.length > 0) {
            const formattedGrades = gradesResult.value.map((item: any) => ({
              subject_name: item.subject_name,
              oral_test: item.oral_test,
              fifteen_minute_test: item.fifteen_minute_test,
              forty_five_minute_test: item.forty_five_minute_test,
              final_exam: item.final_exam,
              average: item.average_score,
              semester: parseInt(selectedSemester),
              school_year: selectedYear
            }));
            
            setGrades(formattedGrades);
            
            // Nếu không lấy được điểm trung bình từ API, tính từ danh sách điểm
            if (averageResult.status !== 'fulfilled' || averageResult.value === null) {
              const totalAverage = formattedGrades.reduce((sum: number, grade: Grade) => sum + (grade.average || 0), 0);
              setGpa(parseFloat((totalAverage / formattedGrades.length).toFixed(2)));
            } else {
              setGpa(averageResult.value);
            }
          } else {
            // Nếu không lấy được điểm từ API, sử dụng dữ liệu mẫu
            loadSampleData();
          }
          
          // Xử lý kết quả từ API thứ hạng
          if (rankResult.status === 'fulfilled') {
            setRank(rankResult.value);
          } else {
            setRank({ rank: 5, total: 35 }); // Dữ liệu mẫu
          }
          
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu điểm:', error);
          if (!USE_SAMPLE_DATA) {
            setError('Có lỗi xảy ra khi tải dữ liệu. Đang hiển thị dữ liệu mẫu.');
          }
          // Nếu có lỗi, sử dụng dữ liệu mẫu
          loadSampleData();
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, [selectedSemester, selectedYear]); // Thêm dependecy để tải lại khi học kỳ hoặc năm học thay đổi

  // Lọc điểm theo học kỳ và năm học
  const filteredGrades = grades.filter(grade => 
    grade.semester === parseInt(selectedSemester) && 
    grade.school_year === selectedYear
  );

  // Xử lý khi thay đổi học kỳ
  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSemester(e.target.value);
  };

  // Xử lý khi thay đổi năm học
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Bảng điểm học tập</h1>
      
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {USE_SAMPLE_DATA && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">Đang sử dụng dữ liệu mẫu cho mục đích phát triển</p>
            </div>
          </div>
        </div>
      )}
      
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
              onChange={handleSemesterChange}
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
              onChange={handleYearChange}
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
          <p className="text-xl font-semibold">{rank.rank} / {rank.total}</p>
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
              {filteredGrades.length > 0 ? (
                filteredGrades.map((grade, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {grade.subject_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.oral_test}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.fifteen_minute_test}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.forty_five_minute_test}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.final_exam}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{grade.average || grade.average_score}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Không có dữ liệu điểm cho học kỳ và năm học đã chọn
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
} 