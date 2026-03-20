<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cellar_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('wine_id')->constrained()->onDelete('cascade');
            $table->foreignId('cellar_item_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['in', 'out']); // Inn = kjøpt/lagt til, Ut = drukket/gitt bort
            $table->integer('quantity')->default(1);
            $table->decimal('price_per_unit', 10, 2)->nullable();
            $table->string('reason')->nullable(); // purchased, gift_received, consumed, gift_given, broken, sold
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cellar_transactions');
    }
};
