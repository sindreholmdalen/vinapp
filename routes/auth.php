<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('register', fn() => \Inertia\Inertia::render('Auth/Register'))->name('register');
    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', fn() => \Inertia\Inertia::render('Auth/Login'))->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});
