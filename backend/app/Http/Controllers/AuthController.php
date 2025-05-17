<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Đăng nhập thành công',
                'user' => $user,
                'token' => $token
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Email hoặc mật khẩu không đúng'
        ], 401);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Đăng xuất thành công'
        ]);
    }

    public function registerFirstAdmin(Request $request)
    {
        // Kiểm tra xem đã có admin nào chưa
        if (Admin::count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Admin đầu tiên đã được tạo'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            DB::beginTransaction();

            // Tạo user mới
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            // Tạo admin đầu tiên
            Admin::create([
                'name' => $validated['name'],
                'user_id' => $user->id
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Đăng ký admin đầu tiên thành công',
                'admin' => $user
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi đăng ký admin'
            ], 500);
        }
    }

    public function registerUser(Request $request)
    {
        // Kiểm tra xem user hiện tại có phải là admin không
        if (!$request->user() || !$request->user()->admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn không có quyền thực hiện hành động này'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,teacher,student',
            'class_id' => 'required_if:role,student|exists:classes,id',
            'specialization' => 'required_if:role,teacher|string|max:255',
            'is_gvcn' => 'required_if:role,teacher|boolean'
        ]);

        try {
            DB::beginTransaction();

            // Tạo user mới
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            // Tạo record tương ứng dựa vào role
            switch ($validated['role']) {
                case 'admin':
                    Admin::create([
                        'name' => $validated['name'],
                        'user_id' => $user->id
                    ]);
                    break;
                case 'teacher':
                    Teacher::create([
                        'name' => $validated['name'],
                        'specialization' => $validated['specialization'],
                        'is_gvcn' => $validated['is_gvcn'],
                        'user_id' => $user->id
                    ]);
                    break;
                case 'student':
                    Student::create([
                        'name' => $validated['name'],
                        'class_id' => $validated['class_id'],
                        'user_id' => $user->id
                    ]);
                    break;
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Đăng ký user thành công',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi đăng ký user'
            ], 500);
        }
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'User registered successfully',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ], 201);
    }
} 