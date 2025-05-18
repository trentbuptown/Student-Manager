"use client";

import React, { useState } from 'react';
import { Teacher } from '@/services/teacherService';
import { Subject } from '@/services/subjectService';
import { Class } from '@/services/classService';
import { Score } from '@/services/scoreService';

type ScoreFormProps = {
  teachers: Teacher[];
  subjects: Subject[];
  classes: Class[];
  students: any[];
  initialData?: {
    student_id: string;
    subject_id: string;
    teacher_id: string;
    class_id: string;
    score_value: string;
    score_type: string;
    semester: string;
    school_year: string;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  title: string;
};

const SCORE_TYPES = [
  { value: 'mieng', label: 'Điểm miệng' },
  { value: '15p', label: 'Điểm 15 phút' },
  { value: '1tiet', label: 'Điểm 1 tiết' },
  { value: 'giuaky', label: 'Điểm giữa kỳ' },
  { value: 'cuoiky', label: 'Điểm cuối kỳ' }
];

const SEMESTERS = [
  { value: '1', label: 'Học kỳ 1' },
  { value: '2', label: 'Học kỳ 2' }
];

const ScoreForm: React.FC<ScoreFormProps> = ({
  teachers,
  subjects,
  classes,
  students,
  initialData,
  onSubmit,
  onCancel,
  title
}) => {
  const [formData, setFormData] = useState({
    student_id: initialData?.student_id || '',
    subject_id: initialData?.subject_id || '',
    teacher_id: initialData?.teacher_id || '',
    class_id: initialData?.class_id || '',
    score_value: initialData?.score_value || '',
    score_type: initialData?.score_type || '',
    semester: initialData?.semester || '1',
    school_year: initialData?.school_year || getCurrentSchoolYear()
  });

  const [errors, setErrors] = useState({
    student_id: '',
    subject_id: '',
    teacher_id: '',
    class_id: '',
    score_value: '',
    score_type: '',
    semester: '',
    school_year: ''
  });

  // Lấy năm học hiện tại (VD: 2023-2024)
  function getCurrentSchoolYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // Nếu tháng < 8 (trước tháng 8), thì năm học là năm trước - năm hiện tại
    if (month < 8) {
      return `${year - 1}-${year}`;
    }
    // Nếu tháng >= 8 (từ tháng 8 trở đi), thì năm học là năm hiện tại - năm sau
    return `${year}-${year + 1}`;
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Xử lý đặc biệt cho điểm số
    if (name === 'score_value') {
      // Chỉ cho phép nhập số và dấu chấm
      const numericValue = value.replace(/[^0-9.]/g, '');
      
      // Đảm bảo điểm không vượt quá 10
      const parsedValue = parseFloat(numericValue);
      if (!isNaN(parsedValue) && parsedValue > 10) {
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Xóa lỗi khi người dùng thay đổi giá trị
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Lọc học sinh theo lớp đã chọn
  const filteredStudents = formData.class_id 
    ? students.filter(student => student.class_id.toString() === formData.class_id)
    : students;

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.student_id) {
      newErrors.student_id = 'Vui lòng chọn học sinh';
      isValid = false;
    }

    if (!formData.subject_id) {
      newErrors.subject_id = 'Vui lòng chọn môn học';
      isValid = false;
    }

    if (!formData.teacher_id) {
      newErrors.teacher_id = 'Vui lòng chọn giáo viên';
      isValid = false;
    }

    if (!formData.class_id) {
      newErrors.class_id = 'Vui lòng chọn lớp';
      isValid = false;
    }

    if (!formData.score_value) {
      newErrors.score_value = 'Vui lòng nhập điểm';
      isValid = false;
    } else {
      const score = parseFloat(formData.score_value);
      if (isNaN(score) || score < 0 || score > 10) {
        newErrors.score_value = 'Điểm phải từ 0 đến 10';
        isValid = false;
      }
    }

    if (!formData.score_type) {
      newErrors.score_type = 'Vui lòng chọn loại điểm';
      isValid = false;
    }

    if (!formData.semester) {
      newErrors.semester = 'Vui lòng chọn học kỳ';
      isValid = false;
    }

    if (!formData.school_year) {
      newErrors.school_year = 'Vui lòng nhập năm học';
      isValid = false;
    } else if (!/^\d{4}-\d{4}$/.test(formData.school_year)) {
      newErrors.school_year = 'Năm học phải có định dạng YYYY-YYYY';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submissionData = {
        ...formData,
        student_id: parseInt(formData.student_id),
        subject_id: parseInt(formData.subject_id),
        teacher_id: parseInt(formData.teacher_id),
        class_id: parseInt(formData.class_id),
        score_value: parseFloat(formData.score_value),
        semester: parseInt(formData.semester)
      };
      
      onSubmit(submissionData);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Lớp học <span className="text-red-500">*</span>
            </label>
            <select
              name="class_id"
              value={formData.class_id}
              onChange={handleChange}
              className={`w-full px-2 py-1.5 text-sm border rounded-md ${
                errors.class_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">-- Chọn lớp học --</option>
              {classes.map(classItem => (
                <option key={classItem.id} value={classItem.id.toString()}>
                  {classItem.name}
                </option>
              ))}
            </select>
            {errors.class_id && (
              <p className="text-red-500 text-xs mt-1">{errors.class_id}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Học sinh <span className="text-red-500">*</span>
            </label>
            <select
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              className={`w-full px-2 py-1.5 text-sm border rounded-md ${
                errors.student_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={!formData.class_id}
            >
              <option value="">-- Chọn học sinh --</option>
              {filteredStudents.map(student => (
                <option key={student.id} value={student.id.toString()}>
                  {student.name} ({student.code})
                </option>
              ))}
            </select>
            {errors.student_id && (
              <p className="text-red-500 text-xs mt-1">{errors.student_id}</p>
            )}
            {!formData.class_id && (
              <p className="text-gray-500 text-xs mt-1">Vui lòng chọn lớp trước</p>
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
              Điểm số <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="score_value"
              value={formData.score_value}
              onChange={handleChange}
              placeholder="Nhập điểm (0-10)"
              className={`w-full px-2 py-1.5 text-sm border rounded-md ${
                errors.score_value ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.score_value && (
              <p className="text-red-500 text-xs mt-1">{errors.score_value}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Loại điểm <span className="text-red-500">*</span>
            </label>
            <select
              name="score_type"
              value={formData.score_type}
              onChange={handleChange}
              className={`w-full px-2 py-1.5 text-sm border rounded-md ${
                errors.score_type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">-- Chọn loại điểm --</option>
              {SCORE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.score_type && (
              <p className="text-red-500 text-xs mt-1">{errors.score_type}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Học kỳ <span className="text-red-500">*</span>
            </label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className={`w-full px-2 py-1.5 text-sm border rounded-md ${
                errors.semester ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {SEMESTERS.map(semester => (
                <option key={semester.value} value={semester.value}>
                  {semester.label}
                </option>
              ))}
            </select>
            {errors.semester && (
              <p className="text-red-500 text-xs mt-1">{errors.semester}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Năm học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="school_year"
              value={formData.school_year}
              onChange={handleChange}
              placeholder="VD: 2023-2024"
              className={`w-full px-2 py-1.5 text-sm border rounded-md ${
                errors.school_year ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.school_year && (
              <p className="text-red-500 text-xs mt-1">{errors.school_year}</p>
            )}
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
            className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            {initialData ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScoreForm; 