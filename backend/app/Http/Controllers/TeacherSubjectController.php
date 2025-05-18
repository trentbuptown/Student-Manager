<?php

namespace App\Http\Controllers;

use App\Models\TeacherSubject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TeacherSubjectController extends Controller
{
    /**
     * Hiển thị danh sách phân công giảng dạy
     */
    public function index()
    {
        $teacherSubjects = TeacherSubject::with(['teacher', 'subject', 'class'])->get();
        return response()->json($teacherSubjects);
    }

    /**
     * Lưu phân công giảng dạy mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'teacher_id' => 'required|exists:teachers,id',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'nullable|exists:classes,id',
            'lesson_period' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $teacherSubject = TeacherSubject::create($request->all());
        return response()->json($teacherSubject->load(['teacher', 'subject', 'class']), 201);
    }

    /**
     * Hiển thị thông tin chi tiết phân công
     */
    public function show(TeacherSubject $teacherSubject)
    {
        return response()->json($teacherSubject->load(['teacher', 'subject', 'class']));
    }

    /**
     * Cập nhật thông tin phân công
     */
    public function update(Request $request, TeacherSubject $teacherSubject)
    {
        $validator = Validator::make($request->all(), [
            'teacher_id' => 'exists:teachers,id',
            'subject_id' => 'exists:subjects,id',
            'class_id' => 'nullable|exists:classes,id',
            'lesson_period' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $teacherSubject->update($request->all());
        return response()->json($teacherSubject->load(['teacher', 'subject', 'class']));
    }

    /**
     * Xóa phân công
     */
    public function destroy(TeacherSubject $teacherSubject)
    {
        $teacherSubject->delete();
        return response()->json(null, 204);
    }
} 