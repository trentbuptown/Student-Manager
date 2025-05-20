"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getScores, getScoreById, createScore, updateScore, deleteScore, getSchoolYears, Score, ScoreFilter, ScoreCreateParams, ScoreUpdateParams } from "@/services/scoreService";
import { getAllTeachers, Teacher } from "@/services/teacherService";
import { getStudents } from "@/services/studentService";
import subjectService, { Subject } from "@/services/subjectService";
import { getClasses, Class } from "@/services/classService";
import ScoreTable from "@/components/ScoreTable";
import ScoreForm from "@/components/ScoreForm";
import ScoreFilterComponent from "@/components/ScoreFilter";

// Tạo danh sách năm học mặc định
const getDefaultSchoolYears = () => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let i = 0; i < 5; i++) {
    years.push(`${currentYear - i - 1}-${currentYear - i}`);
  }
  return years;
};

export default function ScoreManagementPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [schoolYears, setSchoolYears] = useState<string[]>(getDefaultSchoolYears());
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Score | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ScoreFilter>({});

  // Tải dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Tách các API riêng biệt để xử lý lỗi độc lập
        let scoreData: Score[] = [];
        let teacherData: Teacher[] = [];
        let studentData: any[] = [];
        let subjectData: Subject[] = [];
        let classData: Class[] = [];
        
        try {
          scoreData = await getScores({});
        } catch (error) {
          console.error('Error fetching scores:', error);
          // Giữ mảng rỗng nếu có lỗi
        }
        
        try {
          teacherData = await getAllTeachers();
        } catch (error) {
          console.error('Error fetching teachers:', error);
        }
        
        try {
          studentData = await getStudents();
        } catch (error) {
          console.error('Error fetching students:', error);
        }
        
        try {
          subjectData = await subjectService.getAll();
        } catch (error) {
          console.error('Error fetching subjects:', error);
        }
        
        try {
          classData = await getClasses();
        } catch (error) {
          console.error('Error fetching classes:', error);
        }
        
        setScores(scoreData);
        setTeachers(teacherData);
        setStudents(studentData);
        setSubjects(subjectData);
        setClasses(classData);
        
        // Năm học được xử lý riêng trong service, không cần xử lý lỗi ở đây
        const yearData = await getSchoolYears();
        if (yearData && yearData.length > 0) {
          setSchoolYears(yearData);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        toast.error('Không thể tải dữ liệu, vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Lọc điểm theo bộ lọc
  const handleFilter = async (filters: ScoreFilter) => {
    setIsLoading(true);
    setCurrentFilters(filters);
    
    try {
      const filteredScores = await getScores(filters);
      setScores(filteredScores);
    } catch (error) {
      console.error('Error filtering scores:', error);
      toast.error('Không thể lọc điểm, vui lòng thử lại.');
      // Giữ nguyên dữ liệu hiện tại nếu có lỗi
    } finally {
      setIsLoading(false);
    }
  };

  // Đặt lại bộ lọc
  const handleResetFilter = async () => {
    setIsLoading(true);
    setCurrentFilters({});
    
    try {
      const allScores = await getScores({});
      setScores(allScores);
    } catch (error) {
      console.error('Error resetting filter:', error);
      toast.error('Không thể đặt lại bộ lọc, vui lòng thử lại.');
      // Giữ nguyên dữ liệu hiện tại nếu có lỗi
    } finally {
      setIsLoading(false);
    }
  };

  // Định nghĩa cấu trúc cột cho bảng
  const columns = [
    { Header: 'ID', accessor: 'id' },
    { 
      Header: 'Học sinh', 
      accessor: 'student_id',
      Cell: ({ value, row }: any) => {
        const student = row.original.student;
        // Hiển thị họ tên đầy đủ của học sinh hoặc tên nếu không có họ tên đầy đủ
        const displayName = student?.user?.name || student?.name || 'N/A';
        return student ? displayName : 'N/A';
      }
    },
    { 
      Header: 'Môn học', 
      accessor: 'subject_id',
      Cell: ({ value, row }: any) => {
        const subject = row.original.subject;
        return subject ? subject.name : 'N/A';
      }
    },
    { 
      Header: 'Lớp', 
      accessor: 'class_id',
      Cell: ({ value, row }: any) => {
        const classItem = row.original.class;
        return classItem ? classItem.name : 'N/A';
      }
    },
    { 
      Header: 'Giáo viên', 
      accessor: 'teacher_id',
      Cell: ({ value, row }: any) => {
        const teacher = row.original.teacher;
        return teacher ? teacher.name : 'N/A';
      }
    },
    { 
      Header: 'Điểm', 
      accessor: 'score_value',
      Cell: ({ value }: { value: number }) => value.toFixed(1)
    },
    { 
      Header: 'Loại điểm', 
      accessor: 'score_type',
      Cell: ({ value }: { value: string }) => {
        const scoreTypes: Record<string, string> = {
          'mieng': 'Miệng',
          '15p': 'Điểm 15 phút',
          'regular': 'Điểm thường xuyên',
          'test15min': 'Kiểm tra 15 phút',
          'test45min': 'Kiểm tra 45 phút',
          'oral': 'Kiểm tra miệng',
          'final': 'Kiểm tra cuối kỳ',
          'giuaky': 'Giữa kỳ',
          'cuoiky': 'Cuối kỳ'
        };
        return scoreTypes[value] || value;
      }
    },
    { 
      Header: 'Học kỳ', 
      accessor: 'semester',
      Cell: ({ value }: { value: number }) => `Học kỳ ${value}`
    },
    { 
      Header: 'Năm học', 
      accessor: 'school_year'
    }
  ];
  
  // Xử lý mở modal form
  const handleOpenModal = (item?: Score) => {
    setIsModalOpen(true);
    setIsEditMode(!!item);
    setSelectedItem(item || null);
  };
  
  // Xử lý đóng modal form
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };
  
  // Xử lý tạo mới
  const handleCreate = async (data: any) => {
    try {
      const result = await createScore(data);
      
      if (result) {
        // Tải lại danh sách điểm với bộ lọc hiện tại
        try {
          const updatedScores = await getScores(currentFilters);
          setScores(updatedScores);
        } catch (error) {
          console.error('Error reloading scores after create:', error);
          // Thêm mục mới vào danh sách điểm nếu không thể tải lại danh sách
          setScores(prev => [result, ...prev]);
        }
        
        toast.success('Thêm điểm thành công');
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error creating score:', error);
      toast.error('Không thể thêm điểm, vui lòng thử lại.');
    }
  };
  
  // Xử lý cập nhật
  const handleUpdate = async (data: any) => {
    if (!selectedItem) return;
    
    try {
      const result = await updateScore(selectedItem.id, data);
      
      if (result) {
        // Tải lại danh sách điểm với bộ lọc hiện tại
        try {
          const updatedScores = await getScores(currentFilters);
          setScores(updatedScores);
        } catch (error) {
          console.error('Error reloading scores after update:', error);
          // Cập nhật mục trong danh sách điểm nếu không thể tải lại danh sách
          setScores(prev => prev.map(item => item.id === result.id ? result : item));
        }
        
        toast.success('Cập nhật điểm thành công');
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error updating score:', error);
      toast.error('Không thể cập nhật điểm, vui lòng thử lại.');
    }
  };
  
  // Xử lý xóa
  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa điểm này không?')) {
      try {
        const success = await deleteScore(id);
        
        if (success) {
          // Cập nhật danh sách điểm sau khi xóa
          setScores(scores.filter(item => item.id !== id));
          toast.success('Xóa điểm thành công');
        }
      } catch (error) {
        console.error('Error deleting score:', error);
        toast.error('Không thể xóa điểm, vui lòng thử lại.');
      }
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      {/* Thông báo tính năng đang phát triển */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Tính năng quản lý điểm đang trong quá trình phát triển. Một số chức năng có thể chưa hoạt động đầy đủ.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Điểm số</h1>
            <button
              onClick={() => handleOpenModal()}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <span className="mr-2">+</span>
              Thêm điểm mới
            </button>
          </div>
          
          {/* Bộ lọc điểm */}
          <ScoreFilterComponent
            teachers={teachers}
            subjects={subjects}
            classes={classes}
            students={students}
            schoolYears={schoolYears}
            onFilter={handleFilter}
            onReset={handleResetFilter}
          />
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">Chưa có dữ liệu điểm nào.</p>
              <p className="text-gray-400 text-sm">
                {Object.keys(currentFilters).length > 0 
                  ? 'Thử điều chỉnh bộ lọc hoặc nhấn "Đặt lại" để xem tất cả điểm.' 
                  : 'Nhấp vào nút "Thêm điểm mới" để bắt đầu nhập điểm.'}
              </p>
            </div>
          ) : (
            <ScoreTable
              columns={columns}
              data={scores}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
      
      {/* Modal cho form thêm/sửa điểm */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full mx-4">
            <ScoreForm
              teachers={teachers}
              subjects={subjects}
              classes={classes}
              students={students}
              initialData={selectedItem ? {
                student_id: selectedItem.student_id.toString(),
                subject_id: selectedItem.subject_id.toString(),
                teacher_id: selectedItem.teacher_id.toString(),
                class_id: selectedItem.class_id.toString(),
                score_value: selectedItem.score_value.toString(),
                score_type: selectedItem.score_type,
                semester: selectedItem.semester.toString(),
                school_year: selectedItem.school_year
              } : undefined}
              onSubmit={isEditMode ? handleUpdate : handleCreate}
              onCancel={handleCloseModal}
              title={isEditMode ? 'Cập nhật Điểm số' : 'Thêm Điểm số mới'}
            />
          </div>
        </div>
      )}
    </div>
  );
} 