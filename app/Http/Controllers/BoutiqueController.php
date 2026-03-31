<?php

namespace App\Http\Controllers;

use App\Http\Requests\BoutiqueStoreRequest;
use App\Http\Requests\BoutiqueUpdateRequest;
use App\Models\Boutique;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BoutiqueController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('admin');

        $query = Boutique::query()
            ->when($request->search, function ($q) use ($request) {
                $q->where('nom', 'like', '%'.$request->search.'%')
                    ->orWhere('adresse', 'like', '%'.$request->search.'%');
            })
            ->withCount('produits')
            ->latest();

        return Inertia::render('boutiques/index', [
            'boutiques' => $query->paginate(10)
                ->withQueryString()
                ->through(fn ($boutique) => [
                    'id' => $boutique->id,
                    'nom' => $boutique->nom,
                    'adresse' => $boutique->adresse,
                    'telephone' => $boutique->telephone,
                    'produits_count' => $boutique->produits_count,
                ]),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('boutiques/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(BoutiqueStoreRequest $request): RedirectResponse
    {
        Boutique::create($request->validated());

        return to_route('boutiques.index')->with('success', 'Boutique créée avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Boutique $boutique): Response
    {
        return Inertia::render('boutiques/show', [
            'boutique' => [
                'id' => $boutique->id,
                'nom' => $boutique->nom,
                'adresse' => $boutique->adresse,
                'telephone' => $boutique->telephone,
                'produits' => $boutique->produits()->with('category')->get()->map(fn ($produit) => [
                    'id' => $produit->id,
                    'nom' => $produit->nom,
                    'prix_vente' => $produit->prixMin,
                    'quantite' => $produit->totalStock,
                    'category' => $produit->category->nom ?? 'N/A',
                    'imageUrl' => $produit->imageUrl,
                ]),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Boutique $boutique): Response
    {
        return Inertia::render('boutiques/edit', [
            'boutique' => [
                'id' => $boutique->id,
                'nom' => $boutique->nom,
                'adresse' => $boutique->adresse,
                'telephone' => $boutique->telephone,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(BoutiqueUpdateRequest $request, Boutique $boutique): RedirectResponse
    {
        $boutique->update($request->validated());

        return to_route('boutiques.index')->with('success', 'Boutique mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Boutique $boutique): RedirectResponse
    {
        Gate::authorize('delete boutiques');

        // On pourrait vouloir empêcher la suppression si des produits sont liés
        $boutique->delete();

        return to_route('boutiques.index')->with('success', 'Boutique supprimée avec succès.');
    }
}
