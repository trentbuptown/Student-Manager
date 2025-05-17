<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GradeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $grades = Grade::with('classes')->get();
        return response()->json([
            'status' => 'success',
            'data' => $grades
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:grades,name'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()
            ], 422);
        }

        $grade = Grade::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Khối lớp đã được tạo thành công',
            'data' => $grade
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Grade $grade)
    {
        return response()->json([
            'status' => 'success',
            'data' => $grade->load('classes')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Grade $grade)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'string|unique:grades,name,' . $grade->id
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()
            ], 422);
        }

        $grade->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Khối lớp đã được cập nhật thành công',
            'data' => $grade
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Grade $grade)
    {
        // Kiểm tra xem khối lớp có lớp học nào không
        if ($grade->classes()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không thể xóa khối lớp này vì đang có lớp học thuộc khối'
            ], 422);
        }

        $grade->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Khối lớp đã được xóa thành công'
        ]);
    }
} 