<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryStoreRequest;
use App\Http\Requests\CategoryUpdateRequest;
use App\Models\Categorie;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('admin');

        $query = Categorie::query()
            ->when($request->search, function ($q) use ($request) {
                $q->where('nom', 'like', '%'.$request->search.'%');
            })
            ->latest();

        return Inertia::render('categories/index', [
            'categories' => $query->paginate(10)
                ->withQueryString()
                ->through(fn ($category) => [
                    'id' => $category->id,
                    'nom' => $category->nom,
                    'description' => $category->description,
                    'produits_count' => $category->produits()->count(),
                ]),
            'filters' => $request->only(['search']),
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

        return to_route('categories.index')->with('success', 'Catégorie créée avec succès.');
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

        return to_route('categories.index')->with('success', 'Catégorie mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Categorie $category): RedirectResponse
    {
        Gate::authorize('delete categories');

        $category->delete();

        return to_route('categories.index')->with('success', 'Catégorie supprimée avec succès.');
    }
}
