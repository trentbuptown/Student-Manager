<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ScoreDetailController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\RuleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClassController;
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-first-admin', [AuthController::class, 'registerFirstAdmin']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::post('/register', [AuthController::class, 'registerUser']);
    });

    Route::apiResource('score-details', ScoreDetailController::class);
    Route::apiResource('grades', GradeController::class);
    Route::apiResource('rules', RuleController::class);
    Route::apiResource('classes', ClassController::class);
});