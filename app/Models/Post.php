<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'likes_count' => 'integer',
        'tags' => 'array',
        'secondary_keywords' => 'array',
        'no_index' => 'boolean',
    ];

    /**
     * Get the author of the post.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the comments for the post.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get the revisions for the post.
     */
    public function revisions(): HasMany
    {
        return $this->hasMany(PostRevision::class);
    }

    /**
     * Get the analytics data for the post.
     */
    public function analytics(): HasMany
    {
        return $this->hasMany(Analytics::class);
    }

    /**
     * Get the categories for the post.
     */
    public function categories(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }
}
