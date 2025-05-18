<?php

namespace App\Http\Controllers;

use App\Models\Score;
use App\Models\Student;
use App\Models\Subject;
use App\Models\ClassModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ScoreController extends Controller
{
    /**
     * Hiển thị danh sách điểm
     */
    public function index(Request $request)
    {
        $query = Score::with(['student', 'subject', 'scoreDetails']);
        
        // Lọc theo student_id nếu được cung cấp
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }
        
        // Lọc theo subject_id nếu được cung cấp
        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }
        
        $scores = $query->get();
        
        // Bổ sung thông tin chi tiết
        $formattedScores = $scores->map(function ($score) {
            return [
                'id' => $score->id,
                'student' => [
                    'id' => $score->student->id,
                    'name' => $score->student->name,
                    'student_code' => $score->student->student_code ?? null,
                ],
                'subject' => [
                    'id' => $score->subject->id,
                    'name' => $score->subject->name,
                    'subject_code' => $score->subject->subject_code ?? null,
                ],
                'score_details' => $score->scoreDetails->map(function ($detail) {
                    return [
                        'id' => $detail->id,
                        'type' => $detail->type,
                        'score' => $detail->score,
                        'type_text' => $this->getScoreTypeText($detail->type),
                    ];
                }),
                'average_score' => $score->average_score,
                'classification' => $score->classification,
                'pass_status' => $score->pass_status,
                'created_at' => $score->created_at,
                'updated_at' => $score->updated_at,
            ];
        });
        
        return response()->json([
            'status' => 'success',
            'data' => $formattedScores,
        ]);
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
            'score_details.*.type' => 'required|string|in:mieng,15_phut,1_tiet,giua_ky,cuoi_ky',
            'score_details.*.score' => 'required|numeric|min:0|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        // Kiểm tra xem bản ghi điểm đã tồn tại cho học sinh và môn học này chưa
        $existingScore = Score::where('student_id', $request->student_id)
            ->where('subject_id', $request->subject_id)
            ->first();
            
        if ($existingScore) {
            return response()->json([
                'status' => 'error',
                'message' => 'Điểm cho học sinh và môn học này đã tồn tại'
            ], 422);
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

        $formattedScore = $this->formatScoreResponse($score->load(['student', 'subject', 'scoreDetails']));

        return response()->json([
            'status' => 'success',
            'message' => 'Điểm đã được tạo thành công',
            'data' => $formattedScore
        ], 201);
    }

    /**
     * Hiển thị thông tin chi tiết điểm
     */
    public function show(Score $score)
    {
        $formattedScore = $this->formatScoreResponse($score->load(['student', 'subject', 'scoreDetails']));
        
        return response()->json([
            'status' => 'success',
            'data' => $formattedScore
        ]);
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
            'score_details.*.type' => 'string|in:mieng,15_phut,1_tiet,giua_ky,cuoi_ky',
            'score_details.*.score' => 'numeric|min:0|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
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

        $formattedScore = $this->formatScoreResponse($score->fresh()->load(['student', 'subject', 'scoreDetails']));

        return response()->json([
            'status' => 'success',
            'message' => 'Điểm đã được cập nhật thành công',
            'data' => $formattedScore
        ]);
    }

    /**
     * Xóa điểm
     */
    public function destroy(Score $score)
    {
        $score->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Điểm đã được xóa thành công'
        ], 200);
    }
    
    /**
     * Định dạng phản hồi điểm với dữ liệu được cấu trúc tốt
     */
    private function formatScoreResponse($score)
    {
        return [
            'id' => $score->id,
            'student' => [
                'id' => $score->student->id,
                'name' => $score->student->name,
                'student_code' => $score->student->student_code ?? null,
            ],
            'subject' => [
                'id' => $score->subject->id,
                'name' => $score->subject->name,
                'subject_code' => $score->subject->subject_code ?? null,
            ],
            'score_details' => $score->scoreDetails->map(function ($detail) {
                return [
                    'id' => $detail->id,
                    'type' => $detail->type,
                    'score' => $detail->score,
                    'type_text' => $this->getScoreTypeText($detail->type),
                ];
            }),
            'average_score' => $score->average_score,
            'classification' => $score->classification,
            'pass_status' => $score->pass_status,
            'created_at' => $score->created_at,
            'updated_at' => $score->updated_at,
        ];
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

    /**
     * Lấy báo cáo chi tiết về điểm của một học sinh
     */
    public function getStudentReport($student_id)
    {
        $student = Student::with('class')->findOrFail($student_id);
        $scores = Score::with(['subject', 'scoreDetails'])
                    ->where('student_id', $student_id)
                    ->get();
                    
        $subjects = [];
        $totalAverage = 0;
        $totalSubjects = 0;
        $passedSubjects = 0;
        
        foreach ($scores as $score) {
            if ($score->average_score !== null) {
                $totalAverage += $score->average_score;
                $totalSubjects++;
                
                if ($score->pass_status === 'Đạt') {
                    $passedSubjects++;
                }
                
                $subjects[] = [
                    'subject_id' => $score->subject->id,
                    'subject_name' => $score->subject->name,
                    'average_score' => $score->average_score,
                    'classification' => $score->classification,
                    'pass_status' => $score->pass_status,
                    'details' => $score->scoreDetails->map(function($detail) {
                        return [
                            'type' => $detail->type,
                            'type_text' => $this->getScoreTypeText($detail->type),
                            'score' => $detail->score,
                        ];
                    }),
                ];
            }
        }
        
        $overallAverage = $totalSubjects > 0 ? round($totalAverage / $totalSubjects, 2) : null;
        $passRate = $totalSubjects > 0 ? round(($passedSubjects / $totalSubjects) * 100, 2) : null;
        
        // Xếp loại học lực tổng thể
        $overallClassification = null;
        if ($overallAverage !== null) {
            if ($overallAverage >= 8.5) {
                $overallClassification = 'Giỏi';
            } elseif ($overallAverage >= 7.0) {
                $overallClassification = 'Khá';
            } elseif ($overallAverage >= 5.0) {
                $overallClassification = 'Trung bình';
            } elseif ($overallAverage >= 3.5) {
                $overallClassification = 'Yếu';
            } else {
                $overallClassification = 'Kém';
            }
        }
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'student_code' => $student->student_code ?? null,
                    'class' => $student->class ? [
                        'id' => $student->class->id,
                        'name' => $student->class->name,
                    ] : null,
                ],
                'overall' => [
                    'average_score' => $overallAverage,
                    'classification' => $overallClassification,
                    'total_subjects' => $totalSubjects,
                    'passed_subjects' => $passedSubjects,
                    'pass_rate' => $passRate,
                ],
                'subjects' => $subjects,
            ]
        ]);
    }
    
    /**
     * Lấy báo cáo về điểm của một lớp học
     */
    public function getClassReport($class_id)
    {
        $class = ClassModel::findOrFail($class_id);
        $students = Student::where('class_id', $class_id)->get();
        
        $studentReports = [];
        $classTotalAverage = 0;
        $classStudentsWithScores = 0;
        $classExcellent = 0;
        $classGood = 0;
        $classAverage = 0;
        $classBelow = 0;
        
        foreach ($students as $student) {
            $scores = Score::with(['subject', 'scoreDetails'])
                    ->where('student_id', $student->id)
                    ->get();
            
            $studentTotalAverage = 0;
            $studentTotalSubjects = 0;
            $studentPassedSubjects = 0;
            $subjects = [];
            
            foreach ($scores as $score) {
                if ($score->average_score !== null) {
                    $studentTotalAverage += $score->average_score;
                    $studentTotalSubjects++;
                    
                    if ($score->pass_status === 'Đạt') {
                        $studentPassedSubjects++;
                    }
                    
                    $subjects[] = [
                        'subject_id' => $score->subject->id,
                        'subject_name' => $score->subject->name,
                        'average_score' => $score->average_score,
                        'classification' => $score->classification,
                        'pass_status' => $score->pass_status
                    ];
                }
            }
            
            $studentAverage = $studentTotalSubjects > 0 ? round($studentTotalAverage / $studentTotalSubjects, 2) : null;
            $studentPassRate = $studentTotalSubjects > 0 ? round(($studentPassedSubjects / $studentTotalSubjects) * 100, 2) : null;
            
            // Xếp loại học lực tổng thể của học sinh
            $studentClassification = null;
            if ($studentAverage !== null) {
                if ($studentAverage >= 8.5) {
                    $studentClassification = 'Giỏi';
                    $classExcellent++;
                } elseif ($studentAverage >= 7.0) {
                    $studentClassification = 'Khá';
                    $classGood++;
                } elseif ($studentAverage >= 5.0) {
                    $studentClassification = 'Trung bình';
                    $classAverage++;
                } else {
                    $studentClassification = $studentAverage >= 3.5 ? 'Yếu' : 'Kém';
                    $classBelow++;
                }
                
                $classTotalAverage += $studentAverage;
                $classStudentsWithScores++;
            }
            
            if ($studentAverage !== null) {
                $studentReports[] = [
                    'student' => [
                        'id' => $student->id,
                        'name' => $student->name,
                        'student_code' => $student->student_code ?? null,
                    ],
                    'average_score' => $studentAverage,
                    'classification' => $studentClassification,
                    'pass_rate' => $studentPassRate,
                    'subject_count' => $studentTotalSubjects
                ];
            }
        }
        
        // Sắp xếp học sinh theo điểm trung bình từ cao xuống thấp
        usort($studentReports, function($a, $b) {
            return $b['average_score'] <=> $a['average_score'];
        });
        
        // Tính điểm trung bình của lớp
        $classAverageScore = $classStudentsWithScores > 0 ? round($classTotalAverage / $classStudentsWithScores, 2) : null;
        
        // Tính tỷ lệ phần trăm các loại học lực
        $excellentRate = $classStudentsWithScores > 0 ? round(($classExcellent / $classStudentsWithScores) * 100, 2) : 0;
        $goodRate = $classStudentsWithScores > 0 ? round(($classGood / $classStudentsWithScores) * 100, 2) : 0;
        $averageRate = $classStudentsWithScores > 0 ? round(($classAverage / $classStudentsWithScores) * 100, 2) : 0;
        $belowRate = $classStudentsWithScores > 0 ? round(($classBelow / $classStudentsWithScores) * 100, 2) : 0;
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'class' => [
                    'id' => $class->id,
                    'name' => $class->name,
                    'grade_id' => $class->grade_id,
                    'total_students' => $students->count(),
                    'students_with_scores' => $classStudentsWithScores,
                ],
                'overall' => [
                    'average_score' => $classAverageScore,
                    'excellent' => [
                        'count' => $classExcellent,
                        'percentage' => $excellentRate,
                    ],
                    'good' => [
                        'count' => $classGood,
                        'percentage' => $goodRate,
                    ],
                    'average' => [
                        'count' => $classAverage,
                        'percentage' => $averageRate,
                    ],
                    'below_average' => [
                        'count' => $classBelow,
                        'percentage' => $belowRate,
                    ],
                ],
                'students' => $studentReports,
            ]
        ]);
    }
    
    /**
     * Lấy báo cáo về điểm của một môn học
     */
    public function getSubjectReport($subject_id)
    {
        $subject = Subject::findOrFail($subject_id);
        $scores = Score::with(['student.class', 'scoreDetails'])
                ->where('subject_id', $subject_id)
                ->get();
                
        $studentScores = [];
        $totalAverage = 0;
        $totalStudents = $scores->count();
        $passedStudents = 0;
        $excellent = 0;
        $good = 0;
        $average = 0;
        $below = 0;
        
        // Nhóm theo lớp học
        $classSummary = [];
        
        foreach ($scores as $score) {
            if ($score->average_score !== null) {
                $totalAverage += $score->average_score;
                
                if ($score->pass_status === 'Đạt') {
                    $passedStudents++;
                }
                
                // Xếp loại
                if ($score->average_score >= 8.5) {
                    $excellent++;
                } elseif ($score->average_score >= 7.0) {
                    $good++;
                } elseif ($score->average_score >= 5.0) {
                    $average++;
                } else {
                    $below++;
                }
                
                $studentScores[] = [
                    'student' => [
                        'id' => $score->student->id,
                        'name' => $score->student->name,
                        'student_code' => $score->student->student_code ?? null,
                        'class' => $score->student->class ? [
                            'id' => $score->student->class->id,
                            'name' => $score->student->class->name,
                        ] : null,
                    ],
                    'average_score' => $score->average_score,
                    'classification' => $score->classification,
                    'pass_status' => $score->pass_status,
                    'details' => $score->scoreDetails->map(function($detail) {
                        return [
                            'type' => $detail->type,
                            'type_text' => $this->getScoreTypeText($detail->type),
                            'score' => $detail->score,
                        ];
                    }),
                ];
                
                // Thêm vào thống kê theo lớp
                if ($score->student->class) {
                    $classId = $score->student->class->id;
                    $className = $score->student->class->name;
                    
                    if (!isset($classSummary[$classId])) {
                        $classSummary[$classId] = [
                            'class_id' => $classId,
                            'class_name' => $className,
                            'total_students' => 0,
                            'passed_students' => 0,
                            'average_score' => 0,
                            'excellence_count' => 0,
                            'good_count' => 0,
                            'average_count' => 0,
                            'below_count' => 0,
                        ];
                    }
                    
                    $classSummary[$classId]['total_students']++;
                    $classSummary[$classId]['average_score'] += $score->average_score;
                    
                    if ($score->pass_status === 'Đạt') {
                        $classSummary[$classId]['passed_students']++;
                    }
                    
                    if ($score->average_score >= 8.5) {
                        $classSummary[$classId]['excellence_count']++;
                    } elseif ($score->average_score >= 7.0) {
                        $classSummary[$classId]['good_count']++;
                    } elseif ($score->average_score >= 5.0) {
                        $classSummary[$classId]['average_count']++;
                    } else {
                        $classSummary[$classId]['below_count']++;
                    }
                }
            }
        }
        
        // Sắp xếp học sinh theo điểm từ cao xuống thấp
        usort($studentScores, function($a, $b) {
            return $b['average_score'] <=> $a['average_score'];
        });
        
        // Tính trung bình cho mỗi lớp
        foreach ($classSummary as $classId => $summary) {
            if ($summary['total_students'] > 0) {
                $classSummary[$classId]['average_score'] = round($summary['average_score'] / $summary['total_students'], 2);
                $classSummary[$classId]['pass_rate'] = round(($summary['passed_students'] / $summary['total_students']) * 100, 2);
            }
        }
        
        // Chuyển đổi mảng lớp thành danh sách
        $classesData = array_values($classSummary);
        
        // Sắp xếp lớp theo điểm trung bình từ cao xuống thấp
        usort($classesData, function($a, $b) {
            return $b['average_score'] <=> $a['average_score'];
        });
        
        $overallAverage = $totalStudents > 0 ? round($totalAverage / $totalStudents, 2) : null;
        $passRate = $totalStudents > 0 ? round(($passedStudents / $totalStudents) * 100, 2) : null;
        
        // Tính tỷ lệ phần trăm các loại học lực
        $excellentRate = $totalStudents > 0 ? round(($excellent / $totalStudents) * 100, 2) : 0;
        $goodRate = $totalStudents > 0 ? round(($good / $totalStudents) * 100, 2) : 0;
        $averageRate = $totalStudents > 0 ? round(($average / $totalStudents) * 100, 2) : 0;
        $belowRate = $totalStudents > 0 ? round(($below / $totalStudents) * 100, 2) : 0;
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'subject' => [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'subject_code' => $subject->subject_code ?? null,
                ],
                'overall' => [
                    'total_students' => $totalStudents,
                    'average_score' => $overallAverage,
                    'pass_rate' => $passRate,
                    'excellent' => [
                        'count' => $excellent,
                        'percentage' => $excellentRate,
                    ],
                    'good' => [
                        'count' => $good,
                        'percentage' => $goodRate,
                    ],
                    'average' => [
                        'count' => $average,
                        'percentage' => $averageRate,
                    ],
                    'below_average' => [
                        'count' => $below,
                        'percentage' => $belowRate,
                    ],
                ],
                'classes' => $classesData,
                'students' => $studentScores,
            ]
        ]);
    }
} 