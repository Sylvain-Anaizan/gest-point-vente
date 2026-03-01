<?php

namespace App\Http\Controllers;

use App\Models\Unite;
use Illuminate\Http\Request;

class UniteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): \Inertia\Response
    {
        \Illuminate\Support\Facades\Gate::authorize('admin');

        return \Inertia\Inertia::render('unites/index', [
            'unites' => Unite::query()
                ->latest()
                ->get()
                ->map(fn ($unite) => [
                    'id' => $unite->id,
                    'nom' => $unite->nom,
                    'description' => $unite->description,
                    'produits_count' => $unite->produits()->count(),
                ]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): \Inertia\Response
    {
        return \Inertia\Inertia::render('unites/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(\Illuminate\Http\Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:unites',
            'description' => 'nullable|string|max:500',
        ]);

        Unite::create($validated);

        return to_route('unites.index')->with('success', 'Unité de mesure créée avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Unite $unite): \Inertia\Response
    {
        return \Inertia\Inertia::render('unites/show', [
            'unite' => [
                'id' => $unite->id,
                'nom' => $unite->nom,
                'description' => $unite->description,
                'produits' => $unite->produits()->with('category')->get()->map(fn ($produit) => [
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
    public function edit(Unite $unite): \Inertia\Response
    {
        return \Inertia\Inertia::render('unites/edit', [
            'unite' => [
                'id' => $unite->id,
                'nom' => $unite->nom,
                'description' => $unite->description,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(\Illuminate\Http\Request $request, Unite $unite): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:unites,nom,' . $unite->id,
            'description' => 'nullable|string|max:500',
        ]);

        $unite->update($validated);

        return to_route('unites.index')->with('success', 'Unité de mesure mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Unite $unite): \Illuminate\Http\RedirectResponse
    {
        $unite->delete();

        return to_route('unites.index')->with('success', 'Unité de mesure supprimée avec succès.');
    }
}
