<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\User;
use App\Models\Classes;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class TeacherController extends Controller
{
    /**
     * Hiển thị danh sách giáo viên
     */
    public function index()
    {
        $teachers = Teacher::with('user')->get();
        return response()->json($teachers);
    }

    /**
     * Lưu giáo viên mới
     */
    public function store(Request $request)
    {
        // Kiểm tra nếu có thông tin user mới
        if ($request->has('user') && (!$request->user_id || $request->user_id == 0)) {
            // Validate thông tin user
            $userValidator = Validator::make($request->user, [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
            ]);

            if ($userValidator->fails()) {
                return response()->json(['errors' => $userValidator->errors()], 422);
            }

            // Validate thông tin giáo viên
            $teacherValidator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'specialization' => 'required|string|max:255',
                'is_gvcn' => 'required|boolean',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
            ]);

            if ($teacherValidator->fails()) {
                return response()->json(['errors' => $teacherValidator->errors()], 422);
            }

            try {
                DB::beginTransaction();

                // Tạo user mới
                $user = User::create([
                    'name' => $request->user['name'],
                    'email' => $request->user['email'],
                    'password' => Hash::make($request->user['password']),
                ]);

                // Tạo giáo viên với user_id mới
                $teacher = Teacher::create([
                    'name' => $request->name,
                    'specialization' => $request->specialization,
                    'is_gvcn' => $request->is_gvcn,
                    'user_id' => $user->id,
                    'phone' => $request->phone,
                    'address' => $request->address,
                ]);

                DB::commit();
                return response()->json($teacher->load('user'), 201);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['errors' => ['general' => ['Lỗi khi tạo giáo viên và tài khoản: ' . $e->getMessage()]]], 500);
            }
        } else {
            // Xử lý trường hợp chỉ tạo giáo viên với user_id có sẵn
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'specialization' => 'required|string|max:255',
                'is_gvcn' => 'required|boolean',
                'user_id' => 'required|exists:users,id',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $teacher = Teacher::create($request->all());
            return response()->json($teacher, 201);
        }
    }

    /**
     * Hiển thị thông tin chi tiết giáo viên
     */
    public function show(Teacher $teacher)
    {
        return response()->json($teacher->load('user'));
    }

    /**
     * Cập nhật thông tin giáo viên
     */
    public function update(Request $request, Teacher $teacher)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'specialization' => 'string|max:255',
            'is_gvcn' => 'boolean',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $teacher->update($request->all());
        return response()->json($teacher);
    }

    /**
     * Xóa giáo viên
     */
    public function destroy(Teacher $teacher)
    {
        $teacher->delete();
        return response()->json(null, 204);
    }
    
    /**
     * Lấy danh sách lớp học của giáo viên
     */
    public function getClasses(Teacher $teacher)
    {
        try {
            // Khởi tạo mảng lưu kết quả
            $result = [];
            
            // Nếu giáo viên là GVCN, lấy lớp chủ nhiệm
            if ($teacher->is_gvcn) {
                $homeroom = Classes::where('teacher_id', $teacher->id)->first();
                
                if ($homeroom) {
                    // Đếm số học sinh trong lớp chủ nhiệm
                    $studentCount = DB::table('students')
                        ->where('class_id', $homeroom->id)
                        ->count();
                    
                    // Thêm lớp chủ nhiệm vào kết quả với đánh dấu
                    $result[] = [
                        'id' => $homeroom->id,
                        'class_name' => $homeroom->name,
                        'grade_id' => $homeroom->grade_id,
                        'is_homeroom' => true,
                        'subject_id' => null,
                        'subject_name' => 'Chủ nhiệm',
                        'lesson_period' => null,
                        'student_count' => $studentCount
                    ];
                }
            }
            
            // Lấy danh sách tất cả các lớp mà giáo viên dạy
            $classes = DB::table('classes')
                ->join('teacher_subject', function ($join) use ($teacher) {
                    $join->on('classes.id', '=', 'teacher_subject.class_id')
                        ->where('teacher_subject.teacher_id', '=', $teacher->id);
                })
                ->join('subjects', 'teacher_subject.subject_id', '=', 'subjects.id')
                ->select(
                    'classes.id',
                    'classes.name as class_name',
                    'classes.grade_id',
                    'subjects.id as subject_id',
                    'subjects.name as subject_name',
                    'teacher_subject.lesson_period',
                    DB::raw('CASE WHEN classes.teacher_id = ' . $teacher->id . ' THEN true ELSE false END as is_homeroom')
                )
                ->distinct()
                ->get();
            
            // Gộp dữ liệu từ truy vấn vào mảng kết quả
            foreach ($classes as $class) {
                // Đếm số học sinh trong lớp
                $studentCount = DB::table('students')
                    ->where('class_id', $class->id)
                    ->count();
                
                $classData = (array)$class;
                $classData['student_count'] = $studentCount;
                
                $result[] = $classData;
            }
                
            return response()->json([
                'status' => 'success',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi lấy danh sách lớp học: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy thời khóa biểu của giáo viên
     */
    public function getSchedule(Teacher $teacher)
    {
        try {
            // Lấy thời khóa biểu của giáo viên từ bảng teacher_subject
            $teacherSubjects = DB::table('teacher_subject')
                ->join('classes', 'teacher_subject.class_id', '=', 'classes.id')
                ->join('subjects', 'teacher_subject.subject_id', '=', 'subjects.id')
                ->where('teacher_subject.teacher_id', '=', $teacher->id)
                ->select(
                    'teacher_subject.id',
                    'teacher_subject.lesson_period',
                    'classes.name as class_name',
                    'subjects.name as subject'
                )
                ->get();
            
            // Xử lý dữ liệu để tách ra ngày trong tuần và tiết học
            $formattedSchedule = [];
            
            foreach ($teacherSubjects as $item) {
                if (empty($item->lesson_period)) {
                    continue;
                }
                
                // Có 2 định dạng có thể có: "Thứ 2:1-3", "Thứ hai:1,2", hoặc "Tiết 1-2 Thứ hai"
                // Xử lý định dạng "Thứ hai:1-3"
                $result = $this->parseLessonPeriod($item->lesson_period, $item);
                if (!empty($result)) {
                    $formattedSchedule = array_merge($formattedSchedule, $result);
                }
            }
            
            return response()->json($formattedSchedule);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi lấy thời khóa biểu: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Hàm phân tích chuỗi lesson_period
     */
    private function parseLessonPeriod($lessonPeriod, $item)
    {
        $result = [];
        
        // Chia thành mảng nếu có nhiều mục phân cách bởi dấu phẩy
        $periodEntries = explode(', ', $lessonPeriod);
        
        foreach ($periodEntries as $entry) {
            // Trường hợp 1: Định dạng "Thứ hai:1-3" hoặc "Thứ 2:1-3"
            if (strpos($entry, ':') !== false) {
                list($dayOfWeek, $periodInfo) = explode(':', $entry, 2);
                $dayOfWeek = trim($dayOfWeek);
                $periodInfo = trim($periodInfo);
                
                // Xử lý phạm vi tiết học
                $periods = [];
                
                // Kiểm tra dạng "1-3"
                if (strpos($periodInfo, '-') !== false) {
                    list($start, $end) = explode('-', $periodInfo);
                    for ($i = (int)$start; $i <= (int)$end; $i++) {
                        $periods[] = $i;
                    }
                } 
                // Kiểm tra dạng "1,2,3"
                else if (strpos($periodInfo, ',') !== false) {
                    $periods = array_map('intval', explode(',', $periodInfo));
                }
                // Trường hợp chỉ một tiết (d:n)
                else {
                    $periods[] = (int)$periodInfo;
                }
                
                // Tạo bản ghi cho mỗi tiết học
                foreach ($periods as $period) {
                    $result[] = [
                        'id' => $item->id,
                        'day_of_week' => $dayOfWeek,
                        'period' => $period,
                        'subject' => $item->subject,
                        'class_name' => $item->class_name
                    ];
                }
            }
            // Trường hợp 2: Định dạng "Tiết 1-2 Thứ hai" (legacy)
            else if (preg_match('/Tiết (\d+)-(\d+) (.*)/', $entry, $matches)) {
                $startPeriod = (int)$matches[1];
                $endPeriod = (int)$matches[2];
                $dayOfWeek = trim($matches[3]);
                
                for ($period = $startPeriod; $period <= $endPeriod; $period++) {
                    $result[] = [
                        'id' => $item->id,
                        'day_of_week' => $dayOfWeek,
                        'period' => $period,
                        'subject' => $item->subject,
                        'class_name' => $item->class_name
                    ];
                }
            }
        }
        
        return $result;
    }

    /**
     * Lấy danh sách tất cả học sinh của giáo viên
     */
    public function getStudents(Teacher $teacher)
    {
        try {
            // Lấy danh sách lớp học của giáo viên
            $teacherClasses = $this->getTeacherClassIds($teacher);
            
            if (empty($teacherClasses)) {
                return response()->json([
                    'status' => 'success',
                    'data' => []
                ]);
            }
            
            // Lấy danh sách học sinh từ các lớp này
            $students = DB::table('students')
                ->join('classes', 'students.class_id', '=', 'classes.id')
                ->leftJoin('users', 'students.user_id', '=', 'users.id')
                ->whereIn('students.class_id', $teacherClasses)
                ->select(
                    'students.id',
                    'students.name',
                    'students.birth_date',
                    'students.gender',
                    'students.phone',
                    'students.class_id',
                    'classes.name as class_name',
                    'users.email'
                )
                ->orderBy('classes.name')
                ->orderBy('students.name')
                ->get();
                
            return response()->json([
                'status' => 'success',
                'data' => $students
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi lấy danh sách học sinh: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Lấy danh sách học sinh của một lớp cụ thể
     */
    public function getClassStudents(Teacher $teacher, Classes $class)
    {
        try {
            // Kiểm tra xem giáo viên có phải là giáo viên của lớp này không
            $teacherClasses = $this->getTeacherClassIds($teacher);
            
            if (!in_array($class->id, $teacherClasses)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Giáo viên không dạy lớp này'
                ], 403);
            }
            
            // Lấy danh sách học sinh của lớp
            $students = DB::table('students')
                ->leftJoin('users', 'students.user_id', '=', 'users.id')
                ->where('students.class_id', $class->id)
                ->select(
                    'students.id',
                    'students.name',
                    'students.birth_date',
                    'students.gender',
                    'students.phone',
                    'users.email',
                    DB::raw("'{$class->name}' as class_name")
                )
                ->orderBy('students.name')
                ->get();
                
            return response()->json([
                'status' => 'success',
                'data' => $students
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi lấy danh sách học sinh của lớp: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Helper: Lấy danh sách ID lớp học của giáo viên
     */
    private function getTeacherClassIds(Teacher $teacher)
    {
        // Lấy lớp chủ nhiệm (nếu có)
        $homeroomClassIds = [];
        if ($teacher->is_gvcn) {
            $homeroomClass = Classes::where('teacher_id', $teacher->id)->first();
            if ($homeroomClass) {
                $homeroomClassIds[] = $homeroomClass->id;
            }
        }
        
        // Lấy các lớp giảng dạy khác
        $teachingClassIds = DB::table('teacher_subject')
            ->where('teacher_id', $teacher->id)
            ->whereNotNull('class_id')
            ->pluck('class_id')
            ->toArray();
            
        // Gộp và loại bỏ các ID trùng lặp
        return array_unique(array_merge($homeroomClassIds, $teachingClassIds));
    }
}
