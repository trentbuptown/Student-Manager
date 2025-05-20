<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ScoreDetailController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\RuleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\TeacherSubjectController;
use App\Http\Controllers\ScoreController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\StudentController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-first-admin', [AuthController::class, 'registerFirstAdmin']);

// Test routes (tạm thời public để test)
Route::apiResource('grades', GradeController::class);
Route::apiResource('classes', ClassController::class);
Route::get('/scores/school-years', [ScoreController::class, 'getSchoolYears']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Admin routes
    Route::middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class])->group(function () {
        Route::post('/register', [AuthController::class, 'registerUser']);
    });

    Route::apiResource('score-details', ScoreDetailController::class);
    Route::apiResource('rules', RuleController::class);
    Route::apiResource('teachers', TeacherController::class);
    Route::apiResource('subjects', SubjectController::class);
    Route::apiResource('students', StudentController::class);

    // Class Routes
    Route::get('/classes/{class}/students', [ClassController::class, 'getStudents']);

    // Student Routes mới
    Route::get('/students/{student}/schedule', [StudentController::class, 'getSchedule']);
    Route::get('/students/{student}/schedule/day', [StudentController::class, 'getSchedule']);
    Route::get('/students/{student}/grades', [StudentController::class, 'getGrades']);
    Route::get('/students/{student}/average-grade', [StudentController::class, 'getAverageGrade']);
    Route::get('/students/{student}/rank', [StudentController::class, 'getRank']);
    Route::get('/students/{student}/latest-semester', [StudentController::class, 'getLatestSemester']);
    Route::get('/students/{student}/subjects', [StudentController::class, 'getSubjects']);

    // Teacher Subject Routes
    Route::apiResource('teacher-subjects', TeacherSubjectController::class);
    
    // Lấy danh sách lớp học của giáo viên
    Route::get('/teachers/{teacher}/classes', [TeacherController::class, 'getClasses']);
    
    // Lấy thời khóa biểu của giáo viên
    Route::get('/teachers/{teacher}/schedule', [TeacherController::class, 'getSchedule']);
    
    // Lấy danh sách học sinh của giáo viên
    Route::get('/teachers/{teacher}/students', [TeacherController::class, 'getStudents']);
    
    // Lấy danh sách học sinh của một lớp dạy cụ thể
    Route::get('/teachers/{teacher}/classes/{class}/students', [TeacherController::class, 'getClassStudents']);

    // Endpoint cho quản lý điểm - phải đặt trước route resource
    Route::get('/scores/average', [ScoreController::class, 'calculateAverage']);
    Route::post('/scores/bulk', [ScoreController::class, 'bulkCreate']);
    
    // Score Routes - phải đặt sau các route cụ thể
    Route::apiResource('scores', ScoreController::class);
    
    // Báo cáo và thống kê
    Route::get('/reports/student/{student_id}', [ScoreController::class, 'getStudentReport']);
    Route::get('/reports/class/{class_id}', [ScoreController::class, 'getClassReport']);
    Route::get('/reports/subject/{subject_id}', [ScoreController::class, 'getSubjectReport']);
    
    // API đặc biệt để tạo/cập nhật điểm theo loại
    Route::post('/scores/update-type', [ScoreController::class, 'updateTypeScore']);
});
