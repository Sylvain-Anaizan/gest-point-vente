<?php

namespace App\Http\Controllers;

use App\Http\Requests\SousCategorieStoreRequest;
use App\Http\Requests\SousCategorieUpdateRequest;
use App\Models\Categorie;
use App\Models\SousCategorie;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SousCategorieController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = SousCategorie::query()
            ->with('categorie')
            ->when($request->search, function ($q) use ($request) {
                $q->where('nom', 'like', '%'.$request->search.'%')
                    ->orWhereHas('categorie', function ($q) use ($request) {
                        $q->where('nom', 'like', '%'.$request->search.'%');
                    });
            })
            ->latest();

        return Inertia::render('sous-categories/index', [
            'sousCategories' => $query->paginate(10)
                ->withQueryString()
                ->through(fn ($sousCategorie) => [
                    'id' => $sousCategorie->id,
                    'nom' => $sousCategorie->nom,
                    'categorie' => $sousCategorie->categorie?->nom ?? 'Non classée',
                    'categorie_id' => $sousCategorie->categorie_id,
                ]),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('sous-categories/create', [
            'categories' => Categorie::orderBy('nom')->get(['id', 'nom']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SousCategorieStoreRequest $request): RedirectResponse
    {
        SousCategorie::create($request->validated());

        return to_route('sous-categories.index')->with('success', 'Sous-catégorie créée avec succès.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SousCategorie $sousCategory): Response
    {
        return Inertia::render('sous-categories/edit', [
            'sousCategorie' => [
                'id' => $sousCategory->id,
                'nom' => $sousCategory->nom,
                'categorie_id' => $sousCategory->categorie_id,
            ],
            'categories' => Categorie::orderBy('nom')->get(['id', 'nom']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SousCategorieUpdateRequest $request, SousCategorie $sousCategory): RedirectResponse
    {
        $sousCategory->update($request->validated());

        return to_route('sous-categories.index')->with('success', 'Sous-catégorie mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SousCategorie $sousCategory): RedirectResponse
    {
        Gate::authorize('delete categories');

        $sousCategory->delete();

        return to_route('sous-categories.index')->with('success', 'Sous-catégorie supprimée avec succès.');
    }
}
