<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $postsCount = \App\Models\Post::count();
        $likesCount = \App\Models\Post::sum('likes_count');
        $commentsCount = \App\Models\Comment::count();
        $subscribersCount = \App\Models\Subscriber::count();
        
        $recentPosts = \App\Models\Post::with('categories')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
            
        $recentComments = \App\Models\Comment::with('post')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return \Inertia\Inertia::render('dashboard', [
            'stats' => [
                'posts' => $postsCount,
                'likes' => (int) $likesCount,
                'comments' => $commentsCount,
                'subscribers' => $subscribersCount,
            ],
            'recentPosts' => $recentPosts,
            'recentComments' => $recentComments,
        ]);
    })->name('dashboard');

    Route::prefix('dashboard')->group(function () {
        Route::get('posts', [App\Http\Controllers\Admin\PostController::class, 'index'])->name('admin.posts.index');
        Route::get('posts/create', [App\Http\Controllers\Admin\PostController::class, 'create'])->name('admin.posts.create');
        Route::post('posts', [App\Http\Controllers\Admin\PostController::class, 'store'])->name('admin.posts.store');
        Route::get('posts/{post}/edit', [App\Http\Controllers\Admin\PostController::class, 'edit'])->name('admin.posts.edit');
        Route::put('posts/{post}', [App\Http\Controllers\Admin\PostController::class, 'update'])->name('admin.posts.update');
        Route::delete('posts/{post}', [App\Http\Controllers\Admin\PostController::class, 'destroy'])->name('admin.posts.destroy');

        Route::get('comments', [App\Http\Controllers\Admin\CommentController::class, 'index'])->name('admin.comments.index');
        Route::put('comments/{comment}/toggle-approve', [App\Http\Controllers\Admin\CommentController::class, 'toggleApprove'])->name('admin.comments.toggle-approve');
        Route::put('comments/{comment}', [App\Http\Controllers\Admin\CommentController::class, 'update'])->name('admin.comments.update');
        Route::post('comments/{comment}/reply', [App\Http\Controllers\Admin\CommentController::class, 'reply'])->name('admin.comments.reply');
        Route::delete('comments/{comment}', [App\Http\Controllers\Admin\CommentController::class, 'destroy'])->name('admin.comments.destroy');

        Route::get('logs', [App\Http\Controllers\Admin\ActivityLogController::class, 'index'])->name('admin.logs.index');

        Route::get('subscribers', [App\Http\Controllers\Admin\SubscriberController::class, 'index'])->name('admin.subscribers.index');
        Route::delete('subscribers/{subscriber}', [App\Http\Controllers\Admin\SubscriberController::class, 'destroy'])->name('admin.subscribers.destroy');
    });
});

require __DIR__.'/settings.php';
