<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => redirect()->route('login'));

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/login', [AuthController::class, 'authenticate']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get(
        '/dashboard',
        fn() =>
        Inertia::render('Dashboard/Index')
    );

    Route::resource('users', UserController::class);

    Route::prefix('sales')->name('sales.')->group(function () {
        Route::get(
            '/',
            fn() =>
            Inertia::render('Sales/Index')
        )->name('index');
        Route::get(
            '/{id}',
            fn($id) =>
            Inertia::render('Sales/Show', [
                'id' => $id,
            ])
        )->name('show');

        Route::post('/', fn() => back())->name('store');
        Route::post('/import', fn() => back())->name('import');
        Route::get('/export', fn() => back())->name('export');
    });

    // Route::prefix('users')->name('users.')->group(function () {
    //     Route::get(
    //         '/',
    //         fn() =>
    //         Inertia::render('Users/Index')
    //     )->name('index');
    //     Route::get(
    //         '/{id}',
    //         fn($id) =>
    //         Inertia::render('Users/Show', [
    //             'id' => $id,
    //         ])
    //     )->name('show');
    // });

    Route::prefix('activity-logs')->name('activity-logs.')->group(function () {
        Route::get(
            '/',
            fn() =>
            Inertia::render('ActivityLogs/Index')
        )->name('index');
    });

    Route::prefix('catalogues')->name('catalogues.')->group(function () {
        Route::get(
            '/',
            fn() =>
            Inertia::render('Catalogue/Index')
        )->name('index');
    });
});
