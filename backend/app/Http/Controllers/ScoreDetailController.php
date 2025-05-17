<?php

namespace App\Http\Controllers;

use App\Models\ScoreDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ScoreDetailController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $scoreDetails = ScoreDetail::with('score')->get();
        return response()->json([
            'status' => 'success',
            'data' => $scoreDetails
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'score_id' => 'required|exists:scores,id',
            'type' => 'required|string',
            'score' => 'required|numeric|min:0|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()
            ], 422);
        }

        $scoreDetail = ScoreDetail::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Chi tiết điểm đã được tạo thành công',
            'data' => $scoreDetail
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ScoreDetail $scoreDetail)
    {
        return response()->json([
            'status' => 'success',
            'data' => $scoreDetail->load('score')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ScoreDetail $scoreDetail)
    {
        $validator = Validator::make($request->all(), [
            'score_id' => 'exists:scores,id',
            'type' => 'string',
            'score' => 'numeric|min:0|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()
            ], 422);
        }

        $scoreDetail->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Chi tiết điểm đã được cập nhật thành công',
            'data' => $scoreDetail
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ScoreDetail $scoreDetail)
    {
        $scoreDetail->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Chi tiết điểm đã được xóa thành công'
        ]);
    }
} 