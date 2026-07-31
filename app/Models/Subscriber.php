<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscriber extends Model
{
    protected $fillable = [
        'email',
        'verified_at',
        'subscribed_at',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'subscribed_at' => 'datetime',
    ];
}
