<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('score_details', function (Blueprint $table) {
            if (!Schema::hasColumn('score_details', 'score_id')) {
                $table->foreignId('score_id')->constrained('scores')->onDelete('cascade');
            }
        });
    }

    public function down()
    {
        Schema::table('score_details', function (Blueprint $table) {
            if (Schema::hasColumn('score_details', 'score_id')) {
                $table->dropForeign(['score_id']);
                $table->dropColumn('score_id');
            }
        });
    }
};
