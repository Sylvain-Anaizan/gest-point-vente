<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\TailleController;
use App\Http\Controllers\VenteController;
use App\Http\Controllers\WhatsAppController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Public gallery route (no auth required)
Route::get('/gallery/category/{categorie}', [GalleryController::class, 'showCategory'])
    ->name('gallery.category');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('categories', CategoryController::class);
    Route::resource('tailles', TailleController::class);
    Route::resource('produits', ProduitController::class);
    Route::resource('clients', ClientController::class);
    Route::resource('ventes', VenteController::class);
    Route::get('ventes/{vente}/receipt', [VenteController::class, 'receipt'])->name('ventes.receipt');

    // Route supplémentaire pour activer/désactiver un client
    Route::patch('clients/{client}/toggle-status', [ClientController::class, 'toggleStatus'])
        ->name('clients.toggle-status');

    // Routes POS
    Route::get('/pos', [POSController::class, 'index'])->name('pos.index');
    Route::post('/pos/store', [POSController::class, 'store'])->name('pos.store');

    // Routes WhatsApp
    Route::post('/whatsapp/send-catalog', [WhatsAppController::class, 'generateCatalogLink'])
        ->name('whatsapp.send-catalog');
    Route::get('/whatsapp/categories', [WhatsAppController::class, 'getCategories'])
        ->name('whatsapp.categories');
    Route::get('/whatsapp/category-products', [WhatsAppController::class, 'getCategoryProducts'])
        ->name('whatsapp.category-products');
});

require __DIR__ . '/settings.php';
