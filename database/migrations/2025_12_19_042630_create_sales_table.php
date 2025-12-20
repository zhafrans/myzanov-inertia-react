<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('invoice')->unique();
            $table->string('card_number')->nullable();
            $table->decimal('price', 20);
            $table->string('customer_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('province_id')->nullable();
            $table->string('city_id')->nullable();
            $table->string('subdistrict_id')->nullable();
            $table->string('village_id')->nullable();
            $table->string('address');
            $table->foreignId('seller_id')->nullable()->constrained('users');
            $table->string('payment_type');
            $table->string('status');
            $table->timestamp('transaction_at');
            $table->string('is_tempo')->nullable();
            $table->timestamp('tempo_at')->nullable();
            $table->text('note')->nullable();
            $table->string('is_printed')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
