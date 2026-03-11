<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProduitStoreRequest;
use App\Http\Requests\ProduitUpdateRequest;
use App\Models\Boutique;
use App\Models\Categorie;
use App\Models\Produit;
use App\Models\Taille;
use App\Models\Unite;
use App\Models\Variante;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProduitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $query = Produit::visibles()
            ->with(['category', 'boutique', 'variantes.taille'])
            ->when($request->search, function ($q) use ($request) {
                $q->where('nom', 'like', '%'.$request->search.'%')
                    ->orWhereHas('category', function ($sq) use ($request) {
                        $sq->where('nom', 'like', '%'.$request->search.'%');
                    });
            })
            ->when($request->boutique_id, function ($q) use ($request) {
                $q->where('boutique_id', $request->boutique_id);
            })
            ->when($user->role === 'employé', function ($q) use ($user) {
                $q->where('boutique_id', $user->boutique_id);
            });

        // Statistiques globales (AVANT pagination)
        $stats = [
            'total_produits' => (clone $query)->count(),
            'low_stock' => (clone $query)->whereHas('variantes', function ($q) {
                $q->where('quantite', '<', 10);
            }, '>', 0)->count(), // Simplifié pour le compte global des produits avec au moins une variante basse
            'total_value' => (clone $query)->get()->reduce(fn ($acc, $p) => $acc + ($p->prixMin * $p->totalStock), 0),
        ];

        return Inertia::render('produits/index', [
            'produits' => $query->latest()
                ->paginate(12)
                ->withQueryString()
                ->through(fn ($produit) => [
                    'id' => $produit->id,
                    'nom' => $produit->nom,
                    'totalStock' => $produit->totalStock,
                    'prixMin' => $produit->prixMin,
                    'prixMax' => $produit->prixMax,
                    'description' => $produit->description,
                    'imageUrl' => $produit->imageUrl,
                    'category' => [
                        'id' => $produit->category->id,
                        'nom' => $produit->category->nom,
                    ],
                    'variantes' => $produit->variantes->map(fn ($v) => [
                        'id' => $v->id,
                        'taille' => $v->taille ? $v->taille->nom : 'N/A',
                        'prix' => $v->prix_vente,
                        'stock' => $v->quantite,
                    ]),
                    'boutique' => $produit->boutique ? [
                        'id' => $produit->boutique->id,
                        'nom' => $produit->boutique->nom,
                    ] : null,
                ]),
            'stats' => $stats,
            'filters' => $request->only(['search', 'boutique_id']),
            'boutiques' => $user->isAdmin()
                ? Boutique::all(['id', 'nom'])
                : Boutique::where('id', $user->boutique_id)->get(['id', 'nom']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $user = auth()->user();

        return Inertia::render('produits/create', [
            'categories' => Categorie::query()
                ->orderBy('nom')
                ->get(['id', 'nom']),
            'tailles' => Taille::query()
                ->orderBy('nom')
                ->get(['id', 'nom']),
            'unites' => Unite::query()
                ->orderBy('nom')
                ->get(['id', 'nom']),
            'boutiques' => $user->isAdmin()
                ? Boutique::query()->orderBy('nom')->get(['id', 'nom'])
                : Boutique::where('id', $user->boutique_id)->get(['id', 'nom']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProduitStoreRequest $request): RedirectResponse
    {
        $user = auth()->user();
        $data = $request->validated();
        $variantesData = $data['variantes'];
        unset($data['variantes']);

        if ($user->isEmploye()) {
            $data['boutique_id'] = $user->boutique_id;
        }

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time().'_'.uniqid().'.'.$image->getClientOriginalExtension();
            $image->storeAs('images/produits', $filename, 'public');
            $data['image'] = $filename;
        }

        DB::transaction(function () use ($data, $variantesData) {
            $produit = Produit::create($data);
            foreach ($variantesData as $vData) {
                $produit->variantes()->create($vData);
            }
        });

        return to_route('produits.index')->with('success', 'Produit créé avec succès avec ses variantes.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Produit $produit): Response
    {
        Gate::authorize('view', $produit);
        $produit->load(['category', 'variantes.taille', 'boutique', 'unite']);

        return Inertia::render('produits/show', [
            'produit' => [
                'id' => $produit->id,
                'nom' => $produit->nom,
                'totalStock' => $produit->totalStock,
                'prixMin' => $produit->prixMin,
                'prixMax' => $produit->prixMax,
                'description' => $produit->description,
                'imageUrl' => $produit->imageUrl,
                'category' => [
                    'id' => $produit->category->id,
                    'nom' => $produit->category->nom,
                ],
                'variantes' => $produit->variantes->map(fn ($v) => [
                    'id' => $v->id,
                    'taille' => $v->taille ? $v->taille->nom : 'N/A',
                    'prix' => $v->prix_vente,
                    'stock' => $v->quantite,
                ]),
                'boutique' => $produit->boutique ? [
                    'id' => $produit->boutique->id,
                    'nom' => $produit->boutique->nom,
                ] : null,
                'unite' => $produit->unite ? [
                    'id' => $produit->unite->id,
                    'nom' => $produit->unite->nom,
                ] : null,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Produit $produit): Response
    {
        Gate::authorize('update', $produit);
        $user = auth()->user();
        $produit->load('variantes');

        return Inertia::render('produits/edit', [
            'produit' => [
                'id' => $produit->id,
                'nom' => $produit->nom,
                'description' => $produit->description,
                'imageUrl' => $produit->imageUrl,
                'categorie_id' => $produit->categorie_id,
                'boutique_id' => $produit->boutique_id,
                'unite_id' => $produit->unite_id,
                'variantes' => $produit->variantes->map(fn ($v) => [
                    'id' => $v->id,
                    'taille_id' => $v->taille_id,
                    'prix_vente' => $v->prix_vente,
                    'quantite' => $v->quantite,
                ]),
            ],
            'categories' => Categorie::query()
                ->orderBy('nom')
                ->get(['id', 'nom']),
            'tailles' => Taille::query()
                ->orderBy('nom')
                ->get(['id', 'nom']),
            'unites' => Unite::query()
                ->orderBy('nom')
                ->get(['id', 'nom']),
            'boutiques' => $user->isAdmin()
                ? Boutique::query()->orderBy('nom')->get(['id', 'nom'])
                : Boutique::where('id', $user->boutique_id)->get(['id', 'nom']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProduitUpdateRequest $request, Produit $produit): RedirectResponse
    {
        Gate::authorize('update', $produit);
        $user = auth()->user();
        $data = $request->validated();
        $variantesData = $data['variantes'];
        unset($data['variantes']);

        if ($user->isEmploye()) {
            $data['boutique_id'] = $user->boutique_id;
        }

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time().'_'.uniqid().'.'.$image->getClientOriginalExtension();
            if ($produit->image && Storage::disk('public')->exists('images/produits/'.$produit->image)) {
                Storage::disk('public')->delete('images/produits/'.$produit->image);
            }
            $image->storeAs('images/produits', $filename, 'public');
            $data['image'] = $filename;
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($produit, $data, $variantesData) {
            $produit->update($data);

            $existingIds = $produit->variantes->pluck('id')->toArray();
            $newIds = collect($variantesData)->pluck('id')->filter()->toArray();

            // Variantes à supprimer
            $toDelete = array_diff($existingIds, $newIds);
            Variante::whereIn('id', $toDelete)->delete();

            // Variantes à mettre à jour ou créer
            foreach ($variantesData as $vData) {
                if (isset($vData['id']) && in_array($vData['id'], $existingIds)) {
                    Variante::where('id', $vData['id'])->update($vData);
                } else {
                    unset($vData['id']);
                    $produit->variantes()->create($vData);
                }
            }
        });

        return to_route('produits.index')
            ->with('success', 'Produit et variantes mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Produit $produit): RedirectResponse
    {
        Gate::authorize('delete', $produit);
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
