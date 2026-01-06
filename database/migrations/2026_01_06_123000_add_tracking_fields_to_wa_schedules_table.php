<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wa_schedules', function (Blueprint $table) {
            $table->timestamp('last_daily_run')->nullable()->after('type');
            $table->timestamp('last_weekly_run')->nullable()->after('last_daily_run');
        });
    }

    public function down(): void
    {
        Schema::table('wa_schedules', function (Blueprint $table) {
            $table->dropColumn(['last_daily_run', 'last_weekly_run']);
        });
    }
};
