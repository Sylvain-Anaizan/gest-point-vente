<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommandeRequest;
use App\Http\Requests\UpdateCommandeRequest;
use App\Models\Client;
use App\Models\Commande;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CommandeController extends Controller
{
    public function index(): Response
    {
        $boutiqueId = auth()->user()->boutique_id;
        $commandes = Commande::query()
            ->where('boutique_id', $boutiqueId)
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
            ->with('client')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Commandes/Index', [
            'commandes' => $commandes,
            'filters' => request()->all(['search', 'statut']),
        ]);
    }

    public function create(): Response
    {
        $user = auth()->user();
        $boutiques = ($user->isAdmin() || !$user->boutique_id) 
            ? \App\Models\Boutique::all(['id', 'nom'])
            : [];

        return Inertia::render('Commandes/Create', [
            'clients' => Client::actifs()->get(['id', 'nom', 'telephone']),
            'boutiques' => $boutiques,
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
        if (!$boutiqueId && $user->isAdmin()) {
            $boutiqueId = \App\Models\Boutique::first()?->id;
        }

        if (!$boutiqueId) {
            return back()->with('error', 'Vous devez appartenir à une boutique pour créer une commande.');
        }

        $data['boutique_id'] = $boutiqueId;

        DB::transaction(function () use ($data) {
            $commande = Commande::create(collect($data)->except('lignes_commande')->toArray());
            foreach ($data['lignes_commande'] as $ligne) {
                $commande->lignesCommande()->create($ligne);
            }
        });

        return redirect()->route('commandes.index')
            ->with('success', 'Commande créée avec succès.');
    }

    public function show(Commande $commande): Response
    {
        $this->authorizeBoutique($commande);
        $commande->load(['client', 'lignesCommande']);

        return Inertia::render('Commandes/Show', [
            'commande' => $commande,
        ]);
    }

    public function edit(Commande $commande): Response
    {
        $this->authorizeBoutique($commande);
        $commande->load('lignesCommande');

        $user = auth()->user();
        $boutiques = ($user->isAdmin() || !$user->boutique_id) 
            ? \App\Models\Boutique::all(['id', 'nom'])
            : [];

        return Inertia::render('Commandes/Edit', [
            'commande' => $commande,
            'clients' => Client::actifs()->get(['id', 'nom', 'telephone']),
            'boutiques' => $boutiques,
        ]);
    }

    public function update(UpdateCommandeRequest $request, Commande $commande): RedirectResponse
    {
        $this->authorizeBoutique($commande);
        
        $data = $request->validated();

        DB::transaction(function () use ($commande, $data) {
            $commande->update(collect($data)->except('lignes_commande')->toArray());

            if (isset($data['lignes_commande'])) {
                $commande->lignesCommande()->delete();
                foreach ($data['lignes_commande'] as $ligne) {
                    $commande->lignesCommande()->create($ligne);
                }
            }
        });

        return redirect()->route('commandes.index')
            ->with('success', 'Commande mise à jour avec succès.');
    }

    public function destroy(Commande $commande): RedirectResponse
    {
        $this->authorizeBoutique($commande);
        $commande->delete();

        return redirect()->route('commandes.index')
            ->with('success', 'Commande supprimée avec succès.');
    }

    protected function authorizeBoutique(Commande $commande): void
    {
        if ($commande->boutique_id !== auth()->user()->boutique_id) {
            abort(403);
        }
    }
}
