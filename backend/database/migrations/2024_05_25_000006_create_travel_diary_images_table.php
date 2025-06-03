<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('travel_diary_images', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('travel_diary_id')->constrained('travel_diaries')->onDelete('cascade');
            $table->string('image_path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_diary_images');
    }
}; 