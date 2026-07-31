<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostRevision extends Model
{
    protected $fillable = [
        'post_id',
        'user_id',
        'title',
        'excerpt',
        'body',
    ];

    /**
     * Get the post this revision belongs to.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Get the user/editor who created this revision.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
