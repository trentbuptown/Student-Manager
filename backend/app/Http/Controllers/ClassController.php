<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ClassController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $classes = Classes::with(['grade', 'teacher', 'students'])->get();
        return response()->json([
            'status' => 'success',
            'data' => $classes
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'grade_id' => 'required|exists:grades,id',
            'teacher_id' => 'nullable|exists:teachers,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()
            ], 422);
        }

        $class = Classes::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Lớp học đã được tạo thành công',
            'data' => $class
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Classes $class)
    {
        // Đếm số học sinh trong lớp
        $studentsCount = $class->students()->count();
        
        // Lấy dữ liệu lớp học kèm quan hệ
        $classData = $class->load(['grade', 'teacher']);
        
        // Thêm thông tin số học sinh
        $classData->students_count = $studentsCount;
        
        // Trả về dữ liệu
        return response()->json($classData);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Classes $class)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'grade_id' => 'exists:grades,id',
            'teacher_id' => 'nullable|exists:teachers,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()
            ], 422);
        }

        $class->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Lớp học đã được cập nhật thành công',
            'data' => $class
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Classes $class)
    {
        // Kiểm tra xem lớp có học sinh nào không
        if ($class->students()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không thể xóa lớp học này vì đang có học sinh trong lớp'
            ], 422);
        }

        $class->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Lớp học đã được xóa thành công'
        ]);
    }

    /**
     * Lấy danh sách học sinh thuộc lớp
     */
    public function getStudents($classId)
    {
        try {
            // Kiểm tra lớp học có tồn tại không
            $class = \App\Models\Classes::find($classId);
            if (!$class) {
                return response()->json([
                    'message' => 'Không tìm thấy lớp học'
                ], 404);
            }

            // Lấy danh sách học sinh trong lớp
            $students = \App\Models\Student::where('class_id', $classId)
                ->with(['user'])
                ->get();

            // Định dạng dữ liệu trả về nếu cần
            $formattedStudents = $students->map(function ($student) {
                // Xác định chức vụ nếu có - tạm thời để trống
                $classPosition = '';
                
                // Trong thực tế, bạn có thể có bảng riêng để lưu thông tin chức vụ trong lớp
                // Ví dụ: Có thể kiểm tra từ bảng class_positions hoặc một field class_position trong bảng students
                
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'gender' => $student->gender,
                    'birth_date' => $student->birth_date,
                    'phone' => $student->phone,
                    'user' => $student->user ? [
                        'id' => $student->user->id,
                        'name' => $student->user->name,
                        'email' => $student->user->email,
                    ] : null,
                    'class_id' => $student->class_id,
                    'class_position' => $classPosition
                ];
            });

            return response()->json($formattedStudents);
        } catch (\Exception $e) {
            \Log::error('Lỗi khi lấy danh sách học sinh lớp ' . $classId . ': ' . $e->getMessage());
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi lấy danh sách học sinh: ' . $e->getMessage()
            ], 500);
        }
    }
} 