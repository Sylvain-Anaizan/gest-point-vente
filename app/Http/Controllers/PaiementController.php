<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaiementRequest;
use App\Models\Boutique;
use App\Models\Commande;
use App\Models\Paiement;
use App\Models\Vente;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaiementController extends Controller
{
    public function index(): Response
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $boutiqueId = $user->boutique_id;

        $paiements = Paiement::query()
            ->when(! $user->isAdmin(), fn ($query) => $query->where('boutique_id', $boutiqueId))
            ->when(request('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('reference', 'like', "%{$search}%")
                        ->orWhereHas('vente', function ($q) use ($search) {
                            $q->where('numero', 'like', "%{$search}%");
                        })
                        ->orWhereHas('commande', function ($q) use ($search) {
                            $q->where('numero', 'like', "%{$search}%");
                        });
                });
            })
            ->when(request('mode'), function ($query, $mode) {
                if ($mode !== 'all') {
                    $query->where('mode_paiement', $mode);
                }
            })
            ->with(['vente', 'commande', 'user', 'boutique'])
            ->latest('date_paiement')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Paiements/Index', [
            'paiements' => $paiements,
            'filters' => request()->all(['search', 'mode']),
        ]);
    }

    public function create(): Response
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $boutiqueId = $user->boutique_id;

        $ventes = Vente::query()
            ->when(! $user->isAdmin(), fn ($q) => $q->where('boutique_id', $boutiqueId))
            ->latest()
            ->limit(50)
            ->get(['id', 'numero', 'montant_total', 'client_id']);

        $commandes = Commande::query()
            ->when(! $user->isAdmin(), fn ($q) => $q->where('boutique_id', $boutiqueId))
            ->latest()
            ->limit(50)
            ->get(['id', 'numero', 'montant_total', 'client_id']);

        $boutiques = ($user->isAdmin() || ! $user->boutique_id)
            ? Boutique::all(['id', 'nom'])
            : [];

        return Inertia::render('Paiements/Create', [
            'ventes' => $ventes,
            'commandes' => $commandes,
            'boutiques' => $boutiques,
            'preselectedVenteId' => request('vente_id'),
            'preselectedCommandeId' => request('commande_id'),
        ]);
    }

    public function store(StorePaiementRequest $request): RedirectResponse
    {
        $data = $request->validated();
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $data['user_id'] = $user->id;

        if ($user->isAdmin() && isset($data['boutique_id'])) {
            // Keep the submitted boutique_id
        } else {
            $data['boutique_id'] = $user->boutique_id;
        }

        if (! isset($data['boutique_id']) || ! $data['boutique_id']) {
            // Fall back: get boutique from linked vente or commande
            if (isset($data['vente_id'])) {
                $data['boutique_id'] = Vente::find($data['vente_id'])?->boutique_id;
            } elseif (isset($data['commande_id'])) {
                $data['boutique_id'] = Commande::find($data['commande_id'])?->boutique_id;
            }
        }

        if (! $data['boutique_id']) {
            return back()->with('error', 'Impossible de déterminer la boutique pour ce paiement.');
        }

        $paiement = Paiement::create($data);

        if ($paiement->vente_id) {
            $paiement->vente->updateStatutPaiement();
        } elseif ($paiement->commande_id) {
            $paiement->commande->updateStatutPaiement();
        }

        return redirect()->route('paiements.show', $paiement)
            ->with('success', 'Paiement enregistré avec succès.');
    }

    public function show(Paiement $paiement): Response
    {
        $this->authorizeBoutique($paiement);
        $paiement->load(['vente.client', 'commande.client', 'user', 'boutique']);

        return Inertia::render('Paiements/Show', [
            'paiement' => $paiement,
        ]);
    }

    public function destroy(Paiement $paiement): RedirectResponse
    {
        $this->authorizeBoutique($paiement);

        $vente = $paiement->vente;
        $commande = $paiement->commande;

        $paiement->delete();

        if ($vente) {
            $vente->updateStatutPaiement();
        } elseif ($commande) {
            $commande->updateStatutPaiement();
        }

        return redirect()->route('paiements.index')
            ->with('success', 'Paiement supprimé avec succès.');
    }

    protected function authorizeBoutique(Paiement $paiement): void
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        if (! $user->isAdmin() && $paiement->boutique_id !== $user->boutique_id) {
            abort(403);
        }
    }
}
