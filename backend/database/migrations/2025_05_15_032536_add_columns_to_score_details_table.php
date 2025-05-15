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
        Schema::table('score_details', function (Blueprint $table) {
            // Thêm cột 'type' nếu chưa có
            if (!Schema::hasColumn('score_details', 'type')) {
                $table->string('type')->after('score_id'); // Loại điểm
            }

            // Thêm cột 'score' nếu chưa có
            if (!Schema::hasColumn('score_details', 'score')) {
                $table->float('score')->after('type'); // Điểm số
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('score_details', function (Blueprint $table) {
            // Xóa cột 'type' nếu có
            if (Schema::hasColumn('score_details', 'type')) {
                $table->dropColumn('type');
            }

            // Xóa cột 'score' nếu có
            if (Schema::hasColumn('score_details', 'score')) {
                $table->dropColumn('score');
            }
        });
    }
};
