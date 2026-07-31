<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\SubscriberController;
use App\Http\Controllers\Api\SettingController;

// Public Blog API routes
Route::prefix('v1')->group(function () {
    // Settings
    Route::get('settings', [SettingController::class, 'index']);

    // Posts
    Route::get('posts', [PostController::class, 'index']);
    Route::get('posts/{slug}', [PostController::class, 'show']);
    Route::post('posts/{id}/like', [PostController::class, 'like']);
    
    // Comments
    Route::post('posts/{postId}/comments', [CommentController::class, 'store']);
    
    // Newsletter Subscribers
    Route::post('subscribers', [SubscriberController::class, 'store']);
});
