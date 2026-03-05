<?php

use App\Http\Controllers\BoutiqueController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\MouvementStockController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\RapportController;
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

// Public gallery routes (no auth required)
Route::get('/gallery', [GalleryController::class, 'index'])
    ->name('gallery.index');
Route::get('/gallery/category/{categorie}', [GalleryController::class, 'showCategory'])
    ->name('gallery.category');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('categories', CategoryController::class);
    Route::resource('tailles', TailleController::class);
    Route::resource('unites', \App\Http\Controllers\UniteController::class);
    Route::resource('boutiques', BoutiqueController::class);
    Route::resource('produits', ProduitController::class);
    Route::resource('clients', ClientController::class);
    Route::resource('ventes', VenteController::class);
    Route::resource('commandes', CommandeController::class);
    Route::resource('employes', EmployeController::class);
    Route::get('ventes/{vente}/receipt', [VenteController::class, 'receipt'])->name('ventes.receipt');

    Route::resource('mouvements-stock', MouvementStockController::class)->only(['index', 'create', 'store']);
    Route::get('/rapports', [RapportController::class, 'index'])->name('rapports.index');

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

require __DIR__.'/settings.php';
