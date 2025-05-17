<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'birth_date' => 'date',
            'gender' => 'in:male,female,other',
            'phone' => 'string|max:20',
            'class_id' => 'exists:classes,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $student->update($request->all());
        return response()->json($student);
    }

    /**
     * Xóa học sinh
     */
    public function destroy(Student $student)
    {
        $student->delete();
        return response()->json(null, 204);
    }
}
