"use client";

import React, { useState } from 'react';
import { Teacher } from '@/services/teacherService';
import { Subject } from '@/services/subjectService';
import { Class } from '@/services/classService';
import { ScoreFilter } from '@/services/scoreService';

type ScoreFilterProps = {
  teachers: Teacher[];
  subjects: Subject[];
  classes: Class[];
  schoolYears: string[];
  onFilter: (filters: ScoreFilter) => void;
  onReset: () => void;
};

const SCORE_TYPES = [
  { value: '', label: 'Tất cả loại điểm' },
  { value: 'mieng', label: 'Điểm miệng' },
  { value: '15p', label: 'Điểm 15 phút' },
  { value: '1tiet', label: 'Điểm 1 tiết' },
  { value: 'giuaky', label: 'Điểm giữa kỳ' },
  { value: 'cuoiky', label: 'Điểm cuối kỳ' }
];

const SEMESTERS = [
  { value: '', label: 'Tất cả học kỳ' },
  { value: '1', label: 'Học kỳ 1' },
  { value: '2', label: 'Học kỳ 2' }
];

// Loại dữ liệu mở rộng cho các trường filter dạng chuỗi
type StringFilters = {
  class_id: string;
  subject_id: string;
  teacher_id: string;
  semester: string;
  school_year: string;
  score_type: string;
};

const ScoreFilterComponent: React.FC<ScoreFilterProps> = ({
  teachers,
  subjects,
  classes,
  schoolYears,
  onFilter,
  onReset
}) => {
  const [filters, setFilters] = useState<StringFilters>({
    class_id: '',
    subject_id: '',
    teacher_id: '',
    semester: '',
    school_year: '',
    score_type: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Chuyển đổi các giá trị chuỗi thành số hoặc undefined nếu cần
    const processedFilters: ScoreFilter = {
      class_id: filters.class_id ? parseInt(filters.class_id) : undefined,
      subject_id: filters.subject_id ? parseInt(filters.subject_id) : undefined,
      teacher_id: filters.teacher_id ? parseInt(filters.teacher_id) : undefined,
      semester: filters.semester ? parseInt(filters.semester) : undefined,
      school_year: filters.school_year || undefined,
      score_type: filters.score_type || undefined
    };
    
    onFilter(processedFilters);
  };

  const handleReset = () => {
    setFilters({
      class_id: '',
      subject_id: '',
      teacher_id: '',
      semester: '',
      school_year: '',
      score_type: ''
    });
    
    onReset();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-lg font-medium text-gray-700 mb-3">Bộ lọc điểm</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-gray-700 text-xs font-medium mb-1">
              Lớp học
            </label>
            <select
              name="class_id"
              value={filters.class_id}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              <option value="">Tất cả lớp</option>
              {classes.map(classItem => (
                <option key={classItem.id} value={classItem.id.toString()}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-medium mb-1">
              Môn học
            </label>
            <select
              name="subject_id"
              value={filters.subject_id}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              <option value="">Tất cả môn</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id.toString()}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-medium mb-1">
              Giáo viên
            </label>
            <select
              name="teacher_id"
              value={filters.teacher_id}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              <option value="">Tất cả giáo viên</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id.toString()}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-medium mb-1">
              Loại điểm
            </label>
            <select
              name="score_type"
              value={filters.score_type}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              {SCORE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-medium mb-1">
              Học kỳ
            </label>
            <select
              name="semester"
              value={filters.semester}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              {SEMESTERS.map(semester => (
                <option key={semester.value} value={semester.value}>
                  {semester.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-medium mb-1">
              Năm học
            </label>
            <select
              name="school_year"
              value={filters.school_year}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              <option value="">Tất cả năm học</option>
              {schoolYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-3 space-x-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
          >
            Đặt lại
          </button>
          <button
            type="submit"
            className="px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Áp dụng
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScoreFilterComponent; 