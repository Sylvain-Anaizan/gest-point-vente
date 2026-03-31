<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommandeRequest;
use App\Http\Requests\UpdateCommandeRequest;
use App\Models\Boutique;
use App\Models\Categorie;
use App\Models\Client;
use App\Models\Commande;
use App\Models\Produit;
use App\Models\Vente;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CommandeController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $boutiqueId = $user->boutique_id;

        $commandesQuery = Commande::query()
            ->when(! $user->isAdmin(), function ($query) use ($boutiqueId) {
                return $query->where(['boutique_id' => $boutiqueId]);
            })
            ->when(request('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('numero', 'like', "%{$search}%")
                        ->orWhere('nom_client', 'like', "%{$search}%")
                        ->orWhere('telephone_client', 'like', "%{$search}%")
                        ->orWhere('adresse_destination', 'like', "%{$search}%")
                        ->orWhereHas('client', function ($q) use ($search) {
                            $q->where('nom', 'like', "%{$search}%")
                                ->orWhere('telephone', 'like', "%{$search}%");
                        });
                });
            })
            ->when(request('statut'), function ($query, $statut) {
                if ($statut !== 'all') {
                    $query->where('statut', $statut);
                }
            })
            ->with(['client', 'boutique']) // Combined all 'with' clauses
            ->latest();

        return Inertia::render('Commandes/Index', [ // Kept original casing for folder name
            'commandes' => $commandesQuery->paginate(12)->withQueryString(),
            'filters' => request()->all(['search', 'statut']), // Kept filters for UI
        ]);
    }

    public function create(): Response
    {
        $user = auth()->user();
        $boutiqueId = $user->boutique_id; // Get user's boutique ID
        $isAdmin = $user->isAdmin();

        $boutiques = ($isAdmin || ! $boutiqueId)
            ? Boutique::all(['id', 'nom'])
            : [];

        // Filter products by boutique if not admin
        $produitsQuery = Produit::with(['variantes.taille']);
        if (! $isAdmin && $boutiqueId) {
            $produitsQuery->where('boutique_id', $boutiqueId);
        }

        return Inertia::render('Commandes/Create', [
            'clients' => Client::actifs()->get(['id', 'nom', 'telephone']),
            'boutiques' => $boutiques,
            'produits' => $produitsQuery->get()->map(fn ($p) => [ // Use filtered products
                'id' => $p->id,
                'nom' => $p->nom,
                'variantes' => $p->variantes->map(fn ($v) => [
                    'id' => $v->id,
                    'taille' => $v->taille ? $v->taille->nom : 'N/A',
                    'prix_vente' => $v->prix_vente,
                    'quantite' => $v->quantite,
                ]),
            ]),
        ]);
    }

    public function store(StoreCommandeRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $user = auth()->user();

        $data['numero'] = 'CMD-'.strtoupper(Str::random(8));

        // Priorité : boutique demandée (si admin) > boutique de l'utilisateur > première boutique (si admin)
        if ($user->isAdmin() && isset($data['boutique_id'])) {
            $boutiqueId = $data['boutique_id'];
        } else {
            $boutiqueId = $user->boutique_id;
        }

        // Fallback pour les admins sans boutique assignée
        if (! $boutiqueId && $user->isAdmin()) {
            $boutiqueId = Boutique::first()?->id;
        }

        if (! $boutiqueId) {
            return back()->with('error', 'Vous devez appartenir à une boutique pour créer une commande.');
        }

        $data['boutique_id'] = $boutiqueId;

        DB::transaction(function () use ($data, $user, $boutiqueId) { // Added $user and $boutiqueId to use clause
            // Ensure products belong to the user's boutique (if not admin)
            if (! $user->isAdmin()) {
                foreach ($data['lignes_commande'] as $ligne) {
                    $produit = Produit::find($ligne['produit_id']);
                    if (! $produit || $produit->boutique_id !== $boutiqueId) {
                        // This should ideally be caught by validation, but as a safeguard
                        throw new \Exception('Un produit sélectionné n\'appartient pas à votre boutique.');
                    }
                }
            }

            $commande = Commande::create(collect($data)->except('lignes_commande')->toArray());
            foreach ($data['lignes_commande'] as $ligne) {
                $commande->lignesCommande()->create($ligne);
            }
        });

        return redirect()->route('commandes.index')
            ->with('success', 'Commande créée avec succès.');
    }

    public function show(Request $request, Commande $commande): Response // Added Request parameter
    {
        $boutiqueId = $request->user()->boutique_id;
        $isAdmin = $request->user()->isAdmin();

        if (! $isAdmin && $commande->boutique_id !== $boutiqueId) {
            abort(403);
        }
        $commande->load(['client', 'lignesCommande', 'boutique', 'paiements.user']); // Original relations
        $commande->load(['lignesCommande.produit', 'lignesCommande.variante']); // Added new relations from edit, adjusted to match existing model relations

        return Inertia::render('Commandes/Show', [ // Kept original casing for folder name
            'commande' => $commande,
        ]);
    }

    public function edit(Request $request, Commande $commande): Response
    {
        $this->authorizeBoutique($commande); // Keep existing authorization
        $commande->load('lignesCommande');

        $user = $request->user();
        $boutiqueId = $user->boutique_id; // Get user's boutique ID
        $isAdmin = $user->isAdmin();

        $boutiques = ($isAdmin || ! $boutiqueId)
            ? Boutique::all(['id', 'nom'])
            : [];

        // Filter products by boutique if not admin
        $produitsQuery = Produit::with(['variantes.taille']);
        if (! $isAdmin && $boutiqueId) {
            $produitsQuery->where('boutique_id', $boutiqueId);
        }

        return Inertia::render('Commandes/Edit', [
            'commande' => $commande,
            'clients' => Client::actifs()->get(['id', 'nom', 'telephone']),
            'boutiques' => $boutiques,
            'produits' => $produitsQuery->get()->map(fn ($p) => [ // Use filtered products
                'id' => $p->id,
                'nom' => $p->nom,
                'variantes' => $p->variantes->map(fn ($v) => [
                    'id' => $v->id,
                    'taille' => $v->taille ? $v->taille->nom : 'N/A',
                    'prix_vente' => $v->prix_vente,
                    'quantite' => $v->quantite,
                ]),
            ]),
        ]);
    }

    public function update(UpdateCommandeRequest $request, Commande $commande): RedirectResponse
    {
        $this->authorizeBoutique($commande);

        $oldStatut = $commande->statut; // Define $oldStatut before updating the model.

        $data = $request->validated();

        DB::transaction(function () use ($commande, $data, $oldStatut, $request) {
            // The $oldStatut inside this closure would be the status *before* the transaction started,
            // but the one defined outside is the true original status of the model instance.
            // We keep the one outside for the final redirect logic.
            $commande->update(collect($data)->except('lignes_commande')->toArray());

            if (isset($data['lignes_commande'])) {
                $commande->lignesCommande()->delete();
                foreach ($data['lignes_commande'] as $ligne) {
                    $commande->lignesCommande()->create($ligne);
                }
            }

            // Logic to create a Vente if status changed to 'livrée'
            if ($oldStatut !== 'livrée' && $commande->statut === 'livrée') {
                // 1. Ensure generic product exists
                $categorie = Categorie::firstOrCreate(['nom' => 'Commandes'], ['description' => 'Catégorie par défaut pour les articles de commande']);
                $produitGenerique = Produit::firstOrCreate(
                    ['nom' => 'Article Commande', 'boutique_id' => $commande->boutique_id],
                    [
                        'categorie_id' => $categorie->id,
                        'description' => 'Produit générique pour les lignes de commande non reliées au catalogue',
                        'est_virtuel' => true,
                    ]
                );

                // Ensure it has at least one variant if needed? LigneVente seems to point to variant.
                // Let's create a default variant for this generic product
                $variante = $produitGenerique->variantes()->firstOrCreate(
                    ['produit_id' => $produitGenerique->id],
                    [
                        'prix_vente' => 0,
                        'quantite' => 1000000, // Large stock for generic
                    ]
                );

                // 2. Create Vente
                $vente = Vente::create([
                    'numero' => 'FAC-'.strtoupper(uniqid()),
                    'client_id' => $commande->client_id,
                    'commande_id' => $commande->id,
                    'user_id' => auth()->id(),
                    'boutique_id' => $commande->boutique_id,
                    'montant_total' => $commande->montant_total,
                    'statut' => 'complétée',
                    'mode_paiement' => $request->input('mode_paiement', 'espèces'),
                    'type' => 'commande',
                ]);

                // 3. Create LigneVente for each LigneCommande
                foreach ($commande->lignesCommande as $ligneCmd) {
                    $produitId = $ligneCmd->produit_id ?? $produitGenerique->id;
                    $varianteId = $ligneCmd->variante_id ?? $variante->id;

                    $vente->lignes()->create([
                        'produit_id' => $produitId,
                        'variante_id' => $varianteId,
                        'designation_originale' => $ligneCmd->nom,
                        'quantite' => $ligneCmd->quantite,
                        'prix_unitaire' => $ligneCmd->prix,
                        'sous_total' => $ligneCmd->quantite * $ligneCmd->prix,
                    ]);

                    // Add movement stock
                    \App\Models\MouvementStock::create([
                        'produit_id' => $produitId,
                        'variante_id' => $varianteId,
                        'boutique_id' => $commande->boutique_id,
                        'user_id' => auth()->id(),
                        'quantite' => -$ligneCmd->quantite,
                        'type' => 'vente',
                        'commentaire' => "Livraison commande #{$commande->numero}",
                    ]);

                    // Update product stock if not generic
                    if ($ligneCmd->variante_id) {
                        $ligneCmd->variante->decrement('quantite', $ligneCmd->quantite);
                    }
                }
            }
        });

        if ($commande->statut === 'livrée' && $oldStatut !== 'livrée') {
            return redirect()->route('commandes.show', $commande)
                ->with('success', 'Commande livrée avec succès ! Elle a été transformée en vente et intégrée aux revenus.');
        }

        return redirect()->route('commandes.show', $commande)
            ->with('success', 'Commande mise à jour avec succès.');
    }

    public function destroy(Commande $commande): RedirectResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('delete sales');

        $this->authorizeBoutique($commande);
        $commande->delete();

        return redirect()->route('commandes.index')
            ->with('success', 'Commande supprimée avec succès.');
    }

    protected function authorizeBoutique(Commande $commande): void
    {
        $user = auth()->user();
        if (! $user->isAdmin() && $commande->boutique_id !== $user->boutique_id) {
            abort(403);
        }
    }
}
