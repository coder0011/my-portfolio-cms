<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Analytics extends Model
{
    protected $fillable = [
        'post_id',
        'views',
        'reads',
        'date',
    ];

    protected $casts = [
        'views' => 'integer',
        'reads' => 'integer',
        'date' => 'date',
    ];

    /**
     * Get the post that this analytics entry belongs to.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
