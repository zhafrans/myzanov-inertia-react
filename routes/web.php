<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\WaScheduleController;
use App\Http\Controllers\CollectorController;
use App\Enums\UserRole;
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

    // Profile Routes
    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/image', [\App\Http\Controllers\ProfileController::class, 'updateImage'])->name('profile.image.update');
    Route::put('/profile/password', [\App\Http\Controllers\ProfileController::class, 'updatePassword'])->name('profile.password.update');

   Route::get(
        '/dashboard',
        fn() =>
        Inertia::render('Dashboard/Index')
    )->name('dashboard.index');

    // User Management - Only Super Admin and Admin
    Route::get('/users', [UserController::class, 'index'])
    ->name('users.index')
    ->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);

    // STORE (Admin + SuperAdmin)
    Route::post('/users', [UserController::class, 'store'])
        ->name('users.store')
        ->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);

    // EDIT (Admin + SuperAdmin)
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])
        ->name('users.edit')
        ->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);

    // UPDATE (Admin + SuperAdmin)
    Route::put('/users/{user}', [UserController::class, 'update'])
        ->name('users.update')
        ->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);

    // DELETE (Admin + SuperAdmin)
    Route::delete('/users/{id}', [UserController::class, 'destroy'])
        ->name('users.destroy')
        ->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);

    Route::get('/users/{user}', [UserController::class, 'show'])
    ->name('users.show')
    ->middleware(
        'role:' 
        . UserRole::SuperAdmin->value . ',' 
        . UserRole::Admin->value . ',' 
        . UserRole::Sales->value . ',' 
        . UserRole::Collector->value . ',' 
        . UserRole::Driver->value
    );

    // Sales Routes
    Route::get('/sales', [SalesController::class, 'index'])->name('sales.index')->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value . ',' . UserRole::Collector->value);
    Route::get('/sales/create', [SalesController::class, 'create'])->name('sales.create')->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);

    // Export route - must be before {id} routes
    Route::get('/sales/export', [SalesController::class, 'export'])->name('sales.export')->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);
    
    // Items print list route - must be before {id} routes
    Route::get('/sales/items/print-list', [SalesController::class, 'itemsPrintList'])->name('sales.items.print-list')->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value . ',' . UserRole::Collector->value);
    
    // Print item route - must be before {id} routes
    Route::get('/sales/{saleId}/items/{itemId}/print', [SalesController::class, 'printItem'])->name('sales.items.print')->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value . ',' . UserRole::Collector->value);

    Route::post('/sales', [SalesController::class, 'store'])->name('sales.store')->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);
    Route::get('/sales/{id}', [SalesController::class, 'show'])->name('sales.show')->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value . ',' . UserRole::Collector->value);
    Route::get('/sales/{id}/edit', [SalesController::class, 'edit'])->name('sales.edit')->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);
    Route::put('/sales/{id}', [SalesController::class, 'update'])->name('sales.update')->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);
    Route::delete('/sales/{id}', [SalesController::class, 'destroy'])->name('sales.destroy')->middleware('role:' . UserRole::SuperAdmin->value);
    Route::patch('/sales/{id}/return', [SalesController::class, 'return'])->name('sales.return')->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);
    Route::post('/sales/{id}/change-to-cash-tempo', [SalesController::class, 'changeToCashTempo'])->name('sales.change-to-cash-tempo')->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);
    Route::post('/sales/{id}/change-to-credit', [SalesController::class, 'changeToCredit'])->name('sales.change-to-credit')->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);

    // Installment routes
    Route::post('/sales/{id}/installments', [SalesController::class, 'createInstallment'])->name('sales.installments.store')->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);
    Route::get('/sales/{id}/installments', [SalesController::class, 'getInstallments'])->name('sales.installments.index')->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value . ',' . UserRole::Collector->value);
    Route::put('/sales/{saleId}/installments/{installmentId}', [SalesController::class, 'updateInstallment'])->name('sales.installments.update')->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);
    Route::delete('/sales/{saleId}/installments/{installmentId}', [SalesController::class, 'deleteInstallment'])->name('sales.installments.destroy')->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);

    // Activity Logs - Only Super Admin
    Route::resource('activity-logs', ActivityLogController::class)
        ->only(['index'])
        ->middleware('role:' . UserRole::SuperAdmin->value);

    // Product Management - Admin, Super Admin, and potentially Sales
    Route::resource('products', ProductController::class)
        ->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value);

    // Collector routes - Only Collector
    Route::prefix('collector')
        ->name('collector.')
        ->middleware('role:' . UserRole::Collector->value . ',' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value)
        ->group(function () {
            Route::get('/', [SalesController::class, 'collectorIndex'])->name('index');
            Route::get('/uncollected', [SalesController::class, 'collectorUncollected'])->name('uncollected');
            Route::get('/card-statistics', [CollectorController::class, 'cardStatistics'])->name('card-statistics');
            Route::get('/data', [CollectorController::class, 'data'])->name('data');
        });

    // Landing Page CMS - Admin and Super Admin
    Route::prefix('landing-page')
        ->name('landing-page.')
        ->middleware('role:' . UserRole::SuperAdmin->value . ',' . UserRole::Admin->value)
        ->group(function () {
            Route::get('/', [LandingPageController::class, 'adminIndex'])->name('index');
            Route::post('/', [LandingPageController::class, 'store'])->name('store');
            Route::put('/{landingPageContent}', [LandingPageController::class, 'update'])->name('update');
            Route::delete('/{landingPageContent}', [LandingPageController::class, 'destroy'])->name('destroy');
        });

    // WhatsApp Session - Super Admin only
    Route::get('/whatsapp-session', [\App\Http\Controllers\WhatsAppSessionController::class, 'index'])
        ->name('whatsapp-session.index')
        ->middleware('role:' . UserRole::SuperAdmin->value);

    // WhatsApp Schedules - Super Admin only
    Route::get('/wa-schedules', [WaScheduleController::class, 'index'])
        ->name('wa-schedules.index')
        ->middleware('role:' . UserRole::SuperAdmin->value);
    
    Route::put('/wa-schedules/{waSchedule}', [WaScheduleController::class, 'update'])
        ->name('wa-schedules.update')
        ->middleware('role:' . UserRole::SuperAdmin->value);

   Route::middleware('role:' . UserRole::SuperAdmin->value)
    ->group(function () {
        Route::get('/api/dashboard/data', [DashboardController::class, 'getDashboardData']);
        Route::get('/api/dashboard/years', [DashboardController::class, 'getYearOptions']);
        Route::get('/api/dashboard/top-card/{cardType}', [DashboardController::class, 'getTopCardData']);
    });
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

