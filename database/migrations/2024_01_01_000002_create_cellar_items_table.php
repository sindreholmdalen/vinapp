<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cellar_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('wine_id')->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(0);
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->date('purchase_date')->nullable();
            $table->string('location')->nullable(); // Fysisk plassering i kjelleren
            $table->string('rack')->nullable();
            $table->string('shelf')->nullable();
            $table->integer('rating')->nullable(); // 1-5 stjerner
            $table->text('personal_notes')->nullable();
            $table->date('drink_before')->nullable();
            $table->date('drink_after')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'wine_id', 'location']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cellar_items');
    }
};
