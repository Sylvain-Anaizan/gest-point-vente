<?php

namespace App\Http\Controllers;

use App\Models\Vente;
use App\Models\LigneVente;
use App\Models\Produit;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class VenteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $ventes = Vente::with(['client', 'user', 'lignes.produit'])
            ->when($request->search, function ($query) use ($request) {
                $query->where('numero', 'like', '%' . $request->search . '%')
                    ->orWhereHas('client', function ($q) use ($request) {
                        $q->where('nom', 'like', '%' . $request->search . '%')
                            ->orWhere('telephone', 'like', '%' . $request->search . '%');
                    })  ;
            })
            ->when($request->statut, function ($query) use ($request) {
                $query->where('statut', $request->statut);
            })
            ->when($request->date_debut, function ($query) use ($request) {
                $query->whereDate('created_at', '>=', $request->date_debut);
            })
            ->when($request->date_fin, function ($query) use ($request) {
                $query->whereDate('created_at', '<=', $request->date_fin);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(8);

        // S'assurer que les montants sont des nombres valides
        $ventes->getCollection()->transform(function ($vente) {
            // Vérifier et corriger montant_total si nécessaire
            if (!is_numeric($vente->montant_total)) {
                $vente->montant_total = 0;
            } else {
                $vente->montant_total = (float) $vente->montant_total;
            }
            return $vente;
        });

        return Inertia::render('ventes/index', [
            'ventes' => $ventes,
            'filters' => $request->only(['search', 'statut', 'date_debut', 'date_fin'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $clients = Client::select('id', 'nom', 'telephone')->get();
        $produits = Produit::select('id', 'nom', 'prix_vente', 'quantite')
            ->where('quantite', '>', 0)
            ->get();

        return Inertia::render('ventes/create', [
            'clients' => $clients,
            'produits' => $produits
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'lignes' => 'required|array|min:1',
            'lignes.*.produit_id' => 'required|exists:produits,id',
            'lignes.*.quantite' => 'required|integer|min:1',
            'lignes.*.prix_unitaire' => 'required|numeric|min:0',
            'mode_paiement' => 'required|string|in:espèces,carte,virement,mobile_money',
        ]);

        try {
            DB::beginTransaction();

            // Vérifier le stock pour chaque produit
            foreach ($validated['lignes'] as $ligne) {
                $produit = Produit::find($ligne['produit_id']);
                if ($produit->quantite < $ligne['quantite']) {
                    throw new \Exception("Stock insuffisant pour le produit: {$produit->nom}");
                }
            }

            // Calculer le montant total
            $montantTotal = 0;
            foreach ($validated['lignes'] as $ligne) {
                $montantTotal += $ligne['quantite'] * $ligne['prix_unitaire'];
            }

            // Créer la vente
            $vente = Vente::create([
                'numero' => 'V-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'client_id' => $validated['client_id'],
                'user_id' => Auth::id(),
                'montant_total' => $montantTotal,
                'mode_paiement' => $validated['mode_paiement'],
                'statut' => 'complétée'
            ]);

            // Créer les lignes de vente et mettre à jour le stock
            foreach ($validated['lignes'] as $ligne) {
                LigneVente::create([
                    'vente_id' => $vente->id,
                    'produit_id' => $ligne['produit_id'],
                    'quantite' => $ligne['quantite'],
                    'prix_unitaire' => $ligne['prix_unitaire'],
                    'sous_total' => $ligne['quantite'] * $ligne['prix_unitaire']
                ]);

                // Mettre à jour le stock
                $produit = Produit::find($ligne['produit_id']);
                $produit->decrement('quantite', $ligne['quantite']);
            }

            DB::commit();

            return redirect()->route('ventes.show', $vente)->with('success', 'Vente créée avec succès');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Vente $vente)
    {
        $vente->load(['client', 'user', 'lignes.produit']);

        return Inertia::render('ventes/show', [
            'vente' => $vente
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Vente $vente)
    {
        $vente->load(['client', 'lignes.produit']);
        $clients = Client::select('id', 'nom', 'telephone')->get();
        $produits = Produit::select('id', 'nom', 'prix_vente')->get();

        return Inertia::render('ventes/edit', [
            'vente' => $vente,
            'clients' => $clients,
            'produits' => $produits
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Vente $vente)
    {
        $validated = $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'lignes' => 'required|array|min:1',
            'lignes.*.produit_id' => 'required|exists:produits,id',
            'lignes.*.quantite' => 'required|integer|min:1',
            'lignes.*.prix_unitaire' => 'required|numeric|min:0',
            'mode_paiement' => 'required|string|in:espèces,carte,virement,mobile_money',
            'statut' => 'required|string|in:complétée,annulée'
        ]);

        try {
            DB::beginTransaction();

            // Annuler les mouvements de stock précédents si la vente était complétée
            if ($vente->statut === 'complétée' && $validated['statut'] === 'annulée') {
                foreach ($vente->lignes as $ligne) {
                    $ligne->produit->increment('quantite', $ligne->quantite);
                }
            }

            // Restaurer le stock si on passe d'annulée à complétée
            if ($vente->statut === 'annulée' && $validated['statut'] === 'complétée') {
                foreach ($validated['lignes'] as $ligne) {
                    $produit = Produit::find($ligne['produit_id']);
                    if ($produit->quantite < $ligne['quantite']) {
                        throw new \Exception("Stock insuffisant pour le produit: {$produit->nom}");
                    }
                }

                foreach ($validated['lignes'] as $ligne) {
                    $produit = Produit::find($ligne['produit_id']);
                    $produit->decrement('quantite', $ligne['quantite']);
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
                'montant_total' => $montantTotal,
                'mode_paiement' => $validated['mode_paiement'],
                'statut' => $validated['statut']
            ]);

            // Supprimer les anciennes lignes
            $vente->lignes()->delete();

            // Créer les nouvelles lignes
            foreach ($validated['lignes'] as $ligne) {
                LigneVente::create([
                    'vente_id' => $vente->id,
                    'produit_id' => $ligne['produit_id'],
                    'quantite' => $ligne['quantite'],
                    'prix_unitaire' => $ligne['prix_unitaire'],
                    'sous_total' => $ligne['quantite'] * $ligne['prix_unitaire']
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
        try {
            DB::beginTransaction();

            // Restaurer le stock si la vente était complétée
            if ($vente->statut === 'complétée') {
                foreach ($vente->lignes as $ligne) {
                    $ligne->produit->increment('quantite', $ligne->quantite);
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
        $vente->load(['client', 'user', 'lignes.produit']);

        return Inertia::render('ventes/receipt', [
            'vente' => $vente
        ]);
    }
}
