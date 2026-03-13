<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdjustStockRequest;
use App\Models\Categorie;
use App\Models\MouvementStock;
use App\Models\Variante;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InventaireController extends Controller
{
    /**
     * Display the inventory listing.
     */
    public function index(): Response
    {
        Gate::authorize('manage inventory');

        $variantes = Variante::query()
            ->with(['produit.category', 'taille'])
            ->whereHas('produit', fn ($q) => $q->where('est_virtuel', false))
            ->get()
            ->map(function ($variante) {
                $tendance = MouvementStock::where('variante_id', $variante->id)
                    ->where('created_at', '>=', now()->subDays(7))
                    ->sum('quantite');

                return [
                    'id' => $variante->id,
                    'produit' => $variante->produit->nom,
                    'categorie' => $variante->produit->category?->nom ?? 'Non classé',
                    'taille' => $variante->taille?->nom ?? 'Unique',
                    'couleur' => $variante->couleur ?? 'N/A',
                    'quantite' => $variante->quantite,
                    'seuil_alerte' => $variante->seuil_alerte,
                    'prix_vente' => $variante->prix_vente,
                    'en_alerte' => $variante->quantite <= $variante->seuil_alerte,
                    'tendance' => $tendance,
                ];
            });

        $categories = Categorie::orderBy('nom')->pluck('nom')->toArray();

        return Inertia::render('Inventaire/Index', [
            'variantes' => $variantes,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the alert threshold for a variant.
     */
    public function updateSeuil(Request $request, Variante $variante): RedirectResponse
    {
        Gate::authorize('manage inventory');

        $validated = $request->validate([
            'seuil_alerte' => 'required|integer|min:0',
        ]);

        $variante->update($validated);

        return back()->with('success', 'Seuil d\'alerte mis à jour avec succès.');
    }

    /**
     * Quick stock adjustment from the inventory page.
     */
    public function adjustStock(AdjustStockRequest $request, Variante $variante): RedirectResponse
    {
        Gate::authorize('manage inventory');

        $validated = $request->validated();

        DB::transaction(function () use ($variante, $validated, $request) {
            $quantite = $validated['quantite'];

            if ($validated['type'] === 'sortie') {
                if ($variante->quantite < $quantite) {
                    abort(422, 'Stock insuffisant. Stock actuel : '.$variante->quantite);
                }
                $variante->decrement('quantite', $quantite);
                $quantite = -$quantite;
            } else {
                $variante->increment('quantite', $quantite);
            }

            MouvementStock::create([
                'produit_id' => $variante->produit_id,
                'variante_id' => $variante->id,
                'user_id' => $request->user()->id,
                'quantite' => $quantite,
                'type' => $validated['type'] === 'entrée' ? 'entrée' : 'sortie',
                'commentaire' => $validated['commentaire'] ?? 'Ajustement rapide depuis l\'inventaire',
            ]);
        });

        return back()->with('success', 'Stock ajusté avec succès.');
    }

    /**
     * Return recent stock movements for a given variant (JSON).
     */
    public function mouvements(Variante $variante): JsonResponse
    {
        Gate::authorize('manage inventory');

        $mouvements = MouvementStock::where('variante_id', $variante->id)
            ->with('user:id,name')
            ->latest()
            ->limit(15)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'quantite' => $m->quantite,
                'type' => $m->type,
                'commentaire' => $m->commentaire,
                'user' => $m->user?->name ?? 'Système',
                'date' => $m->created_at->format('d/m/Y H:i'),
            ]);

        return response()->json($mouvements);
    }

    /**
     * Export inventory as CSV.
     */
    public function export(): StreamedResponse
    {
        Gate::authorize('manage inventory');

        $variantes = Variante::query()
            ->with(['produit.category', 'taille'])
            ->whereHas('produit', fn ($q) => $q->where('est_virtuel', false))
            ->get();

        $filename = 'inventaire_'.now()->format('Y-m-d_His').'.csv';

        return response()->streamDownload(function () use ($variantes) {
            $handle = fopen('php://output', 'w');
            // UTF-8 BOM for Excel compatibility
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'Produit', 'Catégorie', 'Taille', 'Couleur',
                'Quantité', 'Seuil Alerte', 'Prix Vente', 'Statut',
            ], ';');

            foreach ($variantes as $v) {
                fputcsv($handle, [
                    $v->produit->nom,
                    $v->produit->category?->nom ?? 'Non classé',
                    $v->taille?->nom ?? 'Unique',
                    $v->couleur ?? 'N/A',
                    $v->quantite,
                    $v->seuil_alerte,
                    $v->prix_vente,
                    $v->quantite <= $v->seuil_alerte ? 'Alerte' : 'OK',
                ], ';');
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
