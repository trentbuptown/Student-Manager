<?php

namespace App\Http\Controllers;

use App\Models\Score;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ScoreController extends Controller
{
    /**
     * Hiển thị danh sách điểm
     */
    public function index()
    {
        $scores = Score::with(['student', 'subject', 'scoreDetails'])->get();
        return response()->json($scores);
    }

    /**
     * Lưu điểm mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'score_details' => 'required|array',
            'score_details.*.type' => 'required|string',
            'score_details.*.score' => 'required|numeric|min:0|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $score = Score::create([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id
        ]);

        foreach ($request->score_details as $detail) {
            $score->scoreDetails()->create([
                'type' => $detail['type'],
                'score' => $detail['score']
            ]);
        }

        return response()->json($score->load(['student', 'subject', 'scoreDetails']), 201);
    }

    /**
     * Hiển thị thông tin chi tiết điểm
     */
    public function show(Score $score)
    {
        return response()->json($score->load(['student', 'subject', 'scoreDetails']));
    }

    /**
     * Cập nhật thông tin điểm
     */
    public function update(Request $request, Score $score)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'exists:students,id',
            'subject_id' => 'exists:subjects,id',
            'score_details' => 'array',
            'score_details.*.type' => 'string',
            'score_details.*.score' => 'numeric|min:0|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('student_id')) {
            $score->student_id = $request->student_id;
        }
        if ($request->has('subject_id')) {
            $score->subject_id = $request->subject_id;
        }
        $score->save();

        if ($request->has('score_details')) {
            $score->scoreDetails()->delete();
            foreach ($request->score_details as $detail) {
                $score->scoreDetails()->create([
                    'type' => $detail['type'],
                    'score' => $detail['score']
                ]);
            }
        }

        return response()->json($score->load(['student', 'subject', 'scoreDetails']));
    }

    /**
     * Xóa điểm
     */
    public function destroy(Score $score)
    {
        $score->delete();
        return response()->json(null, 204);
    }
} 