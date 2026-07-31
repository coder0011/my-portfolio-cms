<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\CommentController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\SubscriberController;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Subscriber;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $postsCount = Post::count();
        $likesCount = Post::sum('likes_count');
        $commentsCount = Comment::count();
        $subscribersCount = Subscriber::count();

        $recentPosts = Post::with('categories')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentComments = Comment::with('post')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
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
        Route::get('posts', [PostController::class, 'index'])->name('admin.posts.index');
        Route::get('posts/create', [PostController::class, 'create'])->name('admin.posts.create');
        Route::post('posts', [PostController::class, 'store'])->name('admin.posts.store');
        Route::get('posts/{post}/edit', [PostController::class, 'edit'])->name('admin.posts.edit');
        Route::put('posts/{post}', [PostController::class, 'update'])->name('admin.posts.update');
        Route::delete('posts/{post}', [PostController::class, 'destroy'])->name('admin.posts.destroy');

        Route::get('comments', [CommentController::class, 'index'])->name('admin.comments.index');
        Route::put('comments/{comment}/toggle-approve', [CommentController::class, 'toggleApprove'])->name('admin.comments.toggle-approve');
        Route::put('comments/{comment}', [CommentController::class, 'update'])->name('admin.comments.update');
        Route::post('comments/{comment}/reply', [CommentController::class, 'reply'])->name('admin.comments.reply');
        Route::delete('comments/{comment}', [CommentController::class, 'destroy'])->name('admin.comments.destroy');

        Route::get('logs', [ActivityLogController::class, 'index'])->name('admin.logs.index');

        Route::get('subscribers', [SubscriberController::class, 'index'])->name('admin.subscribers.index');
        Route::delete('subscribers/{subscriber}', [SubscriberController::class, 'destroy'])->name('admin.subscribers.destroy');
    });
});

require __DIR__.'/settings.php';
