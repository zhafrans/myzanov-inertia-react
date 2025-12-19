<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subdistricts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->char('code', 8)->unique();
            $table->foreignId('city_id')->constrained('cities');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subdistricts');
    }
};
