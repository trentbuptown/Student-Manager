<?php

namespace App\Http\Controllers;

use App\Models\Subject;
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

        $subject = Subject::create($request->all());
        return response()->json($subject, 201);
    }

    /**
     * Hiển thị thông tin chi tiết môn học
     */
    public function show(Subject $subject)
    {
        return response()->json($subject);
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

        $subject->update($request->all());
        return response()->json($subject);
    }

    /**
     * Xóa môn học
     */
    public function destroy(Subject $subject)
    {
        $subject->delete();
        return response()->json(null, 204);
    }
}
