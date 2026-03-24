<?php

namespace App\Http\Controllers;

use App\Models\Boutique;
use App\Models\Client;
use App\Models\LigneVente;
use App\Models\Produit;
use App\Models\Vente;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VenteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $query = Vente::with(['client', 'user', 'lignes.produit', 'boutique'])
            ->when($request->search, function ($q) use ($request) {
                $q->where('numero', 'like', '%'.$request->search.'%')
                    ->orWhereHas('client', function ($sq) use ($request) {
                        $sq->where('nom', 'like', '%'.$request->search.'%')
                            ->orWhere('telephone', 'like', '%'.$request->search.'%');
                    });
            })
            ->when($request->statut, function ($q) use ($request) {
                $q->where('statut', $request->statut);
            })
            ->when($request->date_debut, function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->date_debut);
            })
            ->when($request->date_fin, function ($q) use ($request) {
                $q->whereDate('created_at', '<=', $request->date_fin);
            });
            // ->forBoutique($user->boutique_id); // Removed due to global scope

        // Calculer les statistiques sur la requête filtrée (AVANT pagination)
        $stats = [
            'total_ventes' => (clone $query)->count(),
            'ventes_completees' => (clone $query)->where('statut', 'complétée')->count(),
            'ventes_annulees' => (clone $query)->where('statut', 'annulée')->count(),
            'total_revenus' => (clone $query)->where('statut', 'complétée')->sum('montant_total'),
        ];

        $ventes = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        // S'assurer que les montants sont des nombres valides
        $ventes->getCollection()->transform(function ($vente) {
            // Vérifier et corriger montant_total si nécessaire
            if (! is_numeric($vente->montant_total)) {
                $vente->montant_total = 0;
            } else {
                $vente->montant_total = (float) $vente->montant_total;
            }

            return $vente;
        });

        return Inertia::render('ventes/index', [
            'ventes' => $ventes,
            'stats' => $stats,
            'filters' => $request->only(['search', 'statut', 'date_debut', 'date_fin']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $clients = Client::orderBy('nom')->get(['id', 'nom', 'telephone']); // forBoutique removed
        $produits = Produit::visibles()
            ->with(['variantes' => function ($query) {
                $query->with('taille');
            }, 'unite'])
            ->whereHas('variantes', function ($query) {
                $query->where('quantite', '>', 0);
            })
            ->get();
            // ->map(fn ($p) => [ // Removed mapping as it's handled by the `with` clause
            //     'id' => $p->id,
            //     'nom' => $p->nom,
            //     'boutique_id' => $p->boutique_id,
            //     'variantes' => $p->variantes->map(fn ($v) => [
            //         'id' => $v->id,
            //         'taille' => $v->taille ? $v->taille->nom : 'N/A',
            //         'prix_vente' => $v->prix_vente,
            //         'quantite' => $v->quantite,
            //     ]),
            // ]);

        return Inertia::render('ventes/create', [
            'clients' => $clients,
            'produits' => $produits,
            'boutiques' => Boutique::get(['id', 'nom']), // forBoutique removed
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $boutiqueId = Auth::user()->boutique_id;

        $validated = $request->validate([
            'client_id' => [
                'nullable',
                Rule::exists('clients', 'id')->where('boutique_id', $boutiqueId),
            ],
            'lignes' => 'required|array|min:1',
            'lignes.*.produit_id' => [
                'required',
                Rule::exists('produits', 'id')->where('boutique_id', $boutiqueId),
            ],
            'lignes.*.variante_id' => 'required|exists:variantes,id',
            'lignes.*.quantite' => 'required|integer|min:1',
            'lignes.*.prix_unitaire' => 'required|numeric|min:0',
            'mode_paiement' => 'required|string|in:espèces,carte,virement,mobile_money',
            // 'boutique_id' => 'nullable|exists:boutiques,id', // Removed as it's handled by global scope or user's boutique_id
        ]);

        try {
            DB::beginTransaction();

            // $boutiqueId = $request->user()->boutique_id; // Already defined
            $isAdmin = $request->user()->isAdmin();

            // Vérifier le stock et l'appartenance à la boutique pour chaque variante
            foreach ($validated['lignes'] as $ligne) {
                $produit = Produit::find($ligne['produit_id']);
                // The global scope should handle boutique_id check for $produit
                if (! $isAdmin && $produit->boutique_id !== $boutiqueId) {
                    throw new \Exception("Le produit '{$produit->nom}' n'appartient pas à votre boutique.");
                }

                // Variante check is now mandatory due to validation rule 'lignes.*.variante_id' => 'required|exists:variantes,id'
                $variante = \App\Models\Variante::find($ligne['variante_id']);
                if (! $variante || $variante->produit_id !== $produit->id) {
                    throw new \Exception("Variante invalide pour le produit: {$produit->nom}");
                }
                if ($variante->quantite < $ligne['quantite']) {
                    throw new \Exception("Stock insuffisant pour le produit: {$produit->nom} (Taille: ".($variante->taille->nom ?? 'N/A').')');
                }
            }

            // Calculer le montant total
            $montantTotal = 0;
            foreach ($validated['lignes'] as $ligne) {
                $montantTotal += $ligne['quantite'] * $ligne['prix_unitaire'];
            }

            // Créer la vente
            /** @var \App\Models\User $user */
            $user = auth()->user();
            $vente = Vente::create([
                'numero' => 'V-'.date('Ymd').'-'.strtoupper(Str::random(4)),
                'client_id' => $validated['client_id'],
                'user_id' => Auth::id(),
                'boutique_id' => $user->role === 'employé'
                    ? $user->boutique_id
                    : ($validated['boutique_id'] ?? $user->boutique_id), // Default to user's boutique if not provided and admin
                'montant_total' => $montantTotal,
                'mode_paiement' => $validated['mode_paiement'],
                'statut' => 'complétée',
            ]);

            // Créer les lignes de vente et mettre à jour le stock
            foreach ($validated['lignes'] as $ligne) {
                $variante_id = $ligne['variante_id']; // variante_id is now required

                LigneVente::create([
                    'vente_id' => $vente->id,
                    'produit_id' => $ligne['produit_id'],
                    'variante_id' => $variante_id,
                    'quantite' => $ligne['quantite'],
                    'prix_unitaire' => $ligne['prix_unitaire'],
                    'sous_total' => $ligne['quantite'] * $ligne['prix_unitaire'],
                ]);

                // Mettre à jour le stock
                $variante = \App\Models\Variante::find($variante_id);
                $variante->decrement('quantite', $ligne['quantite']);
            }

            DB::commit();

            return redirect()->route('ventes.show', $vente)->with('success', 'Vente créée avec succès');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Erreur lors de la création de la vente: '.$e->getMessage(), ['exception' => $e]);
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
    /**
     * Display the specified resource.
     */
    public function show(Vente $vente): Response
    {
        Gate::authorize('view', $vente);
        $vente->load(['client', 'user', 'lignes.produit', 'boutique', 'commande.lignesCommande', 'paiements.user']);

        return Inertia::render('ventes/show', [
            'vente' => $vente,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Vente $vente): Response
    {
        Gate::authorize('update', $vente);

        /** @var \App\Models\User $user */
        $user = auth()->user();

        $vente->load(['client', 'lignes.produit', 'lignes.variante.taille']);
        $clients = Client::orderBy('nom')->get(['id', 'nom', 'telephone']); // forBoutique removed
        $produits = Produit::with(['variantes.taille'])
            ->get();

        $produits = $produits->map(fn ($p) => [
            'id' => $p->id,
            'nom' => $p->nom,
            'boutique_id' => $p->boutique_id,
            'variantes' => $p->variantes->map(fn ($v) => [
                'id' => $v->id,
                'taille' => $v->taille ? $v->taille->nom : 'N/A',
                'prix_vente' => $v->prix_vente,
                'quantite' => $v->quantite,
            ]),
        ]);

        return Inertia::render('ventes/edit', [
            'vente' => $vente,
            'clients' => $clients,
            'produits' => $produits,
            'boutiques' => Boutique::get(['id', 'nom']), // forBoutique removed
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Vente $vente): RedirectResponse
    {
        Gate::authorize('update', $vente);
        $boutiqueId = Auth::user()->boutique_id;

        $validated = $request->validate([
            'client_id' => [
                'nullable',
                Rule::exists('clients', 'id')->where('boutique_id', $boutiqueId),
            ],
            'lignes' => 'required|array|min:1',
            'lignes.*.produit_id' => [
                'required',
                Rule::exists('produits', 'id')->where('boutique_id', $boutiqueId),
            ],
            'lignes.*.variante_id' => 'required|exists:variantes,id',
            'lignes.*.quantite' => 'required|integer|min:1',
            'lignes.*.prix_unitaire' => 'required|numeric|min:0',
            'mode_paiement' => 'required|string|in:espèces,carte,virement,mobile_money',
            'statut' => 'required|string|in:complétée,annulée',
            // 'boutique_id' => 'nullable|exists:boutiques,id', // Removed as it's handled by global scope or user's boutique_id
        ]);

        try {
            DB::beginTransaction();

            // Annuler les mouvements de stock précédents si la vente était complétée
            if ($vente->statut === 'complétée' && $validated['statut'] === 'annulée') {
                foreach ($vente->lignes as $ligne) {
                    if ($ligne->variante_id) {
                        $ligne->variante->increment('quantite', $ligne->quantite);
                    } else {
                        // Ancienne logique : incrémenter le premier disponible (devrait être rare)
                        $ligne->produit->variantes()->first()?->increment('quantite', $ligne->quantite);
                    }
                }
            }

            // Restaurer le stock si on passe d'annulée à complétée
            if ($vente->statut === 'annulée' && $validated['statut'] === 'complétée') {
                foreach ($validated['lignes'] as $ligne) {
                    $variante_id = $ligne['variante_id'] ?? Produit::find($ligne['produit_id'])->variantes()->first()->id;
                    $variante = \App\Models\Variante::find($variante_id);
                    if ($variante->quantite < $ligne['quantite']) {
                        throw new \Exception("Stock insuffisant pour le produit: {$variante->produit->nom} (Taille: ".($variante->taille->nom ?? 'N/A').')');
                    }
                }

                foreach ($validated['lignes'] as $ligne) {
                    $variante_id = $ligne['variante_id'] ?? Produit::find($ligne['produit_id'])->variantes()->first()->id;
                    $variante = \App\Models\Variante::find($variante_id);
                    $variante->decrement('quantite', $ligne['quantite']);
                }
            }

            // Calculer le nouveau montant total
            $montantTotal = 0;
            foreach ($validated['lignes'] as $ligne) {
                $montantTotal += $ligne['quantite'] * $ligne['prix_unitaire'];
            }

            // Mettre à jour la vente
            $vente->update([
                'client_id' => $validated['client_id'],
                'boutique_id' => $validated['boutique_id'] ?? $vente->boutique_id,
                'montant_total' => $montantTotal,
                'mode_paiement' => $validated['mode_paiement'],
                'statut' => $validated['statut'],
            ]);

            // Supprimer les anciennes lignes
            $vente->lignes()->delete();

            // Créer les nouvelles lignes
            foreach ($validated['lignes'] as $ligne) {
                LigneVente::create([
                    'vente_id' => $vente->id,
                    'produit_id' => $ligne['produit_id'],
                    'variante_id' => $ligne['variante_id'] ?? Produit::find($ligne['produit_id'])->variantes()->first()->id,
                    'quantite' => $ligne['quantite'],
                    'prix_unitaire' => $ligne['prix_unitaire'],
                    'sous_total' => $ligne['quantite'] * $ligne['prix_unitaire'],
                ]);
            }

            DB::commit();

            return redirect()->route('ventes.show', $vente)->with('success', 'Vente mise à jour avec succès');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vente $vente)
    {
        Gate::authorize('delete', $vente);
        try {
            DB::beginTransaction();

            // Restaurer le stock si la vente était complétée
            if ($vente->statut === 'complétée') {
                foreach ($vente->lignes as $ligne) {
                    if ($ligne->variante_id) {
                        $ligne->variante->increment('quantite', $ligne->quantite);
                    } else {
                        $ligne->produit->variantes()->first()?->increment('quantite', $ligne->quantite);
                    }
                }
            }

            $vente->delete();

            DB::commit();

            return redirect()->route('ventes.index')->with('success', 'Vente supprimée avec succès');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors(['error' => 'Erreur lors de la suppression de la vente']);
        }
    }

    /**
     * Display the receipt for the specified resource.
     */
    public function receipt(Vente $vente)
    {
        Gate::authorize('view', $vente);
        $vente->load(['client', 'user', 'lignes.produit', 'boutique']);

        return Inertia::render('ventes/receipt', [
            'vente' => $vente,
        ]);
    }
}
