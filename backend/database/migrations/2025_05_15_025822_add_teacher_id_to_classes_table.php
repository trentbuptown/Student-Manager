<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('classes', function (Blueprint $table) {
            // Thêm cột teacher_id để liên kết với bảng teachers
            if (!Schema::hasColumn('classes', 'teacher_id')) {
                $table->foreignId('teacher_id')->nullable()->constrained('teachers')->onDelete('set null')->after('name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('classes', function (Blueprint $table) {
            if (Schema::hasColumn('classes', 'teacher_id')) {
                $table->dropForeign(['teacher_id']);
                $table->dropColumn('teacher_id');
            }
        });
    }
};
