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
            static::regeneratePostCache($post);
        });
        static::deleted(function ($post) {
            static::clearPostCache($post);
            static::regeneratePostCache($post);
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

    /**
     * Regenerate specific blog cache keys after changes.
     */
    protected static function regeneratePostCache(Post $post): void
    {
        // 1. Regenerate slider cache
        static::regenerateSliderCache();

        // 2. Regenerate single post detail page cache if the post still exists and is published
        if ($post->exists && $post->published_at && $post->published_at <= now() && !$post->no_index) {
            Cache::rememberForever("blog_post_{$post->slug}", function () use ($post) {
                return Post::with([
                    'user:id,name,avatar,bio',
                    'comments' => function ($query) {
                        $query->where('approved', true)->orderBy('created_at', 'desc');
                    },
                ])
                    ->where('slug', $post->slug)
                    ->whereNotNull('published_at')
                    ->where('published_at', '<=', now())
                    ->first()?->toArray();
            });
        }
    }

    /**
     * Regenerate the slider cache for posts.
     */
    public static function regenerateSliderCache(): void
    {
        Cache::forget('blog_posts_slider');
        Cache::rememberForever('blog_posts_slider', function () {
            return static::select([
                'id',
                'title',
                'slug',
                'excerpt',
                'main_image',
                'published_at',
                'likes_count',
                'user_id',
            ])
                ->withCount('comments')
                ->with(['user:id,name'])
                ->whereNotNull('published_at')
                ->where('published_at', '<=', now())
                ->where('no_index', false)
                ->orderBy('published_at', 'desc')
                ->take(6)
                ->get()
                ->toArray();
        });
    }
}
