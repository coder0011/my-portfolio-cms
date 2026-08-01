<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
        static::saved(fn() => cache()->forget('portfolio_educations'));
        static::deleted(fn() => cache()->forget('portfolio_educations'));
    }
}
