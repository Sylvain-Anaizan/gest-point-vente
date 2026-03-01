<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMouvementStockRequest;
use App\Models\MouvementStock;
use App\Models\Produit;
use App\Models\Variante;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class MouvementStockController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = MouvementStock::with(['produit', 'variante.taille', 'user'])
            ->latest();

        // Filtre par recherche (produit)
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('produit', function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%");
            });
        }

        // Filtre par type
        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filtre par dates
        if ($request->filled('date_debut')) {
            $query->whereDate('created_at', '>=', $request->input('date_debut'));
        }
        if ($request->filled('date_fin')) {
            $query->whereDate('created_at', '<=', $request->input('date_fin'));
        }

        $mouvements = $query->paginate(15)->withQueryString();

        return Inertia::render('mouvements/index', [
            'mouvements' => $mouvements,
            'filters' => $request->only(['search', 'type', 'date_debut', 'date_fin']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $produits = Produit::with(['variantes.taille'])->orderBy('nom')->get();

        return Inertia::render('mouvements/create', [
            'produits' => $produits,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMouvementStockRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        
        DB::beginTransaction();
        
        try {
            $mouvement = MouvementStock::create([
                'produit_id' => $validated['produit_id'],
                'variante_id' => $validated['variante_id'],
                'user_id' => $request->user()->id,
                'quantite' => $validated['quantite'],
                'type' => $validated['type'],
                'commentaire' => $validated['commentaire'] ?? null,
            ]);

            // Mettre à jour le stock de la variante
            $variante = Variante::findOrFail($validated['variante_id']);
            
            if ($validated['type'] === 'entrée' || $validated['type'] === 'ajustement' && $validated['quantite'] > 0) {
                // Pour l'entrée, on ajoute la quantité
                $variante->quantite += $validated['quantite'];
            } else {
                // Pour sortie, perte, on vérifie d'abord que le stock est suffisant
                if ($variante->quantite < $validated['quantite']) {
                    DB::rollBack();
                    return back()->with('error', 'Stock insuffisant pour cette opération. Le stock actuel est de ' . $variante->quantite);
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
