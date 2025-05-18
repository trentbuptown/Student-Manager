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
    public function index(Request $request)
    {
        $query = ScoreDetail::with('score.student', 'score.subject');
        
        // Lọc theo score_id nếu được cung cấp
        if ($request->has('score_id')) {
            $query->where('score_id', $request->score_id);
        }
        
        // Lọc theo type nếu được cung cấp
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        $scoreDetails = $query->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $scoreDetails->map(function($detail) {
                return [
                    'id' => $detail->id,
                    'score_id' => $detail->score_id,
                    'type' => $detail->type,
                    'type_text' => $this->getScoreTypeText($detail->type),
                    'score' => $detail->score,
                    'student' => $detail->score->student ? [
                        'id' => $detail->score->student->id,
                        'name' => $detail->score->student->name,
                    ] : null,
                    'subject' => $detail->score->subject ? [
                        'id' => $detail->score->subject->id,
                        'name' => $detail->score->subject->name,
                    ] : null,
                    'created_at' => $detail->created_at,
                    'updated_at' => $detail->updated_at
                ];
            })
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'score_id' => 'required|exists:scores,id',
            'type' => 'required|string|in:mieng,15_phut,1_tiet,giua_ky,cuoi_ky',
            'score' => 'required|numeric|min:0|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()
            ], 422);
        }
        
        // Kiểm tra xem đã tồn tại điểm với loại này chưa
        $existingDetail = ScoreDetail::where('score_id', $request->score_id)
            ->where('type', $request->type)
            ->first();
            
        if ($existingDetail) {
            return response()->json([
                'status' => 'error',
                'message' => 'Đã tồn tại điểm với loại này cho học sinh và môn học này'
            ], 422);
        }

        $scoreDetail = ScoreDetail::create($request->all());
        $scoreDetail->load('score.student', 'score.subject');

        return response()->json([
            'status' => 'success',
            'message' => 'Chi tiết điểm đã được tạo thành công',
            'data' => [
                'id' => $scoreDetail->id,
                'score_id' => $scoreDetail->score_id,
                'type' => $scoreDetail->type,
                'type_text' => $this->getScoreTypeText($scoreDetail->type),
                'score' => $scoreDetail->score,
                'student' => $scoreDetail->score->student ? [
                    'id' => $scoreDetail->score->student->id,
                    'name' => $scoreDetail->score->student->name,
                ] : null,
                'subject' => $scoreDetail->score->subject ? [
                    'id' => $scoreDetail->score->subject->id,
                    'name' => $scoreDetail->score->subject->name,
                ] : null,
                'created_at' => $scoreDetail->created_at,
                'updated_at' => $scoreDetail->updated_at
            ]
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ScoreDetail $scoreDetail)
    {
        $scoreDetail->load('score.student', 'score.subject');
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $scoreDetail->id,
                'score_id' => $scoreDetail->score_id,
                'type' => $scoreDetail->type,
                'type_text' => $this->getScoreTypeText($scoreDetail->type),
                'score' => $scoreDetail->score,
                'student' => $scoreDetail->score->student ? [
                    'id' => $scoreDetail->score->student->id,
                    'name' => $scoreDetail->score->student->name,
                ] : null,
                'subject' => $scoreDetail->score->subject ? [
                    'id' => $scoreDetail->score->subject->id,
                    'name' => $scoreDetail->score->subject->name,
                ] : null,
                'created_at' => $scoreDetail->created_at,
                'updated_at' => $scoreDetail->updated_at
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ScoreDetail $scoreDetail)
    {
        $validator = Validator::make($request->all(), [
            'score_id' => 'exists:scores,id',
            'type' => 'string|in:mieng,15_phut,1_tiet,giua_ky,cuoi_ky',
            'score' => 'numeric|min:0|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()
            ], 422);
        }
        
        // Nếu type thay đổi, kiểm tra trùng lặp
        if ($request->has('type') && $request->type != $scoreDetail->type) {
            $existingDetail = ScoreDetail::where('score_id', $request->score_id ?? $scoreDetail->score_id)
                ->where('type', $request->type)
                ->first();
                
            if ($existingDetail) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Đã tồn tại điểm với loại này cho học sinh và môn học này'
                ], 422);
            }
        }

        $scoreDetail->update($request->all());
        $scoreDetail->load('score.student', 'score.subject');

        return response()->json([
            'status' => 'success',
            'message' => 'Chi tiết điểm đã được cập nhật thành công',
            'data' => [
                'id' => $scoreDetail->id,
                'score_id' => $scoreDetail->score_id,
                'type' => $scoreDetail->type,
                'type_text' => $this->getScoreTypeText($scoreDetail->type),
                'score' => $scoreDetail->score,
                'student' => $scoreDetail->score->student ? [
                    'id' => $scoreDetail->score->student->id,
                    'name' => $scoreDetail->score->student->name,
                ] : null,
                'subject' => $scoreDetail->score->subject ? [
                    'id' => $scoreDetail->score->subject->id,
                    'name' => $scoreDetail->score->subject->name,
                ] : null,
                'created_at' => $scoreDetail->created_at,
                'updated_at' => $scoreDetail->updated_at
            ]
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
    
    /**
     * Lấy văn bản mô tả cho loại điểm
     */
    private function getScoreTypeText($type)
    {
        $types = [
            'mieng' => 'Điểm miệng',
            '15_phut' => 'Điểm 15 phút',
            '1_tiet' => 'Điểm 1 tiết',
            'giua_ky' => 'Điểm giữa kỳ',
            'cuoi_ky' => 'Điểm cuối kỳ',
        ];
        
        return $types[$type] ?? $type;
    }
} 