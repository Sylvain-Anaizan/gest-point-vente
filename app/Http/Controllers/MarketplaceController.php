<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Category;
use App\Models\Produit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarketplaceController extends Controller
{
    public function index()
    {
        $featuredProducts = Produit::with('category')->latest()->take(8)->get()->map(fn ($p) => [
            'id' => $p->id,
            'nom' => $p->nom,
            'description' => $p->description,
            'imageUrl' => $p->imageUrl,
            'prix_vente' => $p->prixMin,
            'quantite' => $p->totalStock,
            'category' => $p->category->nom ?? null,
        ]);
        $categories = Categorie::has('produits')->take(6)->get();

        return Inertia::render('marketplace/home', [
            'featuredProducts' => $featuredProducts,
            'categories' => $categories,
        ]);
    }

    public function catalog(Request $request)
    {
        $query = Produit::with('category');

        if ($request->has('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->has('search')) {
            $query->where('nom', 'like', '%' . $request->search . '%');
        }

        $products = $query->paginate(12)->through(fn ($p) => [
            'id' => $p->id,
            'nom' => $p->nom,
            'description' => $p->description,
            'imageUrl' => $p->imageUrl,
            'prix_vente' => $p->prixMin,
            'quantite' => $p->totalStock,
            'category' => $p->category->nom ?? null,
        ]);
        $categories = Categorie::has('produits')->get();

        return Inertia::render('marketplace/catalog', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
        ]);
    }
}