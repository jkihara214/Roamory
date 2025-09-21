<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('visited_countries', function (Blueprint $table) {
            // diary_countカラムを追加（デフォルト値1、NOT NULL）
            $table->integer('diary_count')->default(1)->after('country_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visited_countries', function (Blueprint $table) {
            $table->dropColumn('diary_count');
        });
    }
};
