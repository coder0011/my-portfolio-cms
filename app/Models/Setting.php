<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

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
        static::saved(function () {
            static::regenerateCache();
        });
        static::deleted(function () {
            static::regenerateCache();
        });
    }

    /**
     * Clear and regenerate the portfolio settings cache.
     */
    public static function regenerateCache(): void
    {
        Cache::forget('portfolio_settings');
        static::getPublicSettings();
    }

    /**
     * Get formatted settings for API responses, cached forever.
     */
    public static function getPublicSettings(): array
    {
        return Cache::rememberForever('portfolio_settings', function () {
            $basicKeys = [
                'site_name', 'site_logo', 'site_favicon', 'admin_logo', 'admin_icon',
                'site_meta_title', 'site_meta_description',
                'owner_name', 'owner_title', 'owner_bio_short', 'owner_bio_long',
                'contact_email', 'contact_phone', 'contact_location', 'contact_address',
                'google_map_link', 'total_experience'
            ];

            $data = [];

            foreach ($basicKeys as $key) {
                $value = self::get($key);

                if ($key === 'site_name' && empty($value)) {
                    $value = config('app.name');
                }

                // Prepend asset path if it's a storage file
                if ($value && (str_starts_with($value, '/storage') || str_starts_with($value, 'storage/'))) {
                    $value = asset($value);
                }

                $data[$key] = $value;
            }

            // CV File Url formatting
            $cvPath = self::get('cv_file_path');
            if ($cvPath) {
                if (str_starts_with($cvPath, '/storage') || str_starts_with($cvPath, 'storage/')) {
                    $data['cv_file_path'] = asset($cvPath);
                } else {
                    $data['cv_file_path'] = $cvPath;
                }
            } else {
                $data['cv_file_path'] = null;
            }

            // Decode dynamic social media profiles and sort them by sort_order
            $socialLinksString = self::get('social_links');
            $socialLinks = [];
            if ($socialLinksString) {
                $socialLinks = json_decode($socialLinksString, true) ?: [];
                foreach ($socialLinks as &$link) {
                    if (! empty($link['icon']) && (str_starts_with($link['icon'], '/storage') || str_starts_with($link['icon'], 'storage/'))) {
                        $link['icon'] = asset($link['icon']);
                    }
                }
                unset($link);

                usort($socialLinks, function ($a, $b) {
                    return ($a['sort_order'] ?? 0) <=> ($b['sort_order'] ?? 0);
                });
            }
            $data['social_links'] = $socialLinks;

            return $data;
        });
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, ?string $value): self
    {
        return self::updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
