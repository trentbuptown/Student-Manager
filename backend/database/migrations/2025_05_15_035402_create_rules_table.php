<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('rules', function (Blueprint $table) {
            $table->id();
            $table->string('title');          // Tên quy định
            $table->text('content');          // Nội dung quy định
            $table->foreignId('admin_id')->constrained('admins')->onDelete('cascade');  // Người tạo
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('rules');
    }
};
