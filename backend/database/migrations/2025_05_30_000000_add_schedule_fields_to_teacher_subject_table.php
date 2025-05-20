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
            $table->string('day_of_week')->nullable()->after('lesson_period');
            $table->string('room')->nullable()->after('day_of_week');
            $table->integer('semester')->default(1)->after('room');
            $table->string('school_year')->default(date('Y').'-'.(date('Y')+1))->after('semester');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('teacher_subject', function (Blueprint $table) {
            $table->dropColumn(['day_of_week', 'room', 'semester', 'school_year']);
        });
    }
}; 