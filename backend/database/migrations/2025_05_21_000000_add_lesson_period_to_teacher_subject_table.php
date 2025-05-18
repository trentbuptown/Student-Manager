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
        Schema::table('teacher_subject', function (Blueprint $table) {
            $table->text('lesson_period')->nullable()->after('class_id')->comment('Thông tin về tiết học, ví dụ: Tiết 1-2 thứ 2, Tiết 3-4 thứ 3');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('teacher_subject', function (Blueprint $table) {
            $table->dropColumn('lesson_period');
        });
    }
}; 