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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('body')->nullable();
            $table->string('main_image')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('likes_count')->default(0);

            $table->string('difficulty')->default('beginner');
            $table->string('estimated_time')->nullable();
            $table->json('tags')->nullable();

            // SEO Fields
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable(); // Set to text to avoid truncation issues
            $table->string('focus_keyword')->nullable();
            $table->json('secondary_keywords')->nullable();
            $table->boolean('no_index')->default(false);

            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
