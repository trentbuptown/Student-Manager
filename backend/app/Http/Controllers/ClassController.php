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
        return response()->json([
            'status' => 'success',
            'data' => $class->load(['grade', 'teacher', 'students'])
        ]);
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
} 