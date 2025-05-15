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
            // Thêm cột 'phone' nếu chưa có
            if (!Schema::hasColumn('students', 'phone')) {
                $table->string('phone')->nullable()->after('gender');
            }

            // Thêm cột 'gender' nếu chưa có
            if (!Schema::hasColumn('students', 'gender')) {
                $table->string('gender')->nullable()->after('birth_date');
            }

            // Thêm timestamps nếu chưa có
            if (!Schema::hasColumns('students', ['created_at', 'updated_at'])) {
                $table->timestamps();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            // Xóa cột 'phone' nếu có
            if (Schema::hasColumn('students', 'phone')) {
                $table->dropColumn('phone');
            }

            // Xóa cột 'gender' nếu có
            if (Schema::hasColumn('students', 'gender')) {
                $table->dropColumn('gender');
            }


            // Xóa timestamps nếu có
            if (Schema::hasColumns('students', ['created_at', 'updated_at'])) {
                $table->dropTimestamps();
            }
        });
    }
};
