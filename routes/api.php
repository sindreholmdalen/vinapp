<?php

use App\Http\Controllers\Api\CellarController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FoodPairingController;
use App\Http\Controllers\Api\VinmonopoletController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Alle API-ruter krever autentisering via Sanctum (session-basert for SPA).
|
*/

Route::middleware('auth:sanctum')->group(function () {

    // Dashboard & statistikk
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/value-history', [DashboardController::class, 'valueHistory']);

    // Vinmonopolet søk & oppslag
    Route::get('/vinmonopolet/search', [VinmonopoletController::class, 'search']);
    Route::post('/vinmonopolet/barcode', [VinmonopoletController::class, 'barcodeLookup']);
    Route::get('/vinmonopolet/product/{productId}', [VinmonopoletController::class, 'show']);

    // Vinkjeller CRUD
    Route::get('/cellar', [CellarController::class, 'index']);
    Route::post('/cellar', [CellarController::class, 'store']);
    Route::get('/cellar/{cellarItem}', [CellarController::class, 'show']);
    Route::put('/cellar/{cellarItem}', [CellarController::class, 'update']);
    Route::delete('/cellar/{cellarItem}', [CellarController::class, 'destroy']);
    Route::post('/cellar/{cellarItem}/remove', [CellarController::class, 'removeBottle']);

    // Transaksjonshistorikk
    Route::get('/transactions', [CellarController::class, 'transactions']);

    // Matpairing
    Route::get('/pairing/wine/{wine}', [FoodPairingController::class, 'forWine']);
    Route::post('/pairing/food', [FoodPairingController::class, 'forFood']);
});
