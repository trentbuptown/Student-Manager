<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    /**
     * Hiển thị danh sách học sinh
     */
    public function index()
    {
        $students = Student::with(['user', 'class'])->get();
        return response()->json($students);
    }

    /**
     * Lưu học sinh mới
     */
    public function store(Request $request)
    {
        // Kiểm tra quyền admin
        if (!$request->user()->admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Chỉ quản trị viên mới có quyền tạo học sinh mới'
            ], 403);
        }
        
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

            // Validate thông tin học sinh
            $studentValidator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'birth_date' => 'required|date',
                'gender' => 'required|in:male,female,other',
                'phone' => 'required|string|max:20',
                'class_id' => 'required|exists:classes,id'
            ]);

            if ($studentValidator->fails()) {
                return response()->json(['errors' => $studentValidator->errors()], 422);
            }

            try {
                DB::beginTransaction();

                // Tạo user mới
                $user = User::create([
                    'name' => $request->user['name'],
                    'email' => $request->user['email'],
                    'password' => Hash::make($request->user['password']),
                ]);

                // Tạo học sinh với user_id mới
                $student = Student::create([
                    'name' => $request->name,
                    'birth_date' => $request->birth_date,
                    'gender' => $request->gender,
                    'phone' => $request->phone,
                    'class_id' => $request->class_id,
                    'user_id' => $user->id,
                ]);

                DB::commit();
                return response()->json($student->load('user'), 201);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['errors' => ['general' => ['Lỗi khi tạo học sinh và tài khoản: ' . $e->getMessage()]]], 500);
            }
        } else {
            // Xử lý trường hợp chỉ tạo học sinh với user_id có sẵn
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'birth_date' => 'required|date',
                'gender' => 'required|in:male,female,other',
                'phone' => 'required|string|max:20',
                'user_id' => 'required|exists:users,id',
                'class_id' => 'required|exists:classes,id'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $student = Student::create($request->all());
            return response()->json($student, 201);
        }
    }

    /**
     * Hiển thị thông tin chi tiết học sinh
     */
    public function show(Student $student)
    {
        return response()->json($student->load(['user', 'class']));
    }

    /**
     * Cập nhật thông tin học sinh
     */
    public function update(Request $request, Student $student)
    {
        // Validate thông tin học sinh
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'birth_date' => 'date',
            'gender' => 'in:male,female,other',
            'phone' => 'string|max:20',
            'class_id' => 'exists:classes,id',
            'email' => 'email|unique:users,email,' . $student->user_id,
            'username' => 'string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();
            
            // Cập nhật thông tin học sinh
            $studentData = $request->only(['name', 'birth_date', 'gender', 'phone', 'class_id']);
            $student->update($studentData);
            
            // Nếu có thông tin email hoặc username, cập nhật thông tin user
            if ($request->has('email') || $request->has('username')) {
                $user = User::find($student->user_id);
                if ($user) {
                    $userData = [];
                    if ($request->has('email')) {
                        $userData['email'] = $request->email;
                    }
                    if ($request->has('username')) {
                        $userData['name'] = $request->username;
                    }
                    $user->update($userData);
                }
            }
            
            DB::commit();
            // Tải lại mối quan hệ để trả về thông tin đã cập nhật
            $student->load(['user', 'class']);
            return response()->json($student);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi cập nhật học sinh: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa học sinh
     */
    public function destroy(Student $student)
    {
        // Kiểm tra quyền admin
        if (!request()->user()->admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Chỉ quản trị viên mới có quyền xóa học sinh'
            ], 403);
        }
        
        $student->delete();
        return response()->json(null, 204);
    }
}
