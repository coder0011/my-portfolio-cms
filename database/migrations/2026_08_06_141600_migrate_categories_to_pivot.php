<?php

use App\Models\Category;
use App\Models\Post;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Sync existing posts JSON categories to the pivot table
        Post::all()->each(function ($post) {
            $categories = $post->categories; // JSON cast array from post table
            if (is_array($categories)) {
                $categoryIds = [];
                foreach ($categories as $name) {
                    $name = trim($name);
                    if ($name === '') {
                        continue;
                    }
                    $category = Category::firstOrCreate(
                        ['title' => $name],
                        ['slug' => Str::slug($name)]
                    );
                    $categoryIds[] = $category->id;
                }
                $post->categories()->sync($categoryIds);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('category_post')->truncate();
    }
};
