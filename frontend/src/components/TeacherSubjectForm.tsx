"use client";

import React, { useState, useEffect } from 'react';
import { Teacher } from '@/services/teacherService';
import { Subject } from '@/services/subjectService';
import { Class } from '@/services/classService';
import teacherSubjectService, { TeacherSubject } from '@/services/teacherSubjectService';

type TeacherSubjectFormProps = {
  teachers: Teacher[];
  subjects: Subject[];
  classes: Class[];
  initialData?: {
    teacher_id: string;
    subject_id: string;
    class_id: string;
    lesson_period?: string;
  };
  assignments: TeacherSubject[]; // Danh sách tất cả phân công
  currentId?: number; // ID của phân công đang được chỉnh sửa
  onSubmit: (data: any) => void;
  onCancel: () => void;
  title: string;
};

const DAYS_OF_WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DAYS_OF_WEEK_FULL = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Chuyển đổi tên ngày đầy đủ sang tên viết tắt
const fullNameToShortName = (fullName: string): string => {
  const index = DAYS_OF_WEEK_FULL.indexOf(fullName);
  return index !== -1 ? DAYS_OF_WEEK[index] : fullName;
};

// Chuyển đổi tên viết tắt sang tên đầy đủ
const shortNameToFullName = (shortName: string): string => {
  const index = DAYS_OF_WEEK.indexOf(shortName);
  return index !== -1 ? DAYS_OF_WEEK_FULL[index] : shortName;
};

const TeacherSubjectForm: React.FC<TeacherSubjectFormProps> = ({
  teachers,
  subjects,
  classes,
  initialData,
  assignments,
  currentId,
  onSubmit,
  onCancel,
  title
}) => {
  const [formData, setFormData] = useState({
    teacher_id: initialData?.teacher_id || '',
    subject_id: initialData?.subject_id || '',
    class_id: initialData?.class_id || '',
    lesson_period: initialData?.lesson_period || ''
  });

  const [errors, setErrors] = useState({
    teacher_id: '',
    subject_id: '',
    class_id: '',
    lesson_period: ''
  });

  // Trạng thái cho xung đột tiết học
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Trạng thái cho thời khóa biểu
  const [selectedPeriods, setSelectedPeriods] = useState<{[key: string]: boolean}>({});

  // Load lại dữ liệu thời khóa biểu khi initialData thay đổi
  useEffect(() => {
    if (initialData?.lesson_period) {
      const initialPeriods: {[key: string]: boolean} = {};
      const periodEntries = initialData.lesson_period.split(', ');
      
      periodEntries.forEach(entry => {
        // Phân tích cú pháp như "Tiết 1-2 Thứ 2"
        const match = entry.match(/Tiết (\d+)-(\d+) (.*)/);
        if (match) {
          const startPeriod = parseInt(match[1]);
          const endPeriod = parseInt(match[2]);
          const day = match[3];
          
          // Chuyển đổi tên ngày đầy đủ sang viết tắt để hiển thị đúng
          const shortDay = fullNameToShortName(day);
          
          for (let i = startPeriod; i <= endPeriod; i++) {
            initialPeriods[`${shortDay}_${i}`] = true;
          }
        }
      });
      
      setSelectedPeriods(initialPeriods);
    }
  }, [initialData]);

  // Kiểm tra xung đột khi formData.teacher_id hoặc formData.lesson_period thay đổi
  useEffect(() => {
    // Chỉ kiểm tra nếu có giáo viên và tiết học
    if (formData.teacher_id && formData.lesson_period) {
      const teacherId = parseInt(formData.teacher_id);
      const result = teacherSubjectService.checkPeriodConflicts(
        teacherId,
        formData.lesson_period,
        assignments,
        currentId
      );
      
      setConflicts(result.conflicts);
    } else {
      setConflicts([]);
    }
  }, [formData.teacher_id, formData.lesson_period, assignments, currentId]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Xóa lỗi khi người dùng thay đổi giá trị
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Nếu thay đổi giáo viên, cần kiểm tra lại xung đột
    if (name === 'teacher_id') {
      setConflicts([]);
    }
  };

  // Xử lý khi người dùng chọn/bỏ chọn một tiết học
  const handlePeriodToggle = (day: string, period: number) => {
    const key = `${day}_${period}`;
    
    setSelectedPeriods(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    // Cập nhật lesson_period dựa trên các tiết đã chọn
    setTimeout(() => {
      updateLessonPeriodFromSelection();
    }, 0);
  };

  // Cập nhật trường lesson_period từ các tiết đã chọn
  const updateLessonPeriodFromSelection = () => {
    const periodsByDay: {[key: string]: number[]} = {};
    
    // Nhóm các tiết theo ngày
    Object.keys(selectedPeriods).forEach(key => {
      if (selectedPeriods[key]) {
        const [day, periodStr] = key.split('_');
        const period = parseInt(periodStr);
        
        // Chuyển đổi tên viết tắt sang tên đầy đủ để lưu trữ
        const fullDay = shortNameToFullName(day);
        
        if (!periodsByDay[fullDay]) {
          periodsByDay[fullDay] = [];
        }
        
        periodsByDay[fullDay].push(period);
      }
    });
    
    // Chuyển đổi thành chuỗi định dạng "Tiết X-Y thứ Z"
    const periodStrings: string[] = [];
    
    Object.keys(periodsByDay).forEach(day => {
      const periods = periodsByDay[day].sort((a, b) => a - b);
      
      // Nhóm các tiết liên tiếp
      const ranges: [number, number][] = [];
      
      if (periods.length > 0) {
        let start = periods[0];
        let end = periods[0];
        
        for (let i = 1; i < periods.length; i++) {
          if (periods[i] === end + 1) {
            end = periods[i];
          } else {
            ranges.push([start, end]);
            start = periods[i];
            end = periods[i];
          }
        }
        
        ranges.push([start, end]);
      }
      
      // Tạo chuỗi cho mỗi dải tiết
      ranges.forEach(([start, end]) => {
        periodStrings.push(`Tiết ${start}-${end} ${day}`);
      });
    });
    
    setFormData(prev => ({
      ...prev,
      lesson_period: periodStrings.join(', ')
    }));
  };

  // Xóa tất cả các tiết đã chọn
  const handleClearAllPeriods = () => {
    setSelectedPeriods({});
    setFormData(prev => ({
      ...prev,
      lesson_period: ''
    }));
    setConflicts([]);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.teacher_id) {
      newErrors.teacher_id = 'Vui lòng chọn giáo viên';
      isValid = false;
    }

    if (!formData.subject_id) {
      newErrors.subject_id = 'Vui lòng chọn môn học';
      isValid = false;
    }

    // Nếu có xung đột tiết học, hiển thị lỗi
    if (conflicts.length > 0) {
      newErrors.lesson_period = 'Có xung đột tiết học, vui lòng điều chỉnh';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id.toString() === teacherId);
    return teacher ? teacher.name : '';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Cột thông tin cơ bản */}
          <div className="w-full md:w-1/2 space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Giáo viên <span className="text-red-500">*</span>
              </label>
              <select
                name="teacher_id"
                value={formData.teacher_id}
                onChange={handleChange}
                className={`w-full px-2 py-1.5 text-sm border rounded-md ${
                  errors.teacher_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Chọn giáo viên --</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id.toString()}>
                    {teacher.name}
                  </option>
                ))}
              </select>
              {errors.teacher_id && (
                <p className="text-red-500 text-xs mt-1">{errors.teacher_id}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Môn học <span className="text-red-500">*</span>
              </label>
              <select
                name="subject_id"
                value={formData.subject_id}
                onChange={handleChange}
                className={`w-full px-2 py-1.5 text-sm border rounded-md ${
                  errors.subject_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {errors.subject_id && (
                <p className="text-red-500 text-xs mt-1">{errors.subject_id}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Lớp học
              </label>
              <select
                name="class_id"
                value={formData.class_id}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              >
                <option value="">-- Chưa phân lớp --</option>
                {classes.map(classItem => (
                  <option key={classItem.id} value={classItem.id.toString()}>
                    {classItem.name}
                  </option>
                ))}
              </select>
              <p className="text-gray-500 text-xs mt-1">
                Nếu không chọn lớp, giáo viên sẽ được phân công môn học nhưng chưa được gán lớp
              </p>
            </div>

            {formData.lesson_period && (
              <div className="p-2 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-medium text-xs text-gray-700">Tiết học đã chọn:</p>
                  <button 
                    type="button" 
                    onClick={handleClearAllPeriods}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Xóa tất cả
                  </button>
                </div>
                <p className="text-xs text-gray-600">{formData.lesson_period}</p>
              </div>
            )}

            {/* Hiển thị xung đột tiết học */}
            {conflicts.length > 0 && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="font-medium text-xs text-red-700 mb-1">
                  Phát hiện xung đột tiết học của {getTeacherName(formData.teacher_id)}:
                </p>
                <ul className="text-xs text-red-600 list-disc pl-4 space-y-1">
                  {conflicts.map((conflict, index) => (
                    <li key={index}>{conflict}</li>
                  ))}
                </ul>
                <p className="text-xs text-red-500 mt-2 italic">
                  Vui lòng điều chỉnh thời khóa biểu hoặc chọn giáo viên khác
                </p>
              </div>
            )}
          </div>

          {/* Cột thời khóa biểu */}
          <div className="w-full md:w-1/2">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-gray-700 text-sm font-medium">
                Tiết học
              </label>
              {Object.keys(selectedPeriods).length > 0 && (
                <span className="text-xs text-gray-500">
                  Đã chọn {Object.keys(selectedPeriods).filter(k => selectedPeriods[k]).length} tiết
                </span>
              )}
            </div>
            
            {/* Bảng thời khóa biểu nhỏ gọn */}
            <div className={`border rounded-md overflow-hidden ${conflicts.length > 0 ? 'border-red-300' : 'border-gray-300'}`}>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-0.5">Tiết</th>
                    {DAYS_OF_WEEK.map(day => (
                      <th key={day} className="border border-gray-300 p-0.5">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map(period => (
                    <tr key={period}>
                      <td className="border border-gray-300 p-0.5 text-center font-medium">
                        {period}
                      </td>
                      {DAYS_OF_WEEK.map(day => {
                        // Kiểm tra xem tiết này có bị xung đột không
                        const fullDay = shortNameToFullName(day);
                        const isConflicted = conflicts.some(conflict => 
                          conflict.includes(`${fullDay} tiết`) && 
                          conflict.includes(`${period}-`) || 
                          conflict.includes(`-${period}`) ||
                          (conflict.match(/tiết (\d+)-(\d+)/) && ((m) => {
                            const start = parseInt(m[1]);
                            const end = parseInt(m[2]);
                            return period >= start && period <= end;
                          })(conflict.match(/tiết (\d+)-(\d+)/)!))
                        );
                        
                        return (
                          <td 
                            key={`${day}_${period}`} 
                            className="border border-gray-300 p-0 text-center"
                          >
                            <div 
                              className={`w-4 h-4 mx-auto cursor-pointer rounded-sm flex items-center justify-center ${
                                selectedPeriods[`${day}_${period}`] 
                                  ? isConflicted 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-green-500 text-white'
                                  : isConflicted
                                    ? 'bg-red-100 hover:bg-red-200'
                                    : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                              onClick={() => handlePeriodToggle(day, period)}
                              title={isConflicted ? "Tiết này bị xung đột với lịch dạy hiện tại" : ""}
                            >
                              {selectedPeriods[`${day}_${period}`] ? '✓' : ''}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <input 
              type="hidden" 
              name="lesson_period" 
              value={formData.lesson_period} 
            />
            
            <p className="text-gray-500 text-xs mt-1">
              Chọn các tiết học bằng cách nhấp vào ô tương ứng
              {errors.lesson_period && (
                <span className="text-red-500 ml-2">{errors.lesson_period}</span>
              )}
            </p>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end space-x-3 mt-4 pt-3 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            className={`px-3 py-1.5 text-sm ${
              conflicts.length > 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white rounded-md`}
            disabled={conflicts.length > 0}
          >
            {initialData ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherSubjectForm; 