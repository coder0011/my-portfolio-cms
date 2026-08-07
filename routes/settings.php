<?php

use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::match(['post', 'patch'], 'settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('settings/portfolio', [ProfileController::class, 'editPortfolio'])->name('portfolio.edit');
    Route::match(['post', 'patch'], 'settings/portfolio', [ProfileController::class, 'updatePortfolio'])->name('portfolio.update');

    Route::post('settings/cache/purge', [ProfileController::class, 'purgeCache'])->name('settings.cache.purge');
    Route::post('settings/cache/clear-framework', [ProfileController::class, 'clearFrameworkCache'])->name('settings.cache.clear-framework');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});

Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
