<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\CommentController;
use App\Http\Controllers\Admin\ContactController;
use App\Http\Controllers\Admin\EducationController;
use App\Http\Controllers\Admin\ExperienceController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\SubscriberController;
use App\Http\Controllers\Admin\UserRoleController;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Subscriber;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::inertia('/', 'welcome')->name('home');

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

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
        Route::get('posts/{post}/preview-url', [PostController::class, 'generatePreviewUrl'])->name('admin.posts.preview-url');
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

        Route::get('contacts', [ContactController::class, 'index'])->name('admin.contacts.index');
        Route::delete('contacts/{contact}', [ContactController::class, 'destroy'])->name('admin.contacts.destroy');

        // Educations Timeline CRUD
        Route::get('educations', [EducationController::class, 'index'])->name('admin.educations.index');
        Route::post('educations', [EducationController::class, 'store'])->name('admin.educations.store');
        Route::put('educations/{education}', [EducationController::class, 'update'])->name('admin.educations.update');
        Route::delete('educations/{education}', [EducationController::class, 'destroy'])->name('admin.educations.destroy');

        // Experiences Timeline CRUD
        Route::get('experiences', [ExperienceController::class, 'index'])->name('admin.experiences.index');
        Route::post('experiences', [ExperienceController::class, 'store'])->name('admin.experiences.store');
        Route::put('experiences/{experience}', [ExperienceController::class, 'update'])->name('admin.experiences.update');
        Route::delete('experiences/{experience}', [ExperienceController::class, 'destroy'])->name('admin.experiences.destroy');

        // Projects Portfolio CRUD
        Route::get('projects', [ProjectController::class, 'index'])->name('admin.projects.index');
        Route::post('projects', [ProjectController::class, 'store'])->name('admin.projects.store');
        Route::put('projects/{project}', [ProjectController::class, 'update'])->name('admin.projects.update');
        Route::delete('projects/{project}', [ProjectController::class, 'destroy'])->name('admin.projects.destroy');

        // User & Role Management CRUD
        Route::get('users-roles', [UserRoleController::class, 'index'])->name('admin.users-roles.index');
        Route::post('users', [UserRoleController::class, 'storeUser'])->name('admin.users.store');
        Route::put('users/{user}', [UserRoleController::class, 'updateUser'])->name('admin.users.update');
        Route::delete('users/{user}', [UserRoleController::class, 'destroyUser'])->name('admin.users.destroy');
        Route::post('roles', [UserRoleController::class, 'storeRole'])->name('admin.roles.store');
        Route::put('roles/{role}', [UserRoleController::class, 'updateRole'])->name('admin.roles.update');
        Route::delete('roles/{role}', [UserRoleController::class, 'destroyRole'])->name('admin.roles.destroy');
    });
});

require __DIR__.'/settings.php';

if (app()->environment('local')) {
    Route::get('/preview-contact-email', function () {
        return view('emails.contact', [
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'subject' => 'Inquiry about Portfolio CMS',
            'contact_message' => "Hello!\n\nThis is a sample test message to preview the styling of the new HTML email template.\n\nBest regards,\nJohn",
        ]);
    });
}
