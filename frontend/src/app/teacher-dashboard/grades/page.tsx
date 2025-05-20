'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEdit, FaSave, FaTimes, FaSearch, FaPlus } from 'react-icons/fa';
import { getUser } from '@/utils/auth';
import { getTeacherClasses } from '@/services/teacherService';
import { 
  getScores, 
  createScore, 
  updateScore, 
  getSchoolYears,
  getClassReport,
  updateTypeScore,
  deleteScore
} from '@/services/scoreService';
import { toast } from 'react-toastify';

interface Grade {
  id: number;
  student_id: number;
  student_name: string;
  subject_id: number;
  subject_name: string;
  class_id: number;
  semester: 1 | 2;
  school_year: string;
  oral_test: number | null;
  fifteen_minute_test: number | null;
  forty_five_minute_test: number | null;
  final_exam: number | null;
  average_score: number | null;
}

interface Student {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

export default function TeacherGrades() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('2023-2024');
  const [schoolYears, setSchoolYears] = useState<string[]>(['2023-2024', '2022-2023']);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Tạo state cho việc chỉnh sửa điểm
  const [editValues, setEditValues] = useState<{
    oral_test: string;
    fifteen_minute_test: string;
    forty_five_minute_test: string;
    final_exam: string;
  }>({
    oral_test: '',
    fifteen_minute_test: '',
    forty_five_minute_test: '',
    final_exam: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        const userData = getUser();
        if (!userData) return;
        
        setUser(userData);
        
        try {
          // Lấy danh sách năm học
          const years = await getSchoolYears();
          if (years && years.length > 0) {
            setSchoolYears(years);
            setSelectedSchoolYear(years[0]);
          }
          
          if (userData.teacher && userData.teacher.id) {
            // Lấy danh sách lớp học của giáo viên
            const teacherClasses = await getTeacherClasses(userData.teacher.id);
            console.log('Teacher classes:', teacherClasses);
            
            // Debug: Kiểm tra ID trùng lặp trong danh sách lớp học
            if (Array.isArray(teacherClasses.data)) {
              const subjectIds = teacherClasses.data
                .filter((c: any) => c.subject_id)
                .map((c: any) => c.subject_id);
              console.log('Subject IDs:', subjectIds);
              
              // Tìm ID trùng lặp
              const duplicateIds = subjectIds.filter((id: number, index: number) => subjectIds.indexOf(id) !== index);
              console.log('Duplicate subject IDs:', duplicateIds);
            }
            
            if (teacherClasses && teacherClasses.status === 'success' && Array.isArray(teacherClasses.data)) {
              setClasses(teacherClasses.data);
              if (teacherClasses.data.length > 0) {
                setSelectedClass(teacherClasses.data[0].id.toString());
                setSelectedSubject(teacherClasses.data[0].subject_id || null);
              }
            } else if (Array.isArray(teacherClasses)) {
              setClasses(teacherClasses);
              if (teacherClasses.length > 0) {
                setSelectedClass(teacherClasses[0].id.toString());
                setSelectedSubject(teacherClasses[0].subject_id || null);
              }
            }
          }
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, []);

  // Lấy điểm số khi lớp, môn học, học kỳ, năm học được chọn
  useEffect(() => {
    const fetchGrades = async () => {
      if (selectedClass && selectedSubject && user?.teacher?.id) {
        try {
          setLoading(true);
          
          // Lấy danh sách học sinh trong lớp
          const classData = await getClassReport(parseInt(selectedClass), {
            teacher_id: user.teacher.id,
            subject_id: selectedSubject,
            semester: selectedSemester,
            school_year: selectedSchoolYear,
            include_all_students: true // Thêm tham số để lấy tất cả học sinh
          });
          
          console.log('Class report data:', classData);
          
          if (classData && classData.students) {
            // Cập nhật danh sách học sinh
            setStudents(classData.students);
            
            // Định dạng lại dữ liệu điểm
            const formattedGrades: Grade[] = classData.students.map((student: any) => {
              // Kiểm tra nếu student.grades tồn tại và là một mảng
              const gradeData = student.grades && Array.isArray(student.grades) 
                ? student.grades.find((g: any) => 
                    g.subject_id === selectedSubject && 
                    g.semester === selectedSemester && 
                    g.school_year === selectedSchoolYear
                  ) || {}
                : {};
              
              return {
                id: gradeData.id || 0,
                student_id: student.id,
                student_name: student.name,
                subject_id: selectedSubject,
                subject_name: classData.subject?.name || 'Không xác định',
                class_id: parseInt(selectedClass),
                semester: selectedSemester,
                school_year: selectedSchoolYear,
                oral_test: gradeData.oral_test !== undefined ? gradeData.oral_test : null,
                fifteen_minute_test: gradeData.fifteen_minute_test !== undefined ? gradeData.fifteen_minute_test : null,
                forty_five_minute_test: gradeData.forty_five_minute_test !== undefined ? gradeData.forty_five_minute_test : null,
                final_exam: gradeData.final_exam !== undefined ? gradeData.final_exam : null,
                average_score: gradeData.average_score !== undefined ? gradeData.average_score : null
              };
            });
            
            setGrades(formattedGrades);
            
            // Kiểm tra và tự động tạo điểm trống cho học sinh chưa có điểm
            const studentsWithoutGrades = formattedGrades.filter(grade => !grade.id);
            
            if (studentsWithoutGrades.length > 0) {
              console.log(`Có ${studentsWithoutGrades.length} học sinh chưa có điểm, đang tạo điểm mới...`);
              
              try {
                // Tạo điểm mới cho từng học sinh với loại điểm kiểm tra 15 phút thay vì regular
                const createPromises = studentsWithoutGrades.map(grade => 
                  createScore({
                    student_id: grade.student_id,
                    subject_id: selectedSubject,
                    class_id: parseInt(selectedClass),
                    teacher_id: user.teacher.id,
                    semester: selectedSemester,
                    school_year: selectedSchoolYear,
                    oral_test: null,
                    fifteen_minute_test: null,
                    forty_five_minute_test: null,
                    final_exam: null,
                    score_type: 'test15min', // Thay đổi từ 'regular' thành 'test15min'
                    score_value: 0
                  })
                );
                
                const results = await Promise.all(createPromises);
                
                // Cập nhật ID cho các điểm vừa tạo
                const updatedGrades = [...formattedGrades];
                results.forEach((result, index) => {
                  if (result) {
                    const studentIndex = updatedGrades.findIndex(
                      grade => grade.student_id === studentsWithoutGrades[index].student_id
                    );
                    
                    if (studentIndex !== -1) {
                      updatedGrades[studentIndex].id = result.id;
                    }
                  }
                });
                
                setGrades(updatedGrades);
                console.log(`Đã tạo thành công ${results.filter(Boolean).length} mục điểm mới`);
              } catch (error) {
                console.error('Lỗi khi tạo điểm mới tự động:', error);
              }
            }
          }
        } catch (error) {
          console.error('Lỗi khi tải điểm số:', error);
          toast.error('Không thể tải điểm số');
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (selectedClass && selectedSubject) {
      fetchGrades();
    }
  }, [selectedClass, selectedSubject, selectedSemester, selectedSchoolYear, user?.teacher?.id]);

  // Hàm bắt đầu chỉnh sửa điểm
  const startEditing = (grade: Grade) => {
    setEditingGradeId(grade.id);
    setEditValues({
      oral_test: grade.oral_test !== null ? grade.oral_test.toString() : '',
      fifteen_minute_test: grade.fifteen_minute_test !== null ? grade.fifteen_minute_test.toString() : '',
      forty_five_minute_test: grade.forty_five_minute_test !== null ? grade.forty_five_minute_test.toString() : '',
      final_exam: grade.final_exam !== null ? grade.final_exam.toString() : ''
    });
  };

  // Hàm hủy chỉnh sửa
  const cancelEditing = () => {
    setEditingGradeId(null);
  };

  // Hàm xử lý thay đổi giá trị điểm
  const handleEditChange = (field: keyof typeof editValues, value: string) => {
    // Cho phép giá trị số từ 0-10 hoặc rỗng
    if (value === '' || (/^\d*\.?\d*$/.test(value) && (parseFloat(value) >= 0 && parseFloat(value) <= 10 || value === '0'))) {
      setEditValues({
        ...editValues,
        [field]: value
      });
    }
  };

  // Hàm tạo điểm mới hoặc cập nhật điểm
  const saveGrade = async (grade: Grade) => {
    try {
      setLoading(true);
      
      // Chuyển đổi giá trị từ string sang number hoặc null
      const oralTest = editValues.oral_test !== '' ? parseFloat(editValues.oral_test) : null;
      const fifteenMinuteTest = editValues.fifteen_minute_test !== '' ? parseFloat(editValues.fifteen_minute_test) : null;
      const fortyFiveMinuteTest = editValues.forty_five_minute_test !== '' ? parseFloat(editValues.forty_five_minute_test) : null;
      const finalExam = editValues.final_exam !== '' ? parseFloat(editValues.final_exam) : null;
      
      // Mảng chứa các promise cập nhật từng loại điểm
      const updatePromises: Promise<any>[] = [];
      
      // Xóa điểm "regular" nếu cùng học sinh và môn học
      try {
        // Tìm điểm với cùng student_id, subject_id và score_type='regular'
        const regularScores = await getScores({
          student_id: grade.student_id,
          subject_id: grade.subject_id,
          class_id: grade.class_id,
          semester: selectedSemester,
          school_year: selectedSchoolYear,
          score_type: 'regular'
        });
        
        // Xóa các điểm regular hiện có
        if (regularScores && regularScores.length > 0) {
          console.log('Đang xóa điểm thường xuyên cũ:', regularScores);
          const deletePromises = regularScores.map(score => deleteScore(score.id));
          await Promise.all(deletePromises);
        }
      } catch (error) {
        console.error('Lỗi khi xóa điểm thường xuyên:', error);
      }
      
      // Cập nhật điểm miệng nếu có thay đổi
      if (oralTest !== grade.oral_test) {
        updatePromises.push(
          updateTypeScore({
            student_id: grade.student_id,
            subject_id: grade.subject_id,
            class_id: grade.class_id,
            teacher_id: user.teacher.id,
            semester: selectedSemester,
            school_year: selectedSchoolYear,
            score_type: 'oral',  // Loại điểm miệng
            score_value: oralTest !== null ? oralTest : 0
          })
        );
      }
      
      // Cập nhật điểm 15 phút nếu có thay đổi
      if (fifteenMinuteTest !== grade.fifteen_minute_test) {
        updatePromises.push(
          updateTypeScore({
            student_id: grade.student_id,
            subject_id: grade.subject_id,
            class_id: grade.class_id,
            teacher_id: user.teacher.id,
            semester: selectedSemester,
            school_year: selectedSchoolYear,
            score_type: 'test15min',  // Loại điểm 15 phút
            score_value: fifteenMinuteTest !== null ? fifteenMinuteTest : 0
          })
        );
      }
      
      // Cập nhật điểm 45 phút nếu có thay đổi
      if (fortyFiveMinuteTest !== grade.forty_five_minute_test) {
        updatePromises.push(
          updateTypeScore({
            student_id: grade.student_id,
            subject_id: grade.subject_id,
            class_id: grade.class_id,
            teacher_id: user.teacher.id,
            semester: selectedSemester,
            school_year: selectedSchoolYear,
            score_type: 'test45min',  // Loại điểm 45 phút
            score_value: fortyFiveMinuteTest !== null ? fortyFiveMinuteTest : 0
          })
        );
      }
      
      // Cập nhật điểm cuối kỳ nếu có thay đổi
      if (finalExam !== grade.final_exam) {
        updatePromises.push(
          updateTypeScore({
            student_id: grade.student_id,
            subject_id: grade.subject_id,
            class_id: grade.class_id,
            teacher_id: user.teacher.id,
            semester: selectedSemester,
            school_year: selectedSchoolYear,
            score_type: 'final',  // Loại điểm cuối kỳ
            score_value: finalExam !== null ? finalExam : 0
          })
        );
      }
      
      // Thực hiện tất cả các cập nhật cùng lúc
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }
      
      // Tính điểm trung bình
      const scores = [
        oralTest,
        fifteenMinuteTest,
        fortyFiveMinuteTest,
        finalExam
      ].filter(score => score !== null) as number[];
      
      const weights = [1, 1, 2, 3];
      let totalWeightedScore = 0;
      let totalWeight = 0;
      
      scores.forEach((score, index) => {
        if (score !== null) {
          totalWeightedScore += score * weights[index];
          totalWeight += weights[index];
        }
      });
      
      const averageScore = totalWeight > 0 ? totalWeightedScore / totalWeight : null;
      
      // Cập nhật state grades để hiển thị ngay mà không cần tải lại trang
      const updatedGrades = grades.map(g => {
        if (g.student_id === grade.student_id) {
          return {
            ...g,
            oral_test: oralTest,
            fifteen_minute_test: fifteenMinuteTest,
            forty_five_minute_test: fortyFiveMinuteTest,
            final_exam: finalExam,
            average_score: averageScore !== null ? parseFloat(averageScore.toFixed(2)) : null
          };
        }
        return g;
      });
      
      setGrades(updatedGrades);
      toast.success('Đã lưu điểm thành công');
      
    } catch (error) {
      console.error('Lỗi khi lưu điểm:', error);
      toast.error('Không thể lưu điểm');
    } finally {
      setEditingGradeId(null);
      setLoading(false);
    }
  };

  // Hàm tạo điểm mới cho tất cả học sinh chưa có điểm
  const createMissingGrades = async () => {
    if (!selectedClass || !selectedSubject || !user?.teacher?.id) {
      toast.error('Vui lòng chọn đầy đủ thông tin lớp và môn học');
      return;
    }
    
    try {
      setLoading(true);
      
      // Lấy danh sách học sinh chưa có đủ loại điểm
      const studentsWithMissingGrades = grades.filter(grade => 
        grade.oral_test === null || 
        grade.fifteen_minute_test === null || 
        grade.forty_five_minute_test === null || 
        grade.final_exam === null
      );
      
      if (studentsWithMissingGrades.length === 0) {
        toast.success('Tất cả học sinh đều có đủ điểm');
        return;
      }
      
      // Danh sách các loại điểm cần tạo
      const scoreTypes = [
        { field: 'oral_test', type: 'oral', weight: 1 },
        { field: 'fifteen_minute_test', type: 'test15min', weight: 1 },
        { field: 'forty_five_minute_test', type: 'test45min', weight: 2 },
        { field: 'final_exam', type: 'final', weight: 3 }
      ];
      
      // Tạo mảng các promise cập nhật điểm
      const updatePromises: Promise<any>[] = [];
      
      // Đầu tiên, xóa tất cả điểm regular trước khi thêm các điểm mới
      for (const grade of studentsWithMissingGrades) {
        try {
          // Tìm điểm với cùng student_id, subject_id và score_type='regular'
          const regularScores = await getScores({
            student_id: grade.student_id,
            subject_id: grade.subject_id,
            class_id: grade.class_id,
            semester: selectedSemester,
            school_year: selectedSchoolYear,
            score_type: 'regular'
          });
          
          // Xóa các điểm regular hiện có
          if (regularScores && regularScores.length > 0) {
            console.log(`Đang xóa ${regularScores.length} điểm thường xuyên cho học sinh ${grade.student_name}`);
            const deletePromises = regularScores.map(score => deleteScore(score.id));
            await Promise.all(deletePromises);
          }
        } catch (error) {
          console.error(`Lỗi khi xóa điểm thường xuyên cho học sinh ${grade.student_name}:`, error);
        }
      }
      
      studentsWithMissingGrades.forEach(grade => {
        // Tạo điểm cho mỗi loại điểm còn thiếu
        scoreTypes.forEach(scoreType => {
          const fieldName = scoreType.field as keyof typeof grade;
          if (grade[fieldName] === null) {
            updatePromises.push(
              updateTypeScore({
                student_id: grade.student_id,
                subject_id: grade.subject_id,
                class_id: grade.class_id,
                teacher_id: user.teacher.id,
                semester: selectedSemester,
                school_year: selectedSchoolYear,
                score_type: scoreType.type,
                score_value: 0  // Giá trị mặc định
              })
            );
          }
        });
      });
      
      if (updatePromises.length === 0) {
        toast.info('Không có điểm nào cần được tạo mới');
        setLoading(false);
        return;
      }
      
      await Promise.all(updatePromises);
      
      // Tải lại danh sách điểm sau khi cập nhật
      const classData = await getClassReport(parseInt(selectedClass), {
        teacher_id: user.teacher.id,
        subject_id: selectedSubject,
        semester: selectedSemester,
        school_year: selectedSchoolYear,
        include_all_students: true
      });
      
      if (classData && classData.students) {
        const formattedGrades: Grade[] = classData.students.map((student: any) => {
          const gradeData = student.grades && Array.isArray(student.grades) 
            ? student.grades.find((g: any) => 
                g.subject_id === selectedSubject && 
                g.semester === selectedSemester && 
                g.school_year === selectedSchoolYear
              ) || {}
            : {};
          
          return {
            id: gradeData.id || 0,
            student_id: student.id,
            student_name: student.name,
            subject_id: selectedSubject,
            subject_name: classData.subject?.name || 'Không xác định',
            class_id: parseInt(selectedClass),
            semester: selectedSemester,
            school_year: selectedSchoolYear,
            oral_test: gradeData.oral_test !== undefined ? gradeData.oral_test : null,
            fifteen_minute_test: gradeData.fifteen_minute_test !== undefined ? gradeData.fifteen_minute_test : null,
            forty_five_minute_test: gradeData.forty_five_minute_test !== undefined ? gradeData.forty_five_minute_test : null,
            final_exam: gradeData.final_exam !== undefined ? gradeData.final_exam : null,
            average_score: gradeData.average_score !== undefined ? gradeData.average_score : null
          };
        });
        
        setGrades(formattedGrades);
      }
      
      toast.success(`Đã tạo ${updatePromises.length} mục điểm mới`);
      
    } catch (error) {
      console.error('Lỗi khi tạo điểm mới:', error);
      toast.error('Không thể tạo điểm mới');
    } finally {
      setLoading(false);
    }
  };

  // Lọc học sinh theo từ khóa tìm kiếm
  const filteredGrades = grades.filter(grade =>
    grade.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug: Kiểm tra trùng lặp student_id trong danh sách grades
  useEffect(() => {
    const studentIds = grades.map(grade => grade.student_id);
    const duplicateIds = studentIds.filter((id, index) => studentIds.indexOf(id) !== index);
    
    if (duplicateIds.length > 0) {
      console.log('Duplicate student_id in grades:', duplicateIds);
    }
  }, [grades]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý điểm</h1>
      
      {classes.length > 0 ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn lớp
                </label>
                <select
                  id="class-select"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  {classes.map((classItem, classIndex) => (
                    <option key={`class-${classItem.id}-${classIndex}`} value={classItem.id}>
                      {classItem.class_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Môn học
                </label>
                <select
                  id="subject-select"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedSubject || ''}
                  onChange={(e) => setSelectedSubject(e.target.value ? parseInt(e.target.value) : null)}
                >
                  {classes
                    .filter(c => c.subject_id) // Lọc ra những lớp có môn học
                    .map((classItem, subjectIndex) => (
                      <option key={`subject-${classItem.id}-${classItem.subject_id}-${subjectIndex}`} value={classItem.subject_id}>
                        {classItem.subject_name}
                      </option>
                    ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="semester-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Học kỳ
                </label>
                <select
                  id="semester-select"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(parseInt(e.target.value) as 1 | 2)}
                >
                  <option value={1}>Học kỳ 1</option>
                  <option value={2}>Học kỳ 2</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="school-year-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Năm học
                </label>
                <select
                  id="school-year-select"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedSchoolYear}
                  onChange={(e) => setSelectedSchoolYear(e.target.value)}
                >
                  {schoolYears.map((year, yearIndex) => (
                    <option key={`year-${year}-${yearIndex}`} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm học sinh..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
              </div>
              
              <button 
                onClick={createMissingGrades}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FaPlus className="inline mr-1" />
                Tạo điểm
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium">
                Bảng điểm lớp {classes && classes.length > 0 ? classes.find(c => c.id.toString() === selectedClass)?.class_name || 'Không xác định' : 'Không xác định'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Môn: {classes && classes.length > 0 ? classes.find(c => c.subject_id === selectedSubject)?.subject_name || 'Chưa chọn' : 'Chưa chọn'} | 
                Học kỳ: {selectedSemester} | 
                Năm học: {selectedSchoolYear}
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
                      Họ tên
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm miệng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm 15p
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGrades.length > 0 ? (
                    filteredGrades.map((grade, index) => (
                      <tr key={`grade-${index}-${grade.student_id}-${Date.now()}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{grade.student_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {editingGradeId === grade.id ? (
                            <input
                              type="number"
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center number-input"
                              value={editValues.oral_test}
                              onChange={(e) => handleEditChange('oral_test', e.target.value)}
                              min="0"
                              max="10"
                              step="0.1"
                            />
                          ) : (
                            <span className="text-gray-500">{grade.oral_test !== null ? grade.oral_test : '-'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {editingGradeId === grade.id ? (
                            <input
                              type="number"
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center number-input"
                              value={editValues.fifteen_minute_test}
                              onChange={(e) => handleEditChange('fifteen_minute_test', e.target.value)}
                              min="0"
                              max="10"
                              step="0.1"
                            />
                          ) : (
                            <span className="text-gray-500">{grade.fifteen_minute_test !== null ? grade.fifteen_minute_test : '-'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {editingGradeId === grade.id ? (
                            <input
                              type="number"
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center number-input"
                              value={editValues.forty_five_minute_test}
                              onChange={(e) => handleEditChange('forty_five_minute_test', e.target.value)}
                              min="0"
                              max="10"
                              step="0.1"
                            />
                          ) : (
                            <span className="text-gray-500">{grade.forty_five_minute_test !== null ? grade.forty_five_minute_test : '-'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {editingGradeId === grade.id ? (
                            <input
                              type="number"
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center number-input"
                              value={editValues.final_exam}
                              onChange={(e) => handleEditChange('final_exam', e.target.value)}
                              min="0"
                              max="10"
                              step="0.1"
                            />
                          ) : (
                            <span className="text-gray-500">{grade.final_exam !== null ? grade.final_exam : '-'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {grade.average_score !== null ? (
                            <span className={`
                              ${grade.average_score >= 8 ? 'text-green-600' : ''}
                              ${grade.average_score >= 6.5 && grade.average_score < 8 ? 'text-blue-600' : ''}
                              ${grade.average_score >= 5 && grade.average_score < 6.5 ? 'text-yellow-600' : ''}
                              ${grade.average_score < 5 ? 'text-red-600' : ''}
                            `}>
                              {grade.average_score.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {editingGradeId === grade.id ? (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => saveGrade(grade)}
                                className="text-green-600 hover:text-green-900"
                                title="Lưu"
                              >
                                <FaSave />
                              </button>
                              <button 
                                onClick={cancelEditing}
                                className="text-red-600 hover:text-red-900"
                                title="Hủy"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => startEditing(grade)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Sửa"
                            >
                              <FaEdit />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        Không tìm thấy dữ liệu điểm.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-600">Bạn chưa được phân công lớp dạy nào.</p>
        </div>
      )}
    </div>
  );
} 