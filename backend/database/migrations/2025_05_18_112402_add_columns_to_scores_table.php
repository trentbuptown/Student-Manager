<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('scores', function (Blueprint $table) {
            // Thêm các cột mới nếu chưa tồn tại
            if (!Schema::hasColumn('scores', 'teacher_id')) {
                $table->unsignedBigInteger('teacher_id')->nullable()->after('subject_id');
                $table->foreign('teacher_id')->references('id')->on('teachers')->onDelete('cascade');
            }
            
            if (!Schema::hasColumn('scores', 'class_id')) {
                $table->unsignedBigInteger('class_id')->nullable()->after('teacher_id');
                $table->foreign('class_id')->references('id')->on('classes')->onDelete('cascade');
            }
            
            if (!Schema::hasColumn('scores', 'score_value')) {
                $table->float('score_value')->nullable()->after('class_id');
            }
            
            if (!Schema::hasColumn('scores', 'score_type')) {
                $table->string('score_type')->nullable()->after('score_value');
            }
            
            if (!Schema::hasColumn('scores', 'semester')) {
                $table->integer('semester')->default(1)->after('score_type');
            }
            
            if (!Schema::hasColumn('scores', 'school_year')) {
                $table->string('school_year')->nullable()->after('semester');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scores', function (Blueprint $table) {
            // Xóa các cột đã thêm
            $table->dropForeign(['teacher_id']);
            $table->dropForeign(['class_id']);
            $table->dropColumn(['teacher_id', 'class_id', 'score_value', 'score_type', 'semester', 'school_year']);
        });
    }
};
