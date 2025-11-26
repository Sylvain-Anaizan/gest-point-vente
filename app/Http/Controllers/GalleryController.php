<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GalleryController extends Controller
{
    /**
     * Display product gallery for a specific category.
     */
    public function showCategory($categorieId)
    {
        $categorie = Categorie::with('produits')->findOrFail($categorieId);

        $products = $categorie->produits->map(function ($produit) {
            return [
                'id' => $produit->id,
                'nom' => $produit->nom,
                'imageUrl' => $produit->imageUrl,
            ];
        });

        return Inertia::render('gallery/category', [
            'categorie' => [
                'id' => $categorie->id,
                'nom' => $categorie->nom,
                'description' => $categorie->description,
            ],
            'products' => $products,
        ]);
    }
}
