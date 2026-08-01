<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = self::where('key', $key)->first();

        return $setting ? $setting->value : $default;
    }

    protected static function booted()
    {
        static::saved(fn() => cache()->forget('portfolio_settings'));
        static::deleted(fn() => cache()->forget('portfolio_settings'));
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, ?string $value): self
    {
        return self::updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
