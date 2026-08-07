<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Education extends Model
{
    protected $table = 'educations';

    protected $fillable = [
        'degree',
        'institution',
        'period',
        'description',
        'sort_order',
    ];

    protected static function booted()
    {
        static::saved(function () {
            static::regenerateCache();
        });
        static::deleted(function () {
            static::regenerateCache();
        });
    }

    /**
     * Clear and regenerate the portfolio educations cache.
     */
    public static function regenerateCache(): void
    {
        Cache::forget('portfolio_educations');
        Cache::rememberForever('portfolio_educations', function () {
            return static::orderBy('sort_order', 'asc')
                ->orderBy('id', 'asc')
                ->get();
        });
    }
}
