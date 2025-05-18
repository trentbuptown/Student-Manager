<?php

namespace App\Http\Controllers;

use App\Models\Score;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Classes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ScoreController extends Controller
{
    /**
     * Hiển thị danh sách điểm
     */
    public function index(Request $request)
    {
        // Khởi tạo query builder
        $query = Score::with(['student', 'subject', 'teacher', 'class']);

        // Áp dụng các bộ lọc nếu có
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }
        
        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }
        
        if ($request->has('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }
        
        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }
        
        if ($request->has('semester')) {
            $query->where('semester', $request->semester);
        }
        
        if ($request->has('school_year')) {
            $query->where('school_year', $request->school_year);
        }
        
        if ($request->has('score_type')) {
            $query->where('score_type', $request->score_type);
        }

        // Lấy kết quả
        $scores = $query->get();
        
        // Định dạng lại dữ liệu để phù hợp với frontend
        $formattedScores = $scores->map(function ($score) {
            return [
                'id' => $score->id,
                'student_id' => $score->student_id,
                'subject_id' => $score->subject_id,
                'teacher_id' => $score->teacher_id, 
                'class_id' => $score->class_id,
                'score_value' => $score->score_value,
                'score_type' => $score->score_type,
                'semester' => $score->semester,
                'school_year' => $score->school_year,
                'created_at' => $score->created_at,
                'updated_at' => $score->updated_at,
                'student' => $score->student ? [
                    'id' => $score->student->id,
                    'name' => $score->student->name,
                    'code' => $score->student->code ?? ''
                ] : null,
                'subject' => $score->subject ? [
                    'id' => $score->subject->id,
                    'name' => $score->subject->name,
                    'code' => $score->subject->code ?? ''
                ] : null,
                'teacher' => $score->teacher ? [
                    'id' => $score->teacher->id,
                    'name' => $score->teacher->name
                ] : null,
                'class' => $score->class ? [
                    'id' => $score->class->id,
                    'name' => $score->class->name
                ] : null,
                'original' => [] // Thêm trường original trống để tránh lỗi
            ];
        });
        
        return response()->json($formattedScores);
    }

    /**
     * Lưu điểm mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'class_id' => 'required|exists:classes,id',
            'score_value' => 'required|numeric|min:0|max:10',
            'score_type' => 'required|string',
            'semester' => 'required|integer|min:1|max:2',
            'school_year' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $score = Score::create([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'teacher_id' => $request->teacher_id,
            'class_id' => $request->class_id,
            'score_value' => $request->score_value,
            'score_type' => $request->score_type,
            'semester' => $request->semester,
            'school_year' => $request->school_year
        ]);

        $score->load(['student', 'subject', 'teacher', 'class']);
        
        // Định dạng lại dữ liệu để phù hợp với frontend
        $formattedScore = [
            'id' => $score->id,
            'student_id' => $score->student_id,
            'subject_id' => $score->subject_id,
            'teacher_id' => $score->teacher_id, 
            'class_id' => $score->class_id,
            'score_value' => $score->score_value,
            'score_type' => $score->score_type,
            'semester' => $score->semester,
            'school_year' => $score->school_year,
            'created_at' => $score->created_at,
            'updated_at' => $score->updated_at,
            'student' => $score->student ? [
                'id' => $score->student->id,
                'name' => $score->student->name,
                'code' => $score->student->code ?? ''
            ] : null,
            'subject' => $score->subject ? [
                'id' => $score->subject->id,
                'name' => $score->subject->name,
                'code' => $score->subject->code ?? ''
            ] : null,
            'teacher' => $score->teacher ? [
                'id' => $score->teacher->id,
                'name' => $score->teacher->name
            ] : null,
            'class' => $score->class ? [
                'id' => $score->class->id,
                'name' => $score->class->name
            ] : null,
            'original' => [] // Thêm trường original trống để tránh lỗi
        ];
        
        return response()->json($formattedScore, 201);
    }

    /**
     * Hiển thị thông tin chi tiết điểm
     */
    public function show(Score $score)
    {
        $score->load(['student', 'subject', 'teacher', 'class']);
        
        // Định dạng lại dữ liệu để phù hợp với frontend
        $formattedScore = [
            'id' => $score->id,
            'student_id' => $score->student_id,
            'subject_id' => $score->subject_id,
            'teacher_id' => $score->teacher_id, 
            'class_id' => $score->class_id,
            'score_value' => $score->score_value,
            'score_type' => $score->score_type,
            'semester' => $score->semester,
            'school_year' => $score->school_year,
            'created_at' => $score->created_at,
            'updated_at' => $score->updated_at,
            'student' => $score->student ? [
                'id' => $score->student->id,
                'name' => $score->student->name,
                'code' => $score->student->code ?? ''
            ] : null,
            'subject' => $score->subject ? [
                'id' => $score->subject->id,
                'name' => $score->subject->name,
                'code' => $score->subject->code ?? ''
            ] : null,
            'teacher' => $score->teacher ? [
                'id' => $score->teacher->id,
                'name' => $score->teacher->name
            ] : null,
            'class' => $score->class ? [
                'id' => $score->class->id,
                'name' => $score->class->name
            ] : null,
            'original' => [] // Thêm trường original trống để tránh lỗi
        ];
        
        return response()->json($formattedScore);
    }

    /**
     * Cập nhật thông tin điểm
     */
    public function update(Request $request, Score $score)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'exists:students,id',
            'subject_id' => 'exists:subjects,id',
            'teacher_id' => 'exists:teachers,id',
            'class_id' => 'exists:classes,id',
            'score_value' => 'numeric|min:0|max:10',
            'score_type' => 'string',
            'semester' => 'integer|min:1|max:2',
            'school_year' => 'string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Cập nhật các trường nếu có trong request
        if ($request->has('student_id')) {
            $score->student_id = $request->student_id;
        }
        if ($request->has('subject_id')) {
            $score->subject_id = $request->subject_id;
        }
        if ($request->has('teacher_id')) {
            $score->teacher_id = $request->teacher_id;
        }
        if ($request->has('class_id')) {
            $score->class_id = $request->class_id;
        }
        if ($request->has('score_value')) {
            $score->score_value = $request->score_value;
        }
        if ($request->has('score_type')) {
            $score->score_type = $request->score_type;
        }
        if ($request->has('semester')) {
            $score->semester = $request->semester;
        }
        if ($request->has('school_year')) {
            $score->school_year = $request->school_year;
        }
        
        $score->save();
        
        $score->load(['student', 'subject', 'teacher', 'class']);
        
        // Định dạng lại dữ liệu để phù hợp với frontend
        $formattedScore = [
            'id' => $score->id,
            'student_id' => $score->student_id,
            'subject_id' => $score->subject_id,
            'teacher_id' => $score->teacher_id, 
            'class_id' => $score->class_id,
            'score_value' => $score->score_value,
            'score_type' => $score->score_type,
            'semester' => $score->semester,
            'school_year' => $score->school_year,
            'created_at' => $score->created_at,
            'updated_at' => $score->updated_at,
            'student' => $score->student ? [
                'id' => $score->student->id,
                'name' => $score->student->name,
                'code' => $score->student->code ?? ''
            ] : null,
            'subject' => $score->subject ? [
                'id' => $score->subject->id,
                'name' => $score->subject->name,
                'code' => $score->subject->code ?? ''
            ] : null,
            'teacher' => $score->teacher ? [
                'id' => $score->teacher->id,
                'name' => $score->teacher->name
            ] : null,
            'class' => $score->class ? [
                'id' => $score->class->id,
                'name' => $score->class->name
            ] : null,
            'original' => [] // Thêm trường original trống để tránh lỗi
        ];
        
        return response()->json($formattedScore);
    }

    /**
     * Xóa điểm
     */
    public function destroy(Score $score)
    {
        $score->delete();
        return response()->json(null, 204);
    }

    /**
     * Lấy danh sách năm học đã có điểm
     */
    public function getSchoolYears()
    {
        \Log::info('getSchoolYears method called');
        
        $schoolYears = Score::select('school_year')
            ->distinct()
            ->whereNotNull('school_year')
            ->orderBy('school_year', 'desc')
            ->pluck('school_year')
            ->toArray();
        
        \Log::info('Found school years: ' . json_encode($schoolYears));
        
        // Nếu không có dữ liệu thực tế, tạo danh sách năm học mặc định
        if (empty($schoolYears)) {
            $currentYear = date('Y');
            for ($i = 0; $i < 5; $i++) {
                $schoolYears[] = ($currentYear - $i - 1) . '-' . ($currentYear - $i);
            }
            \Log::info('Generated default school years: ' . json_encode($schoolYears));
        }
        
        return response()->json($schoolYears);
    }

    /**
     * Tính điểm trung bình cho một học sinh theo môn học
     */
    public function calculateAverage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'semester' => 'required|integer|min:1|max:2',
            'school_year' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $scores = Score::where('student_id', $request->student_id)
            ->where('subject_id', $request->subject_id)
            ->where('semester', $request->semester)
            ->where('school_year', $request->school_year)
            ->get();
        
        if ($scores->isEmpty()) {
            return response()->json(['average' => null, 'message' => 'Không có điểm nào']);
        }

        // Tạo mảng các loại điểm và hệ số
        $scoreTypes = [
            'oral' => ['weight' => 1, 'scores' => []],
            'exercise' => ['weight' => 1, 'scores' => []],
            'test15min' => ['weight' => 1, 'scores' => []],
            'test45min' => ['weight' => 2, 'scores' => []],
            'midterm' => ['weight' => 3, 'scores' => []],
            'final' => ['weight' => 4, 'scores' => []]
        ];

        // Phân loại các điểm theo loại
        foreach ($scores as $score) {
            if (isset($scoreTypes[$score->score_type])) {
                $scoreTypes[$score->score_type]['scores'][] = $score->score_value;
            }
        }

        // Tính tổng điểm có trọng số và tổng trọng số
        $totalWeightedScore = 0;
        $totalWeight = 0;

        foreach ($scoreTypes as $type => $data) {
            if (!empty($data['scores'])) {
                // Tính điểm trung bình cho từng loại điểm
                $typeAverage = array_sum($data['scores']) / count($data['scores']);
                $totalWeightedScore += $typeAverage * $data['weight'];
                $totalWeight += $data['weight'];
            }
        }

        // Tính điểm trung bình cuối cùng
        $average = ($totalWeight > 0) ? round($totalWeightedScore / $totalWeight, 2) : null;

        return response()->json(['average' => $average]);
    }

    /**
     * Nhập điểm hàng loạt
     */
    public function bulkCreate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'scores' => 'required|array',
            'scores.*.student_id' => 'required|exists:students,id',
            'scores.*.subject_id' => 'required|exists:subjects,id',
            'scores.*.teacher_id' => 'required|exists:teachers,id',
            'scores.*.class_id' => 'required|exists:classes,id',
            'scores.*.score_value' => 'required|numeric|min:0|max:10',
            'scores.*.score_type' => 'required|string',
            'scores.*.semester' => 'required|integer|min:1|max:2',
            'scores.*.school_year' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        
        try {
            foreach ($request->scores as $scoreData) {
                Score::create([
                    'student_id' => $scoreData['student_id'],
                    'subject_id' => $scoreData['subject_id'],
                    'teacher_id' => $scoreData['teacher_id'],
                    'class_id' => $scoreData['class_id'],
                    'score_value' => $scoreData['score_value'],
                    'score_type' => $scoreData['score_type'],
                    'semester' => $scoreData['semester'],
                    'school_year' => $scoreData['school_year']
                ]);
            }
            
            DB::commit();
            return response()->json(['message' => 'Nhập điểm hàng loạt thành công'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi khi nhập điểm hàng loạt', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Lấy báo cáo điểm của học sinh
     */
    public function getStudentReport(Request $request, $student_id)
    {
        $validator = Validator::make(['student_id' => $student_id] + $request->all(), [
            'student_id' => 'required|exists:students,id',
            'semester' => 'integer|min:1|max:2',
            'school_year' => 'string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Lấy thông tin học sinh
        $student = Student::with('class')->findOrFail($student_id);
        
        // Khởi tạo query
        $query = Score::where('student_id', $student_id)
                      ->with(['subject']);
        
        // Lọc theo học kỳ nếu có
        if ($request->has('semester')) {
            $query->where('semester', $request->semester);
        }
        
        // Lọc theo năm học nếu có
        if ($request->has('school_year')) {
            $query->where('school_year', $request->school_year);
        }
        
        // Lấy tất cả điểm của học sinh
        $scores = $query->get();
        
        // Nhóm điểm theo môn học
        $subjectScores = [];
        foreach ($scores as $score) {
            $subjectId = $score->subject_id;
            if (!isset($subjectScores[$subjectId])) {
                $subjectScores[$subjectId] = [
                    'subject' => $score->subject,
                    'scores' => []
                ];
            }
            $subjectScores[$subjectId]['scores'][] = [
                'id' => $score->id,
                'score_value' => $score->score_value,
                'score_type' => $score->score_type,
                'semester' => $score->semester,
                'school_year' => $score->school_year,
                'created_at' => $score->created_at
            ];
        }
        
        // Tính điểm trung bình cho từng môn học
        foreach ($subjectScores as &$subjectData) {
            $subjectData['average'] = $this->calculateSubjectAverage($subjectData['scores']);
        }
        
        return response()->json([
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'code' => $student->code,
                'class' => $student->class ? $student->class->name : null
            ],
            'subject_scores' => array_values($subjectScores)
        ]);
    }

    /**
     * Lấy báo cáo điểm của lớp học
     */
    public function getClassReport(Request $request, $class_id)
    {
        $validator = Validator::make(['class_id' => $class_id] + $request->all(), [
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'exists:subjects,id',
            'semester' => 'integer|min:1|max:2',
            'school_year' => 'string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Lấy thông tin lớp học
        $class = Classes::findOrFail($class_id);
        
        // Lấy danh sách học sinh trong lớp
        $students = Student::where('class_id', $class_id)->get();
        
        $classReport = [
            'class' => [
                'id' => $class->id,
                'name' => $class->name,
                'grade' => $class->grade ? $class->grade->name : null
            ],
            'students' => []
        ];
        
        foreach ($students as $student) {
            $query = Score::where('student_id', $student->id);
            
            // Lọc theo môn học nếu có
            if ($request->has('subject_id')) {
                $query->where('subject_id', $request->subject_id);
            }
            
            // Lọc theo học kỳ nếu có
            if ($request->has('semester')) {
                $query->where('semester', $request->semester);
            }
            
            // Lọc theo năm học nếu có
            if ($request->has('school_year')) {
                $query->where('school_year', $request->school_year);
            }
            
            $scores = $query->with('subject')->get();
            
            // Nhóm điểm theo môn học
            $subjectScores = [];
            foreach ($scores as $score) {
                $subjectId = $score->subject_id;
                if (!isset($subjectScores[$subjectId])) {
                    $subjectScores[$subjectId] = [
                        'subject' => $score->subject,
                        'scores' => []
                    ];
                }
                $subjectScores[$subjectId]['scores'][] = [
                    'id' => $score->id,
                    'score_value' => $score->score_value,
                    'score_type' => $score->score_type
                ];
            }
            
            // Tính điểm trung bình cho từng môn học
            foreach ($subjectScores as &$subjectData) {
                $subjectData['average'] = $this->calculateSubjectAverage($subjectData['scores']);
            }
            
            $classReport['students'][] = [
                'id' => $student->id,
                'name' => $student->name,
                'code' => $student->code,
                'subject_scores' => array_values($subjectScores)
            ];
        }
        
        return response()->json($classReport);
    }

    /**
     * Lấy báo cáo điểm theo môn học
     */
    public function getSubjectReport(Request $request, $subject_id)
    {
        $validator = Validator::make(['subject_id' => $subject_id] + $request->all(), [
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'exists:classes,id',
            'semester' => 'integer|min:1|max:2',
            'school_year' => 'string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Lấy thông tin môn học
        $subject = Subject::findOrFail($subject_id);
        
        // Khởi tạo query
        $query = Score::where('subject_id', $subject_id);
        
        // Lọc theo lớp học nếu có
        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
            $class = Classes::find($request->class_id);
        }
        
        // Lọc theo học kỳ nếu có
        if ($request->has('semester')) {
            $query->where('semester', $request->semester);
        }
        
        // Lọc theo năm học nếu có
        if ($request->has('school_year')) {
            $query->where('school_year', $request->school_year);
        }
        
        // Lấy tất cả điểm và nhóm theo học sinh
        $scores = $query->with('student')->get();
        
        // Nhóm điểm theo học sinh
        $studentScores = [];
        foreach ($scores as $score) {
            if (!$score->student) continue;
            
            $studentId = $score->student_id;
            if (!isset($studentScores[$studentId])) {
                $studentScores[$studentId] = [
                    'student' => [
                        'id' => $score->student->id,
                        'name' => $score->student->name,
                        'code' => $score->student->code
                    ],
                    'scores' => []
                ];
            }
            
            $studentScores[$studentId]['scores'][] = [
                'id' => $score->id,
                'score_value' => $score->score_value,
                'score_type' => $score->score_type,
                'semester' => $score->semester,
                'school_year' => $score->school_year
            ];
        }
        
        // Tính điểm trung bình cho từng học sinh
        foreach ($studentScores as &$studentData) {
            $studentData['average'] = $this->calculateSubjectAverage($studentData['scores']);
        }
        
        $report = [
            'subject' => [
                'id' => $subject->id,
                'name' => $subject->name,
                'code' => $subject->code
            ],
            'class' => isset($class) ? [
                'id' => $class->id,
                'name' => $class->name
            ] : null,
            'student_scores' => array_values($studentScores)
        ];
        
        return response()->json($report);
    }

    /**
     * Hàm tính điểm trung bình cho một môn học
     */
    private function calculateSubjectAverage($scores)
    {
        if (empty($scores)) {
            return null;
        }
        
        // Tạo mảng các loại điểm và hệ số
        $scoreTypes = [
            'oral' => ['weight' => 1, 'scores' => []],
            'exercise' => ['weight' => 1, 'scores' => []],
            'test15min' => ['weight' => 1, 'scores' => []],
            'test45min' => ['weight' => 2, 'scores' => []],
            'midterm' => ['weight' => 3, 'scores' => []],
            'final' => ['weight' => 4, 'scores' => []]
        ];
        
        // Phân loại các điểm theo loại
        foreach ($scores as $score) {
            if (isset($scoreTypes[$score['score_type']])) {
                $scoreTypes[$score['score_type']]['scores'][] = $score['score_value'];
            }
        }
        
        // Tính tổng điểm có trọng số và tổng trọng số
        $totalWeightedScore = 0;
        $totalWeight = 0;
        
        foreach ($scoreTypes as $type => $data) {
            if (!empty($data['scores'])) {
                // Tính điểm trung bình cho từng loại điểm
                $typeAverage = array_sum($data['scores']) / count($data['scores']);
                $totalWeightedScore += $typeAverage * $data['weight'];
                $totalWeight += $data['weight'];
            }
        }
        
        // Tính điểm trung bình cuối cùng
        return ($totalWeight > 0) ? round($totalWeightedScore / $totalWeight, 2) : null;
    }
} 