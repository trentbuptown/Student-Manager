<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'specialization' => 'required|string|max:255',
            'is_gvcn' => 'required|boolean',
            'user_id' => 'required|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $teacher = Teacher::create($request->all());
        return response()->json($teacher, 201);
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
            'is_gvcn' => 'boolean'
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
}
