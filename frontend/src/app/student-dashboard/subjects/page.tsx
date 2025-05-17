'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/utils/auth';
import { FaBook, FaUser, FaClock } from 'react-icons/fa';

interface Subject {
  id: number;
  name: string;
  teacher: string;
  lessons_per_week: number;
  description: string;
}

export default function StudentSubjects() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        const userData = getUser();
        if (!userData) return;
        
        setUser(userData);
        
        try {
          // Tạo dữ liệu mẫu cho môn học
          const sampleSubjects: Subject[] = [
            {
              id: 1,
              name: 'Toán học',
              teacher: 'Nguyễn Văn B',
              lessons_per_week: 5,
              description: 'Môn học tập trung vào đại số, giải tích và hình học không gian.'
            },
            {
              id: 2,
              name: 'Vật lý',
              teacher: 'Trần Thị C',
              lessons_per_week: 3,
              description: 'Nghiên cứu về cơ học, điện từ học và vật lý hiện đại.'
            },
            {
              id: 3,
              name: 'Hóa học',
              teacher: 'Lê Văn D',
              lessons_per_week: 3,
              description: 'Tìm hiểu về cấu trúc nguyên tử, liên kết hóa học và phản ứng hóa học.'
            },
            {
              id: 4,
              name: 'Sinh học',
              teacher: 'Phạm Thị E',
              lessons_per_week: 2,
              description: 'Nghiên cứu về cơ thể người, di truyền học và sinh thái học.'
            },
            {
              id: 5,
              name: 'Ngữ văn',
              teacher: 'Hoàng Văn F',
              lessons_per_week: 4,
              description: 'Phân tích tác phẩm văn học và rèn luyện kỹ năng viết.'
            },
            {
              id: 6,
              name: 'Tiếng Anh',
              teacher: 'Đỗ Thị G',
              lessons_per_week: 3,
              description: 'Phát triển kỹ năng nghe, nói, đọc, viết tiếng Anh.'
            },
            {
              id: 7,
              name: 'Lịch sử',
              teacher: 'Bùi Văn H',
              lessons_per_week: 2,
              description: 'Tìm hiểu về lịch sử Việt Nam và thế giới.'
            },
            {
              id: 8,
              name: 'Địa lý',
              teacher: 'Trịnh Thị I',
              lessons_per_week: 2,
              description: 'Nghiên cứu về địa lý tự nhiên và địa lý kinh tế xã hội.'
            },
            {
              id: 9,
              name: 'Tin học',
              teacher: 'Vũ Thị K',
              lessons_per_week: 2,
              description: 'Học về lập trình, thiết kế web và ứng dụng CNTT.'
            },
            {
              id: 10,
              name: 'GDCD',
              teacher: 'Lý Thị L',
              lessons_per_week: 1,
              description: 'Giáo dục công dân và đạo đức sống.'
            }
          ];
          
          setSubjects(sampleSubjects);
          if (sampleSubjects.length > 0) {
            setSelectedSubject(sampleSubjects[0]);
          }
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu môn học:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Danh sách môn học</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 bg-blue-50 border-b">
              <h2 className="font-medium text-blue-700">Môn học</h2>
            </div>
            <div className="overflow-y-auto max-h-[500px]">
              <ul className="divide-y">
                {subjects.map((subject) => (
                  <li 
                    key={subject.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedSubject?.id === subject.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedSubject(subject)}
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <FaBook className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-sm text-gray-500">GV: {subject.teacher}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          {selectedSubject ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">{selectedSubject.name}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <FaUser className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Giáo viên</p>
                    <p className="font-medium">{selectedSubject.teacher}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <FaClock className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số tiết/tuần</p>
                    <p className="font-medium">{selectedSubject.lessons_per_week} tiết</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Mô tả môn học</h3>
                <p className="text-gray-700">{selectedSubject.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Nội dung chính</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Chương 1: Giới thiệu</li>
                  <li>Chương 2: Kiến thức cơ bản</li>
                  <li>Chương 3: Kiến thức nâng cao</li>
                  <li>Chương 4: Ôn tập và tổng kết</li>
                </ul>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-2">Đánh giá</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Điểm miệng</p>
                    <p className="font-medium">20%</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Điểm 15 phút & 1 tiết</p>
                    <p className="font-medium">30%</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Điểm cuối kỳ</p>
                    <p className="font-medium">50%</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center">
              <p className="text-gray-500">Vui lòng chọn một môn học để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 