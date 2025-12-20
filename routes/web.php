<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SalesController;
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

    Route::get('/sales', [SalesController::class, 'index'])->name('sales.index');
    Route::get('/sales/create', [SalesController::class, 'create'])->name('sales.create');

    // Export route - must be before {id} routes
    Route::get('/sales/export', [SalesController::class, 'export'])->name('sales.export');

    Route::post('/sales', [SalesController::class, 'store'])->name('sales.store');
    Route::get('/sales/{id}', [SalesController::class, 'show'])->name('sales.show');
    Route::get('/sales/{id}/edit', [SalesController::class, 'edit'])->name('sales.edit');
    Route::put('/sales/{id}', [SalesController::class, 'update'])->name('sales.update');
    Route::delete('/sales/{id}', [SalesController::class, 'destroy'])->name('sales.destroy');

    // Installment routes
    Route::post('/sales/{id}/installments', [SalesController::class, 'createInstallment'])->name('sales.installments.store');
    Route::get('/sales/{id}/installments', [SalesController::class, 'getInstallments'])->name('sales.installments.index');
    Route::put('/sales/{saleId}/installments/{installmentId}', [SalesController::class, 'updateInstallment'])->name('sales.installments.update');


    // Route::prefix('sales')->name('sales.')->group(function () {
    //     Route::get(
    //         '/',
    //         fn() =>
    //         Inertia::render('Sales/Index')
    //     )->name('index');
    //     Route::get(
    //         '/{id}',
    //         fn($id) =>
    //         Inertia::render('Sales/Show', [
    //             'id' => $id,
    //         ])
    //     )->name('show');

    //     Route::post('/', fn() => back())->name('store');
    //     Route::post('/import', fn() => back())->name('import');
    //     Route::get('/export', fn() => back())->name('export');
    // });

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

    Route::resource('activity-logs', ActivityLogController::class)->only(['index']);

    Route::prefix('catalogues')->name('catalogues.')->group(function () {
        Route::get(
            '/',
            fn() =>
            Inertia::render('Catalogue/Index')
        )->name('index');
    });

    Route::get('/api/dashboard/data', [DashboardController::class, 'getDashboardData']);
    Route::get('/api/dashboard/years', [DashboardController::class, 'getYearOptions']);
});


Route::prefix('locations')->name('locations.')->group(function () {
    Route::get('/provinces', [SalesController::class, 'getProvinces'])->name('provinces');
    Route::get('/cities/{provinceId}', [SalesController::class, 'getCities'])->name('cities');
    Route::get('/subdistricts/{cityId}', [SalesController::class, 'getSubdistricts'])->name('subdistricts');
    Route::get('/villages/{subdistrictId}', [SalesController::class, 'getVillages'])->name('villages');
});
