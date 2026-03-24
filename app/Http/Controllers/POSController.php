<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\MouvementStock;
use App\Models\Produit;
use App\Models\Variante;
use App\Models\Vente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class POSController extends Controller
{
    /**
     * Affiche l'interface du Point de Vente.
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $queryProduits = Produit::visibles()->with(['category', 'variantes.taille'])
            ->whereHas('variantes', function ($q) {
                $q->where('quantite', '>', 0);
            });

        if ($user->role === 'employé') {
            $queryProduits->where('boutique_id', $user->boutique_id);
        }

        return Inertia::render('pos/index', [
            'produits' => $queryProduits->get()->map(fn ($p) => [
                'id' => $p->id,
                'nom' => $p->nom,
                'imageUrl' => $p->imageUrl,
                'category' => $p->category->nom,
                'boutique_id' => $p->boutique_id,
                'variantes' => $p->variantes->map(fn ($v) => [
                    'id' => $v->id,
                    'taille' => $v->taille ? $v->taille->nom : 'N/A',
                    'prix_vente' => $v->prix_vente,
                    'quantite' => $v->quantite,
                ]),
            ]),
            'clients' => Client::actifs()->get(),
            'tailles' => \App\Models\Taille::all(['id', 'nom']),
            'boutiques' => $user->role === 'admin'
                ? \App\Models\Boutique::all(['id', 'nom'])
                : \App\Models\Boutique::where('id', $user->boutique_id)->get(['id', 'nom']),
        ]);
    }

    /**
     * Enregistre une nouvelle vente.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'nullable|integer|exists:clients,id',
            'panier' => 'required|array|min:1',
            'panier.*.id' => 'required|integer|exists:produits,id', // ID du produit maître (pour UI)
            'panier.*.variante_id' => 'required|integer|exists:variantes,id', // ID réel vendu
            'panier.*.quantite' => 'required|integer|min:1',
            'panier.*.prix_vente' => 'required|numeric|min:0',
            'mode_paiement' => 'required|string|in:espèces,carte,virement,mobile_money',
            'montant_recu' => 'nullable|numeric|min:0|required_if:mode_paiement,espèces',
            'boutique_id' => 'nullable|exists:boutiques,id',
        ]);

        try {
            $vente = DB::transaction(function () use ($validated) {
                $montantTotal = 0;
                $varianteIds = collect($validated['panier'])->pluck('variante_id');

                $variantes = Variante::with('produit')
                    ->lockForUpdate()
                    ->whereIn('id', $varianteIds)
                    ->get()
                    ->keyBy('id');

                foreach ($validated['panier'] as $item) {
                    $variante = $variantes->get($item['variante_id']);

                    if (! $variante) {
                        throw ValidationException::withMessages(['error' => 'Variante non trouvée ou verrouillée.']);
                    }

                    $montantTotal += $item['quantite'] * $item['prix_vente'];

                    if ($variante->quantite < $item['quantite']) {
                        throw ValidationException::withMessages([
                            'panier' => ["Stock insuffisant pour {$variante->produit->nom} (Taille: ".($variante->taille->nom ?? 'N/A')."). Stock actuel : {$variante->quantite}"],
                        ]);
                    }
                }

                /** @var \App\Models\User $user */
                $user = Auth::user();
                $vente = Vente::create([
                    'numero' => 'FAC-'.strtoupper(uniqid()),
                    'client_id' => $validated['client_id'],
                    'user_id' => Auth::id(),
                    'boutique_id' => $user->role === 'employé'
                        ? $user->boutique_id
                        : ($validated['boutique_id'] ?? null),
                    'montant_total' => $montantTotal,
                    'statut' => 'complétée',
                    'mode_paiement' => $validated['mode_paiement'],
                ]);

                foreach ($validated['panier'] as $item) {
                    $variante = $variantes->get($item['variante_id']);

                    $vente->lignes()->create([
                        'produit_id' => $variante->produit_id,
                        'variante_id' => $variante->id,
                        'quantite' => $item['quantite'],
                        'prix_unitaire' => $item['prix_vente'],
                        'sous_total' => $item['quantite'] * $item['prix_vente'],
                    ]);

                    $variante->decrement('quantite', $item['quantite']);

                    MouvementStock::create([
                        'produit_id' => $variante->produit_id,
                        'variante_id' => $variante->id,
                        'boutique_id' => $vente->boutique_id,
                        'user_id' => Auth::id(),
                        'quantite' => -$item['quantite'],
                        'type' => 'vente',
                        'commentaire' => "Vente #{$vente->numero}",
                    ]);
                }

                return $vente;
            });

            return redirect()->route('ventes.show', $vente)->with('success', 'Vente enregistrée avec succès. Numéro: '.$vente->numero);
        } catch (ValidationException $e) {
            // Gère les erreurs de ValidationException (stock insuffisant)
            return back()->withErrors($e->errors());
        } catch (\Throwable $e) {
            // Gère les autres erreurs (connexion DB, etc.)
            return back()->withErrors(['error' => 'Une erreur inattendue est survenue : '.$e->getMessage()]);
        }
    }
}
