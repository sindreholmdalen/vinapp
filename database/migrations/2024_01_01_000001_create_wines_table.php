<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wines', function (Blueprint $table) {
            $table->id();
            $table->string('vinmonopolet_id')->nullable()->unique();
            $table->string('barcode')->nullable()->index();
            $table->string('name');
            $table->string('producer')->nullable();
            $table->string('country')->nullable();
            $table->string('region')->nullable();
            $table->string('sub_region')->nullable();
            $table->string('type')->nullable(); // Rødvin, Hvitvin, Rosévin, Musserende, etc.
            $table->string('grape_variety')->nullable();
            $table->integer('year')->nullable();
            $table->decimal('alcohol_percentage', 4, 1)->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->decimal('volume_ml', 8, 1)->nullable();
            $table->string('taste_note')->nullable();
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->string('product_url')->nullable();
            $table->json('food_pairings')->nullable();
            $table->string('sweetness')->nullable();
            $table->string('freshness')->nullable();
            $table->string('tannins')->nullable();
            $table->string('fullness')->nullable();
            $table->string('bitterness')->nullable();
            $table->string('color')->nullable();
            $table->string('aroma')->nullable();
            $table->string('taste')->nullable();
            $table->string('storage_potential')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wines');
    }
};
