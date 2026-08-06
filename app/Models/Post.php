<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Post extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'body',
        'main_image',
        'published_at',
        'likes_count',
        'difficulty',
        'estimated_time',
        'tags',
        'meta_title',
        'meta_description',
        'focus_keyword',
        'secondary_keywords',
        'no_index',
        'user_id',
        'faqs',
        'categories',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'likes_count' => 'integer',
        'tags' => 'array',
        'secondary_keywords' => 'array',
        'no_index' => 'boolean',
        'faqs' => 'array',
        'categories' => 'array',
    ];

    /**
     * Get the author of the post.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the comments for the post.
     *
     * @return HasMany<Comment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get the revisions for the post.
     *
     * @return HasMany<PostRevision, $this>
     */
    public function revisions(): HasMany
    {
        return $this->hasMany(PostRevision::class);
    }

    /**
     * Get the analytics data for the post.
     *
     * @return HasMany<Analytics, $this>
     */
    public function analytics(): HasMany
    {
        return $this->hasMany(Analytics::class);
    }

    /**
     * Get the categories for the post.
     *
     * @return BelongsToMany<Category, $this>
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    protected static function booted()
    {
        static::saved(function ($post) {
            static::clearPostCache($post);
        });
        static::deleted(function ($post) {
            static::clearPostCache($post);
        });
    }

    /**
     * Clear selective blog cache keys on post modifications to prevent cache stampedes.
     */
    protected static function clearPostCache(Post $post): void
    {
        // 1. Forget single post detail page cache
        Cache::forget("blog_post_{$post->slug}");

        // 2. Forget blog slider cache
        Cache::forget('blog_posts_slider');

        // 3. Forget sitemap cache if present
        Cache::forget('sitemap_cache');

        // 4. Forget all registered dynamic query listing caches
        $keys = Cache::get('post_cache_keys', []);
        if (is_array($keys)) {
            foreach ($keys as $key) {
                if (is_string($key)) {
                    Cache::forget($key);
                }
            }
        }
        Cache::forget('post_cache_keys');
    }
}
