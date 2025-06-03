<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usage_histories', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('feature_id')->comment('1: travel_plans_ai, 2: visited_countries_ai');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usage_histories');
    }
}; 