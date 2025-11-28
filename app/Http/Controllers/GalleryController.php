<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Inertia\Inertia;

class GalleryController extends Controller
{
    /**
     * Display main gallery with all categories and products.
     */
    public function index()
    {
        $categories = Categorie::with('produits')->get();

        $categoriesData = $categories->map(function ($categorie) {
            return [
                'id' => $categorie->id,
                'nom' => $categorie->nom,
                'description' => $categorie->description,
                'productsCount' => $categorie->produits->count(),
            ];
        });

        $allProducts = $categories->flatMap(function ($categorie) {
            return $categorie->produits->map(function ($produit) use ($categorie) {
                return [
                    'id' => $produit->id,
                    'nom' => $produit->nom,
                    'imageUrl' => $produit->imageUrl,
                    'categorieId' => $categorie->id,
                    'categorieNom' => $categorie->nom,
                ];
            });
        });

        return Inertia::render('gallery/index', [
            'categories' => $categoriesData,
            'products' => $allProducts,
        ]);
    }

    /**
     * Display product gallery for a specific category.
     */
    public function showCategory($categorieId)
    {
        $categorie = Categorie::with(['produits.taille'])->findOrFail($categorieId);

        $products = $categorie->produits->map(function ($produit) {
            return [
                'id' => $produit->id,
                'nom' => $produit->nom,
                'imageUrl' => $produit->imageUrl,
                'taille' => $produit->taille ? [
                    'id' => $produit->taille->id,
                    'nom' => $produit->taille->nom,
                ] : null,
            ];
        });

        // Get unique sizes available in this category
        $availableSizes = $categorie->produits
            ->filter(fn ($produit) => $produit->taille !== null)
            ->map(fn ($produit) => [
                'id' => $produit->taille->id,
                'nom' => $produit->taille->nom,
            ])
            ->unique('id')
            ->values();

        return Inertia::render('gallery/category', [
            'categorie' => [
                'id' => $categorie->id,
                'nom' => $categorie->nom,
                'description' => $categorie->description,
            ],
            'products' => $products,
            'availableSizes' => $availableSizes,
        ]);
    }
}
