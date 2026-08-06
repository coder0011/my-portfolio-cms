<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;

class ImageService
{
    protected ImageManager $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver);
    }

    /**
     * Process and upload an image based on CMS configuration.
     * Returns the public URL path to be stored in the database.
     */
    public function upload(UploadedFile $file, string $directory = 'public/blogs/images'): string
    {
        $webpEnabled = filter_var(Setting::get('webp_conversion_enabled', true), FILTER_VALIDATE_BOOLEAN);
        $keepOriginal = filter_var(Setting::get('keep_original_image', false), FILTER_VALIDATE_BOOLEAN);

        // Strip leading 'public/' if present since we are using the public disk
        if (str_starts_with($directory, 'public/')) {
            $directory = substr($directory, 7);
        } elseif ($directory === 'public') {
            $directory = '';
        }

        $originalExtension = strtolower($file->getClientOriginalExtension());
        $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $slugifiedName = Str::slug($originalFilename);
        $hash = uniqid();

        // Determine destination folder
        $originalPath = "{$directory}/{$slugifiedName}-{$hash}.{$originalExtension}";

        if ($webpEnabled) {
            $webpPath = "{$directory}/{$slugifiedName}-{$hash}.webp";

            try {
                // Convert to WebP and compress using Intervention Image v4 decode/encode methods
                $image = $this->manager->decode($file);
                $webpData = (string) $image->encode(new WebpEncoder(80)); // 80% quality
                Storage::disk('public')->put($webpPath, $webpData);

                if ($keepOriginal) {
                    // Save the original file as fallback
                    $originalContents = file_get_contents($file->getRealPath());
                    if ($originalContents === false) {
                        throw new \RuntimeException('Failed to read uploaded file contents.');
                    }
                    Storage::disk('public')->put($originalPath, $originalContents);
                }

                return '/storage/'.$webpPath;
            } catch (\Exception $e) {
                // Fallback to storing original if compression fails
                $path = $file->storeAs(dirname($originalPath), basename($originalPath), 'public');
                if ($path === false) {
                    throw new \RuntimeException('Failed to store uploaded file.');
                }

                return '/storage/'.$path;
            }
        } else {
            // Save raw original file
            $path = $file->storeAs(dirname($originalPath), basename($originalPath), 'public');
            if ($path === false) {
                throw new \RuntimeException('Failed to store uploaded file.');
            }

            return '/storage/'.$path;
        }
    }
}
