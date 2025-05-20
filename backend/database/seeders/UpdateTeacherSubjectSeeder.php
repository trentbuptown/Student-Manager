<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\TeacherSubject;

class UpdateTeacherSubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teacherSubjects = TeacherSubject::all();
        
        foreach ($teacherSubjects as $teacherSubject) {
            $lessonInfo = $this->parseLessonPeriod($teacherSubject->lesson_period);
            
            $teacherSubject->day_of_week = $lessonInfo['day_of_week'];
            $teacherSubject->room = $lessonInfo['room'];
            $teacherSubject->semester = 1; // Mặc định semester 1
            $teacherSubject->school_year = date('Y') . '-' . (date('Y') + 1); // Năm học hiện tại
            
            $teacherSubject->save();
        }
        
        $this->command->info('Đã cập nhật dữ liệu cho bảng teacher_subject!');
    }
    
    /**
     * Phân tích chuỗi lesson_period để trích xuất thông tin ngày và tiết học
     * Ví dụ: "Thứ hai:1-5" => ['day_of_week' => 'Thứ hai', 'period' => 1]
     */
    private function parseLessonPeriod($lessonPeriod)
    {
        if (empty($lessonPeriod)) {
            return [
                'day_of_week' => 'Chưa xác định',
                'room' => 'Chưa xác định'
            ];
        }

        // Giả sử định dạng là "Thứ hai:1-5" hoặc tương tự
        $result = [];
        
        // Tách ngày và tiết
        if (preg_match('/^(Thứ [a-zÀ-ỹ]+)(?::|\s+)(\d+)(?:-\d+)?/ui', $lessonPeriod, $matches)) {
            $result['day_of_week'] = $matches[1];
        } else {
            $result['day_of_week'] = 'Chưa xác định';
        }
        
        // Tách phòng học nếu có
        if (preg_match('/phòng\s+(\w+)/i', $lessonPeriod, $matches)) {
            $result['room'] = $matches[1];
        } else {
            $result['room'] = 'Chưa xác định';
        }
        
        return $result;
    }
} 