<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\TeacherSubject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory; 

class SubjectController extends Controller
{
    // use HasFactory; // Assuming this trait is used in the base Controller or removed if not needed

    /**
     * Hiển thị danh sách môn học
     */
    public function index()
    {
        // Eager load the related teachers. Remove explicit select of non-existent columns.
        $subjects = Subject::with('teachers')->get();
        return response()->json($subjects);
    }

    /**
     * Lưu môn học mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:subjects'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Tạo môn học mới
        $subject = Subject::create([
            'name' => $request->name
        ]);

        // Xử lý thêm giáo viên vào môn học
        if ($request->has('teachers') && is_array($request->teachers)) {
            foreach ($request->teachers as $teacher) {
                if (isset($teacher['id'])) {
                    TeacherSubject::create([
                        'teacher_id' => $teacher['id'],
                        'subject_id' => $subject->id
                    ]);
                }
            }
        }

        return response()->json($subject->load('teachers'), 201);
    }

    /**
     * Hiển thị thông tin chi tiết môn học
     */
    public function show(Subject $subject)
    {
        return response()->json($subject->load('teachers'));
    }

    /**
     * Cập nhật thông tin môn học
     */
    public function update(Request $request, Subject $subject)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255|unique:subjects,name,' . $subject->id
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Cập nhật thông tin môn học
        $subject->update([
            'name' => $request->name
        ]);

        // Xử lý cập nhật giáo viên cho môn học
        if ($request->has('teachers') && is_array($request->teachers)) {
            // Xóa tất cả các bản ghi liên kết cũ
            TeacherSubject::where('subject_id', $subject->id)->delete();
            
            // Thêm các bản ghi mới
            foreach ($request->teachers as $teacher) {
                if (isset($teacher['id'])) {
                    TeacherSubject::create([
                        'teacher_id' => $teacher['id'],
                        'subject_id' => $subject->id
                    ]);
                }
            }
        }

        return response()->json($subject->load('teachers'));
    }

    /**
     * Xóa môn học
     */
    public function destroy(Subject $subject)
    {
        // Xóa tất cả các bản ghi liên kết trước
        TeacherSubject::where('subject_id', $subject->id)->delete();
        
        $subject->delete();
        return response()->json(null, 204);
    }
}
