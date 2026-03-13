<?php

namespace App\Http\Controllers;

use App\Models\Variante;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

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
            ->get()
            ->map(function ($variante) {
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
                ];
            });

        return Inertia::render('Inventaire/Index', [
            'variantes' => $variantes,
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
}
