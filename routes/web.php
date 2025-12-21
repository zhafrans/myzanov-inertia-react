<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\LandingPageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Landing Page Routes (Public)
Route::get('/', [LandingPageController::class, 'home'])->name('landing.home');
Route::get('/catalogue', [LandingPageController::class, 'catalogue'])->name('landing.catalogue');
Route::get('/about', [LandingPageController::class, 'about'])->name('landing.about');
Route::get('/contact', [LandingPageController::class, 'contact'])->name('landing.contact');

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

    Route::resource('activity-logs', ActivityLogController::class)->only(['index']);

    Route::resource('products', ProductController::class);

    // Collector routes
    Route::prefix('collector')->name('collector.')->group(function () {
        Route::get('/', [SalesController::class, 'collectorIndex'])->name('index');
        Route::get('/uncollected', [SalesController::class, 'collectorUncollected'])->name('uncollected');
    });

    // Landing Page CMS
    Route::prefix('landing-page')->name('landing-page.')->group(function () {
        Route::get('/', [LandingPageController::class, 'adminIndex'])->name('index');
        Route::post('/', [LandingPageController::class, 'store'])->name('store');
        Route::put('/{landingPageContent}', [LandingPageController::class, 'update'])->name('update');
        Route::delete('/{landingPageContent}', [LandingPageController::class, 'destroy'])->name('destroy');
    });

    Route::get('/api/dashboard/data', [DashboardController::class, 'getDashboardData']);
    Route::get('/api/dashboard/years', [DashboardController::class, 'getYearOptions']);
    Route::get('/api/dashboard/top-card/{cardType}', [DashboardController::class, 'getTopCardData']);
});


Route::prefix('locations')->name('locations.')->group(function () {
    Route::get('/provinces', [SalesController::class, 'getProvinces'])->name('provinces');
    Route::get('/cities/{provinceId}', [SalesController::class, 'getCities'])->name('cities');
    Route::get('/subdistricts/{cityId}', [SalesController::class, 'getSubdistricts'])->name('subdistricts');
    Route::get('/villages/{subdistrictId}', [SalesController::class, 'getVillages'])->name('villages');
});

Route::prefix('api')->name('api.')->group(function () {
    Route::get('/users', [SalesController::class, 'getUsers'])->name('users');
});
