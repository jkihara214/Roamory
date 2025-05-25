<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('travel_plans', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('country_id')->constrained('countries')->onDelete('cascade');
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('budget');
            $table->json('must_go_places');
            $table->json('plan_json');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_plans');
    }
}; 