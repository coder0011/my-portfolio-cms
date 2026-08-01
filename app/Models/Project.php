<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'title',
        'subtitle',
        'role',
        'link',
        'links_additional',
        'description',
        'image_path',
        'project_folder',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'links_additional' => 'array',
        'is_featured' => 'boolean',
    ];

    protected $appends = ['images_count', 'screenshots'];

    /**
     * Dynamically scan the screenshots folder in the portfolio public directory to count screenshots.
     */
    public function getImagesCountAttribute(): int
    {
        return count($this->screenshots);
    }

    /**
     * Get list of screenshots paths, syncing them from frontend folder to CMS public folder if needed.
     */
    public function getScreenshotsAttribute(): array
    {
        if (empty($this->project_folder)) {
            return [];
        }

        $cmsDir = public_path('storage/frontend/images/portfolio/' . $this->project_folder);
        $portfolioPath = env('PORTFOLIO_PUBLIC_PATH', base_path('../my-portfolio/public'));
        $frontendDir = rtrim($portfolioPath, '/') . '/images/portfolio/' . $this->project_folder;

        // Auto-sync frontend screenshots to CMS public storage dir if missing
        if (is_dir($frontendDir) && !is_dir($cmsDir)) {
            @mkdir($cmsDir, 0755, true);
            $frontendFiles = glob($frontendDir . '/*.{webp,png,jpg,jpeg}', GLOB_BRACE);
            if (is_array($frontendFiles)) {
                foreach ($frontendFiles as $fFile) {
                    @copy($fFile, $cmsDir . '/' . basename($fFile));
                }
            }
        }

        $files = [];
        if (is_dir($cmsDir)) {
            $files = glob($cmsDir . '/*.{webp,png,jpg,jpeg}', GLOB_BRACE);
        }

        if (is_array($files)) {
            return array_map(function ($file) {
                return '/storage/frontend/images/portfolio/' . $this->project_folder . '/' . basename($file);
            }, $files);
        }

        return [];
    }

    protected static function booted()
    {
        static::saved(function () {
            cache()->forget('portfolio_projects_all');
            cache()->forget('portfolio_projects_featured');
        });
        static::deleted(function () {
            cache()->forget('portfolio_projects_all');
            cache()->forget('portfolio_projects_featured');
        });
    }
}
