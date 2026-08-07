<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    protected $fillable = [
        'job_title',
        'company',
        'period',
        'description',
        'sort_order',
    ];

    protected static function booted()
    {
        static::saved(fn () => cache()->forget('portfolio_experiences'));
        static::deleted(fn () => cache()->forget('portfolio_experiences'));
    }
}
