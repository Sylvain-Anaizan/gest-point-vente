<?php

use App\Http\Controllers\BoutiqueController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\InventaireController;
use App\Http\Controllers\MouvementStockController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\RoleController;
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

    Route::resource('categories', CategoryController::class)->middleware('permission:manage categories');
    Route::resource('tailles', TailleController::class)->middleware('permission:manage units');
    Route::resource('unites', \App\Http\Controllers\UniteController::class)->middleware('permission:manage units');
    Route::resource('boutiques', BoutiqueController::class)->middleware('permission:manage boutiques');
    Route::resource('produits', ProduitController::class)->middleware('permission:manage products');

    // Routes clients explicites AVANT le resource (sinon clients/{client} les intercepte)
    Route::get('clients/par-boutique', [ClientController::class, 'parBoutique'])
        ->name('clients.par-boutique')
        ->middleware('permission:manage sales');
    Route::post('clients/creation-rapide', [ClientController::class, 'storeRapide'])
        ->name('clients.store-rapide')
        ->middleware('permission:manage sales');
    Route::patch('clients/{client}/toggle-status', [ClientController::class, 'toggleStatus'])
        ->name('clients.toggle-status')
        ->middleware('permission:manage sales');
    Route::resource('clients', ClientController::class)->middleware('permission:manage sales');
    Route::resource('ventes', VenteController::class)->middleware('permission:manage sales');
    Route::resource('commandes', CommandeController::class)->middleware('permission:manage sales');
    Route::resource('paiements', PaiementController::class)->except(['edit', 'update'])->middleware('permission:manage payments');
    Route::get('commandes/{commande}/receipt', [\App\Http\Controllers\CommandeReceiptController::class, 'download'])
        ->name('commandes.receipt')
        ->middleware('permission:manage sales');
    Route::resource('employes', EmployeController::class)->middleware('permission:manage users');
    Route::resource('roles', RoleController::class)->middleware('permission:manage roles');
    Route::get('ventes/{vente}/receipt', [VenteController::class, 'receipt'])
        ->name('ventes.receipt')
        ->middleware('permission:manage sales');

    Route::resource('mouvements-stock', MouvementStockController::class)
        ->only(['index', 'create', 'store'])
        ->middleware('permission:manage products');
    Route::get('/rapports', [RapportController::class, 'index'])
        ->name('rapports.index')
        ->middleware('permission:manage reports');

    Route::get('inventaire', [InventaireController::class, 'index'])
        ->name('inventaire.index')
        ->middleware('permission:manage inventory');
    Route::patch('inventaire/{variante}/seuil', [InventaireController::class, 'updateSeuil'])
        ->name('inventaire.seuil')
        ->middleware('permission:manage inventory');

    // Routes POS
    Route::get('/pos', [POSController::class, 'index'])
        ->name('pos.index')
        ->middleware('permission:manage sales');
    Route::post('/pos/store', [POSController::class, 'store'])
        ->name('pos.store')
        ->middleware('permission:manage sales');

    // Routes WhatsApp
    Route::post('/whatsapp/send-catalog', [WhatsAppController::class, 'generateCatalogLink'])
        ->name('whatsapp.send-catalog')
        ->middleware('permission:manage products');
    Route::get('/whatsapp/categories', [WhatsAppController::class, 'getCategories'])
        ->name('whatsapp.categories')
        ->middleware('permission:manage products');
    Route::get('/whatsapp/category-products', [WhatsAppController::class, 'getCategoryProducts'])
        ->name('whatsapp.category-products')
        ->middleware('permission:manage products');
});

require __DIR__.'/settings.php';

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('rapport-journaliers', App\Http\Controllers\RapportJournalierController::class)->only(['index', 'create', 'store', 'show', 'edit', 'update']);
});
