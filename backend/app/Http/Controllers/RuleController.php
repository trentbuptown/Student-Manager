<?php

namespace App\Http\Controllers;

use App\Models\Rule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RuleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $rules = Rule::with('admin')->get();
        return response()->json([
            'status' => 'success',
            'data' => $rules
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'admin_id' => 'required|exists:admins,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()
            ], 422);
        }

        $rule = Rule::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Quy định đã được tạo thành công',
            'data' => $rule
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Rule $rule)
    {
        return response()->json([
            'status' => 'success',
            'data' => $rule->load('admin')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Rule $rule)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'string|max:255',
            'content' => 'string',
            'admin_id' => 'exists:admins,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()
            ], 422);
        }

        $rule->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Quy định đã được cập nhật thành công',
            'data' => $rule
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Rule $rule)
    {
        $rule->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Quy định đã được xóa thành công'
        ]);
    }
} 