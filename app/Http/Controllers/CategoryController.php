<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryStoreRequest;
use App\Http\Requests\CategoryUpdateRequest;
use App\Models\Categorie;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        Gate::authorize('admin');

        return Inertia::render('categories/index', [
            'categories' => Categorie::query()
                ->latest()
                ->get()
                ->map(fn ($category) => [
                    'id' => $category->id,
                    'nom' => $category->nom,
                    'description' => $category->description,
                    'produits_count' => $category->produits()->count(),
                ]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('categories/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CategoryStoreRequest $request): RedirectResponse
    {
        Categorie::create($request->validated());

        return to_route('categories.index')->with('success', 'Cat?gorie cr??e avec succ?s.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Categorie $category): Response
    {
        return Inertia::render('categories/show', [
            'category' => [
                'id' => $category->id,
                'nom' => $category->nom,
                'description' => $category->description,
                'produits' => $category->produits()->with('category')->get()->map(fn ($produit) => [
                    'id' => $produit->id,
                    'nom' => $produit->nom,
                    'prix_vente' => $produit->prixMin,
                    'quantite' => $produit->totalStock,
                    'category' => $produit->category->nom,
                    'imageUrl' => $produit->imageUrl,
                ]),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Categorie $category): Response
    {
        return Inertia::render('categories/edit', [
            'category' => [
                'id' => $category->id,
                'nom' => $category->nom,
                'description' => $category->description,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CategoryUpdateRequest $request, Categorie $category): RedirectResponse
    {
        $category->update($request->validated());

        return to_route('categories.index')->with('success', 'Cat?gorie mise ? jour avec succ?s.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Categorie $category): RedirectResponse
    {
        $category->delete();

        return to_route('categories.index')->with('success', 'Cat?gorie supprim?e avec succ?s.');
    }
}
