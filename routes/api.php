<?php

use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\SubscriberController;
use App\Http\Controllers\Api\EducationController;
use App\Http\Controllers\Api\ExperienceController;
use App\Http\Controllers\Api\ProjectController;
use Illuminate\Support\Facades\Route;

// Public Blog API routes
Route::prefix('v1')->group(function () {
    // Read operations (throttled at 60 req/min)
    Route::middleware('throttle:api')->group(function () {
        Route::get('settings', [SettingController::class, 'index']);
        Route::get('educations', [EducationController::class, 'index']);
        Route::get('experiences', [ExperienceController::class, 'index']);
        Route::get('projects', [ProjectController::class, 'index']);
        Route::get('posts', [PostController::class, 'index']);
        Route::get('posts/slider', [PostController::class, 'slider']);
        Route::get('posts/{slug}', [PostController::class, 'show']);
    });

    // Write operations (throttled at 5 req/min to prevent spam)
    Route::middleware('throttle:api_writes')->group(function () {
        Route::post('posts/{id}/like', [PostController::class, 'like']);
        Route::post('posts/{postId}/comments', [CommentController::class, 'store']);
        Route::post('subscribers', [SubscriberController::class, 'store']);
    });
});
