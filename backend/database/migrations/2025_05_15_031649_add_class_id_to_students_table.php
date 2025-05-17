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
        Schema::table('students', function (Blueprint $table) {
            // Thêm cột class_id nếu chưa có
            if (!Schema::hasColumn('students', 'class_id')) {
                $table->foreignId('class_id')->nullable()->constrained('classes')->onDelete('set null')->after('phone');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'class_id')) {
                $table->dropForeign(['class_id']);
                $table->dropColumn('class_id');
            }
        });
    }
};
