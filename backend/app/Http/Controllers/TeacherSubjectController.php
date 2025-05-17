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
        $teacherSubjects = TeacherSubject::with(['teacher', 'subject'])->get();
        return response()->json($teacherSubjects);
    }

    /**
     * Lưu phân công giảng dạy mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'teacher_id' => 'required|exists:teachers,id',
            'subject_id' => 'required|exists:subjects,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $teacherSubject = TeacherSubject::create($request->all());
        return response()->json($teacherSubject, 201);
    }

    /**
     * Hiển thị thông tin chi tiết phân công
     */
    public function show(TeacherSubject $teacherSubject)
    {
        return response()->json($teacherSubject->load(['teacher', 'subject']));
    }

    /**
     * Cập nhật thông tin phân công
     */
    public function update(Request $request, TeacherSubject $teacherSubject)
    {
        $validator = Validator::make($request->all(), [
            'teacher_id' => 'exists:teachers,id',
            'subject_id' => 'exists:subjects,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $teacherSubject->update($request->all());
        return response()->json($teacherSubject);
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