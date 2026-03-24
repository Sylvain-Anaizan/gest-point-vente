<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMouvementStockRequest;
use App\Models\Boutique;
use App\Models\MouvementStock;
use App\Models\Produit;
use App\Models\Variante; // <-- Ajout de l'import
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MouvementStockController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();

        // Admin can filter by boutique, others are scoped automatically by HasBoutique
        $boutiques = $isAdmin
            ? Boutique::orderBy('nom')->get(['id', 'nom'])
            : Boutique::query()->where('id', $user->boutique_id)->get(['id', 'nom']);

        $query = MouvementStock::with(['produit', 'variante', 'boutique', 'user']);

        if ($isAdmin && $request->filled('boutique_id')) {
            $query->where('boutique_id', $request->input('boutique_id'));
        }

        if ($request->filled('search')) {
            $query->whereHas('produit', fn ($q) => $q->where('nom', 'like', "%{$request->search}%"));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('date_debut')) {
            $query->whereDate('created_at', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('created_at', '<=', $request->date_fin);
        }

        return Inertia::render('mouvements/index', [
            'mouvements' => $query->latest()->paginate(20)->withQueryString(),
            'boutiques' => $boutiques,
            'filters' => $request->only(['search', 'type', 'date_debut', 'date_fin', 'boutique_id']),
            'produits' => Produit::orderBy('nom')->get(['id', 'nom']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('mouvements/create', [
            'produits' => Produit::orderBy('nom')->with('variantes.taille')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMouvementStockRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        DB::beginTransaction();

        try {
            // FindOrFail will respect global scope, ensuring user can only find their own products
            $produit = Produit::findOrFail($validated['produit_id']);

            $variante = Variante::where('id', $validated['variante_id'])
                ->where('produit_id', $produit->id)
                ->firstOrFail();

            $mouvement = MouvementStock::create([
                'produit_id' => $produit->id,
                'variante_id' => $variante->id,
                'boutique_id' => $user->boutique_id ?? $produit->boutique_id,
                'user_id' => $user->id,
                'quantite' => $validated['quantite'],
                'type' => $validated['type'],
                'commentaire' => $validated['commentaire'] ?? null,
            ]);

            // Mettre à jour le stock de la variante
            if ($validated['type'] === 'entrée' || ($validated['type'] === 'ajustement' && $validated['quantite'] > 0)) {
                $variante->quantite += $validated['quantite'];
            } else {
                if ($variante->quantite < $validated['quantite']) {
                    DB::rollBack();

                    return back()->with('error', 'Stock insuffisant pour cette opération. Le stock actuel est de '.$variante->quantite);
                }
                $variante->quantite -= $validated['quantite'];
            }

            $variante->save();

            DB::commit();

            return redirect()->route('mouvements-stock.index')
                ->with('success', 'Mouvement de stock enregistré avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();
            if (app()->environment('testing')) {
                throw $e;
            }

            return back()->with('error', 'Une erreur est survenue lors de l\'enregistrement du mouvement de stock.');
        }
    }
}
