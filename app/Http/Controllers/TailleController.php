<?php

namespace App\Http\Controllers;

use App\Http\Requests\TailleStoreRequest;
use App\Http\Requests\TailleUpdateRequest;
use App\Models\Taille;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TailleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        Gate::authorize('admin');

        return Inertia::render('tailles/index', [
            'tailles' => Taille::query()
                ->latest()
                ->get()
                ->map(fn ($taille) => [
                    'id' => $taille->id,
                    'nom' => $taille->nom,
                    'description' => $taille->description,
                    'produits_count' => $taille->produits()->count(),
                ]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('tailles/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TailleStoreRequest $request): RedirectResponse
    {
        Taille::create($request->validated());

        return to_route('tailles.index')->with('success', 'Taille cr??e avec succ?s.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Taille $taille): Response
    {
        return Inertia::render('tailles/show', [
            'taille' => [
                'id' => $taille->id,
                'nom' => $taille->nom,
                'description' => $taille->description,
                'produits' => $taille->produits()->with('category')->get()->map(fn ($produit) => [
                    'id' => $produit->id,
                    'nom' => $produit->nom,
                    'prix_vente' => $produit->prixMin,
                    'quantite' => $produit->totalStock,
                    'imageUrl' => $produit->imageUrl,
                    'category' => $produit->category->nom ?? 'N/A',
                ]),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Taille $taille): Response
    {
        return Inertia::render('tailles/edit', [
            'taille' => [
                'id' => $taille->id,
                'nom' => $taille->nom,
                'description' => $taille->description,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TailleUpdateRequest $request, Taille $taille): RedirectResponse
    {
        $taille->update($request->validated());

        return to_route('tailles.index')->with('success', 'Taille mise ? jour avec succ?s.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Taille $taille): RedirectResponse
    {
        Gate::authorize('delete categories');

        $taille->delete();

        return to_route('tailles.index')->with('success', 'Taille supprim?e avec succ?s.');
    }
}
