<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wa_schedules', function (Blueprint $table) {
            $table->id();
            $table->time('daily_at')->nullable();
            $table->unsignedTinyInteger('weekly_day')->nullable();
            $table->time('weekly_at')->nullable();
            $table->string('type')->nullable();
            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('wa_schedules');
    }
};
