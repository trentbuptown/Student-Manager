<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\User;
use App\Models\Classes;
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
            // Nếu giáo viên là GVCN, lấy lớp chủ nhiệm
            if ($teacher->is_gvcn) {
                $homeroom = Classes::where('teacher_id', $teacher->id)->first();
                
                if ($homeroom) {
                    // Nếu có lớp chủ nhiệm, đánh dấu nó
                    $homeroom->is_homeroom = true;
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
                
            return response()->json([
                'status' => 'success',
                'data' => $classes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi lấy danh sách lớp học: ' . $e->getMessage()
            ], 500);
        }
    }
}
