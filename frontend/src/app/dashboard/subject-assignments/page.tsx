"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import teacherSubjectService, { TeacherSubject } from "@/services/teacherSubjectService";
import { getAllTeachers, Teacher } from "@/services/teacherService";
import subjectService, { Subject } from "@/services/subjectService";
import { getClasses, Class } from "@/services/classService";
import TeacherSubjectTable from "@/components/TeacherSubjectTable";
import TeacherSubjectForm from "@/components/TeacherSubjectForm";

export default function SubjectAssignmentPage() {
  const [assignments, setAssignments] = useState<TeacherSubject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TeacherSubject | null>(null);
  
  // Tải dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const [assignmentData, teacherData, subjectData, classData] = await Promise.all([
          teacherSubjectService.getAll(),
          getAllTeachers(),
          subjectService.getAll(),
          getClasses()
        ]);
        
        setAssignments(assignmentData);
        setTeachers(teacherData);
        setSubjects(subjectData);
        setClasses(classData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải dữ liệu, vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Định nghĩa cấu trúc cột cho bảng
  const columns = [
    { Header: 'ID', accessor: 'id' },
    { 
      Header: 'Giáo viên', 
      accessor: 'teacher_id',
      Cell: ({ value }: { value: number }) => getTeacherName(value)
    },
    { 
      Header: 'Môn học', 
      accessor: 'subject_id',
      Cell: ({ value }: { value: number }) => getSubjectName(value)
    },
    { 
      Header: 'Lớp học', 
      accessor: 'class_id',
      Cell: ({ value }: { value: number | null }) => getClassName(value)
    },
    {
      Header: 'Tiết học',
      accessor: 'lesson_period',
      Cell: ({ value }: { value: string | null | undefined }) => value || 'Chưa phân tiết'
    },
    {
      Header: 'Thứ',
      accessor: 'day_of_week',
      Cell: ({ value }: { value: string | null | undefined }) => value || 'Chưa xác định'
    },
    {
      Header: 'Tiết',
      accessor: 'period',
      Cell: ({ value }: { value: number | null | undefined }) => value || '-'
    },
    {
      Header: 'Phòng',
      accessor: 'room',
      Cell: ({ value }: { value: string | null | undefined }) => value || 'Chưa xác định'
    },
    {
      Header: 'Học kỳ',
      accessor: 'semester',
      Cell: ({ value }: { value: number | null | undefined }) => value || 1
    },
    {
      Header: 'Năm học',
      accessor: 'school_year',
      Cell: ({ value }: { value: string | null | undefined }) => value || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
    }
  ];
  
  // Tìm tên của giáo viên, môn học, lớp học từ ID
  const getTeacherName = (id: number) => {
    const teacher = teachers.find(t => t.id === id);
    return teacher ? teacher.name : 'N/A';
  };
  
  const getSubjectName = (id: number) => {
    const subject = subjects.find(s => s.id === id);
    return subject ? subject.name : 'N/A';
  };
  
  const getClassName = (id: number | null | undefined) => {
    if (!id) return 'Chưa được phân lớp';
    const classItem = classes.find(c => c.id === id);
    return classItem ? classItem.name : 'N/A';
  };
  
  // Xử lý mở modal form
  const handleOpenModal = (item?: TeacherSubject) => {
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
      const submissionData = {
        teacher_id: parseInt(data.teacher_id),
        subject_id: parseInt(data.subject_id),
        class_id: data.class_id ? parseInt(data.class_id) : null,
        lesson_period: data.lesson_period || null,
        day_of_week: data.day_of_week || null,
        period: data.period ? parseInt(data.period) : null,
        room: data.room || null,
        semester: data.semester ? parseInt(data.semester) : 1,
        school_year: data.school_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
      };
      
      const result = await teacherSubjectService.create(submissionData);
      
      if (result) {
        // Tải lại danh sách phân công
        const updatedAssignments = await teacherSubjectService.getAll();
        setAssignments(updatedAssignments);
        
        toast.success('Thêm phân công giảng dạy thành công');
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Không thể tạo phân công giảng dạy, vui lòng thử lại.');
    }
  };
  
  // Xử lý cập nhật
  const handleUpdate = async (data: any) => {
    if (!selectedItem) return;
    
    try {
      const submissionData = {
        teacher_id: parseInt(data.teacher_id),
        subject_id: parseInt(data.subject_id),
        class_id: data.class_id ? parseInt(data.class_id) : null,
        lesson_period: data.lesson_period || null,
        day_of_week: data.day_of_week || null,
        period: data.period ? parseInt(data.period) : null,
        room: data.room || null,
        semester: data.semester ? parseInt(data.semester) : 1,
        school_year: data.school_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
      };
      
      const result = await teacherSubjectService.update(selectedItem.id, submissionData);
      
      if (result) {
        // Tải lại danh sách phân công
        const updatedAssignments = await teacherSubjectService.getAll();
        setAssignments(updatedAssignments);
        
        toast.success('Cập nhật phân công giảng dạy thành công');
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Không thể cập nhật phân công giảng dạy, vui lòng thử lại.');
    }
  };
  
  // Xử lý xóa
  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa phân công này không?')) {
      try {
        const success = await teacherSubjectService.delete(id);
        
        if (success) {
          // Cập nhật danh sách phân công sau khi xóa
          setAssignments(assignments.filter(item => item.id !== id));
          toast.success('Xóa phân công thành công');
        }
      } catch (error) {
        console.error('Error deleting assignment:', error);
        toast.error('Không thể xóa phân công, vui lòng thử lại.');
      }
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Phân công Giảng dạy</h1>
          <button
            onClick={() => handleOpenModal()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <span className="mr-2">+</span>
            Thêm Phân công mới
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
          </div>
        ) : (
          <TeacherSubjectTable
            columns={columns}
            data={assignments}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
          />
        )}
      </div>
      
      {/* Modal cho form thêm/sửa phân công */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full mx-4">
            <TeacherSubjectForm
              teachers={teachers}
              subjects={subjects}
              classes={classes}
              assignments={assignments}
              currentId={selectedItem?.id}
              initialData={selectedItem ? {
                teacher_id: selectedItem.teacher_id.toString(),
                subject_id: selectedItem.subject_id.toString(),
                class_id: selectedItem.class_id?.toString() || '',
                lesson_period: selectedItem.lesson_period || '',
                day_of_week: selectedItem.day_of_week || '',
                period: selectedItem.period || 0,
                room: selectedItem.room || '',
                semester: selectedItem.semester || 1,
                school_year: selectedItem.school_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
              } : undefined}
              onSubmit={isEditMode ? handleUpdate : handleCreate}
              onCancel={handleCloseModal}
              title={isEditMode ? 'Cập nhật Phân công Giảng dạy' : 'Thêm Phân công Giảng dạy mới'}
            />
          </div>
        </div>
      )}
    </div>
  );
} 