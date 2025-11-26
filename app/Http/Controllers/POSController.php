<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\MouvementStock;
use App\Models\Produit;
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
        return Inertia::render('pos/index', [
            'produits' => Produit::with(['category', 'taille'])
                ->where('quantite', '>', 0) // On affiche que les produits en stock par défaut
                ->get(),
            'clients' => Client::actifs()->get(),
        ]);
    }

    /**
     * Enregistre une nouvelle vente.
     */

    public function store(Request $request)
    {
        //dd($request->all());
        // 1. Validation renforcée
        $validated = $request->validate([
            'client_id' => 'nullable|integer|exists:clients,id',
            'panier' => 'required|array|min:1',
            'panier.*.id' => 'required|integer|exists:produits,id',
            'panier.*.quantite' => 'required|integer|min:1',
            // Valider le prix unitaire doit être basé sur le prix réel du produit, non pas celui envoyé par le client
            'panier.*.prix_vente' => 'required|numeric|min:0',
            'mode_paiement' => 'required|string|in:espèces,carte,virement,mobile_money',
            // Assurez-vous que le montant reçu est requis si c'est 'espèces'
            'montant_recu' => 'nullable|numeric|min:0|required_if:mode_paiement,espèces',
        ]);

        try {
            $vente = DB::transaction(function () use ($validated) {
                $montantTotal = 0;
                $produitIds = collect($validated['panier'])->pluck('id');

                // Verrouiller TOUS les produits en une seule fois
                $produits = Produit::lockForUpdate()->whereIn('id', $produitIds)->get()->keyBy('id');

                // 1. Calculer le total et vérifier les stocks
                foreach ($validated['panier'] as $item) {
                    $produit = $produits->get($item['id']);

                    if (!$produit) {
                        throw ValidationException::withMessages(['error' => "Produit ID {$item['id']} non trouvé ou verrouillé."]);
                    }

                    // *** VÉRIFICATION CRITIQUE: Le prix de vente correspond-il au prix actuel ? ***
                    // Si vous n'avez pas de gestion des remises complexes, assurez-vous que le prix est celui en base.
                    // Ici, on utilise le prix envoyé par le frontend (utile pour remises/promos ponctuelles)

                    $montantTotal += $item['quantite'] * $item['prix_vente'];

                    // Vérification stock
                    if ($produit->quantite < $item['quantite']) {
                        // Lancer une exception de validation pour un meilleur message d'erreur
                        throw ValidationException::withMessages([
                            'panier' => ["Stock insuffisant pour le produit : {$produit->nom}. Stock actuel : {$produit->quantite}"]
                        ]);
                    }
                }

                // 2. Création de la Vente
                $vente = Vente::create([
                    'numero' => 'FAC-' . strtoupper(uniqid()),
                    'client_id' => $validated['client_id'],
                    'user_id' => Auth::id(),
                    'montant_total' => $montantTotal,
                    'statut' => 'complétée',
                    'mode_paiement' => $validated['mode_paiement'],
                    // Ajoutez ici les autres champs pertinents comme 'montant_recu' si vous l'ajoutez au modèle Vente
                ]);

                // 3. Traitement des lignes et du stock
                foreach ($validated['panier'] as $item) {
                    $produit = $produits->get($item['id']);

                    // Création ligne de vente
                    $vente->lignes()->create([
                        'produit_id' => $produit->id,
                        'quantite' => $item['quantite'],
                        'prix_unitaire' => $item['prix_vente'],
                        'sous_total' => $item['quantite'] * $item['prix_vente'],
                    ]);

                    // Décrémentation du stock
                    $produit->decrement('quantite', $item['quantite']);

                    // Historisation du mouvement
                    MouvementStock::create([
                        'produit_id' => $produit->id,
                        'user_id' => Auth::id(),
                        'quantite' => -$item['quantite'], // Négatif car sortie
                        'type' => 'vente',
                        'commentaire' => "Vente #{$vente->numero}",
                    ]);
                }

                // 4. Paiement (Si nécessaire, enregistrez le montant reçu et la monnaie rendue)
                if ($validated['mode_paiement'] === 'espèces' && $validated['montant_recu']) {
                    $montantRendu = $validated['montant_recu'] - $montantTotal;

                    // Idéalement, créer ici un enregistrement de Paiement ou mettre à jour la vente
                    // $vente->paiements()->create([...]);
                }

                return $vente;
            });

            return redirect()->route('ventes.show', $vente)->with('success', 'Vente enregistrée avec succès. Numéro: ' . $vente->numero);
        } catch (ValidationException $e) {
            // Gère les erreurs de ValidationException (stock insuffisant)
            return back()->withErrors($e->errors());
        } catch (\Throwable $e) {
            // Gère les autres erreurs (connexion DB, etc.)
            return back()->withErrors(['error' => "Une erreur inattendue est survenue : " . $e->getMessage()]);
        }
    }
}
