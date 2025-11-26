<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProduitStoreRequest;
use App\Http\Requests\ProduitUpdateRequest;
use App\Models\Categorie;
use App\Models\Produit;
use App\Models\Taille;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProduitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        // dd(Produit::all());
        return Inertia::render('produits/index', [
            'produits' => Produit::query()
                ->with(['category', 'taille'])
                ->latest()
                ->get()
                ->map(fn ($produit) => [
                    'id' => $produit->id,
                    'nom' => $produit->nom,
                    'prix_vente' => $produit->prix_vente,
                    'quantite' => $produit->{'quantite'},
                    'description' => $produit->description,
                    'imageUrl' => $produit->imageUrl,
                    'category' => [
                        'id' => $produit->category->id,
                        'nom' => $produit->category->nom,
                    ],
                    'taille' => $produit->taille ? [
                        'id' => $produit->taille->id,
                        'nom' => $produit->taille->nom,
                    ] : null,
                ]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('produits/create', [
            'categories' => Categorie::query()
                ->orderBy('nom')
                ->get(['id', 'nom']),
            'tailles' => Taille::query()
                ->orderBy('nom')
                ->get(['id', 'nom']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProduitStoreRequest $request): RedirectResponse
    {
        $data = $request->validated(); // on récupère uniquement les vrais champs

        if ($request->hasFile('image')) {

            $image = $request->file('image');

            // Nom unique et propre
            $filename = time().'_'.uniqid().'.'.$image->getClientOriginalExtension();

            // Stockage de l'image
            $image->storeAs('images/produits', $filename, 'public');

            // On stocke uniquement le nom du fichier (PAS le chemin TMP)
            $data['image'] = $filename;
        }

        Produit::create($data);

        return to_route('produits.index')->with('success', 'Produit créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Produit $produit): Response
    {
        $produit->load(['category', 'taille']);

        return Inertia::render('produits/show', [
            'produit' => [
                'id' => $produit->id,
                'nom' => $produit->nom,
                'prix_vente' => $produit->prix_vente,
                'quantite' => $produit->{'quantite'},
                'description' => $produit->description,
                'imageUrl' => $produit->imageUrl,
                'category' => [
                    'id' => $produit->category->id,
                    'nom' => $produit->category->nom,
                ],
                'taille' => $produit->taille ? [
                    'id' => $produit->taille->id,
                    'nom' => $produit->taille->nom,
                ] : null,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Produit $produit): Response
    {
        return Inertia::render('produits/edit', [
            'produit' => [
                'id' => $produit->id,
                'nom' => $produit->nom,
                'prix_vente' => $produit->prix_vente,
                'quantite' => $produit->quantite,
                'description' => $produit->description,
                'imageUrl' => $produit->imageUrl,
                'categorie_id' => $produit->categorie_id,
                'taille_id' => $produit->taille_id,
            ],
            'categories' => Categorie::query()
                ->orderBy('nom')
                ->get(['id', 'nom']),
            'tailles' => Taille::query()
                ->orderBy('nom')
                ->get(['id', 'nom']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProduitUpdateRequest $request, Produit $produit): RedirectResponse
    {
        $data = $request->validated();

        // Gestion de la nouvelle image si uploadée
        if ($request->hasFile('image')) {

            // 🔥 1. Supprimer l’ancienne image si elle existe
            if ($produit->image && Storage::disk('public')->exists('images/produits/'.$produit->image)) {
                Storage::disk('public')->delete('images/produits/'.$produit->image);
            }

            // 🔥 2. Enregistrer la nouvelle image
            $image = $request->file('image');
            $filename = time().'_'.uniqid().'.'.$image->getClientOriginalExtension();
            $image->storeAs('images/produits', $filename, 'public');

            // 🔥 3. Mettre à jour dans la BD
            $data['image'] = $filename;
        }

        $produit->update($data);

        return to_route('produits.index')
            ->with('success', 'Produit mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Produit $produit): RedirectResponse
    {
        // Supprimer l’image si elle existe
        if ($produit->image && Storage::disk('public')->exists('images/produits/'.$produit->image)) {
            Storage::disk('public')->delete('images/produits/'.$produit->image);
        }

        // Supprimer le produit
        $produit->delete();

        return to_route('produits.index')
            ->with('success', 'Produit supprimé avec succès.');
    }
}
