<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Inertia-basert SPA. Alle sider renderes via React-komponenter.
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('Dashboard/Index'))->name('dashboard');
    Route::get('/cellar', fn() => Inertia::render('Cellar/Index'))->name('cellar');
    Route::get('/cellar/{id}', fn($id) => Inertia::render('Cellar/Show', ['id' => $id]))->name('cellar.show');
    Route::get('/search', fn() => Inertia::render('Wine/Search'))->name('wine.search');
    Route::get('/scanner', fn() => Inertia::render('Wine/Scanner'))->name('scanner');
    Route::get('/pairing', fn() => Inertia::render('Wine/Pairing'))->name('pairing');
});

require __DIR__ . '/auth.php';
