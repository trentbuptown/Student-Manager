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
        Schema::table('scores', function (Blueprint $table) {
            // Kiểm tra nếu chưa có cột 'subject_id'
            if (!Schema::hasColumn('scores', 'subject_id')) {
                $table->foreignId('subject_id')
                    ->nullable()
                    ->constrained('subjects')
                    ->onDelete('cascade')
                    ->after('student_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('scores', function (Blueprint $table) {
            if (Schema::hasColumn('scores', 'subject_id')) {
                $table->dropForeign(['subject_id']);
                $table->dropColumn('subject_id');
            }
        });
    }
};
