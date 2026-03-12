<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Boutique;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Retourne la boutique de l'utilisateur connecté (null si admin).
     */
    private function userBoutique(): ?int
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            return null;
        }

        return $user->boutique_id;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Client::query()->with('boutique');

        // Un employé ne voit que les clients de sa boutique
        $boutiqueId = $this->userBoutique();
        if ($boutiqueId !== null) {
            $query->where('boutique_id', $boutiqueId);
        }

        // Recherche
        if ($request->filled('search')) {
            $query->rechercher($request->search);
        }

        // Filtre actif/inactif
        if ($request->filled('actif')) {
            if ($request->actif === 'actifs') {
                $query->actifs();
            } elseif ($request->actif === 'inactifs') {
                $query->where('actif', false);
            }
        }

        // Tri
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $query->orderBy($sortField, $sortDirection);

        $clients = $query->paginate(10)->withQueryString();

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'filters' => $request->only(['search', 'actif', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();

        // Un admin peut choisir n'importe quelle boutique ; un employé est limité à la sienne
        if ($user->isAdmin()) {
            $boutiques = Boutique::orderBy('nom')->get(['id', 'nom']);
            $boutiqueId = null;
        } else {
            $boutiques = Boutique::where('id', $user->boutique_id)->get(['id', 'nom']);
            $boutiqueId = $user->boutique_id;
        }

        return Inertia::render('clients/create', [
            'boutiques' => $boutiques,
            'boutique_id' => $boutiqueId,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClientRequest $request)
    {
        $data = $request->validated();

        // Forcer la boutique de l'employé — un non-admin ne peut créer que dans sa boutique
        $user = Auth::user();
        if (! $user->isAdmin()) {
            $data['boutique_id'] = $user->boutique_id;
        }

        Client::create($data);

        return redirect()->route('clients.index')
            ->with('success', 'Client créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client, Request $request)
    {
        $this->authorizeClientAccess($client);

        $client->load('boutique');

        // Charger les ventes du client avec pagination
        $ventes = $client->ventes()
            ->with(['user', 'lignes.produit'])
            ->when($request->statut, function ($query) use ($request) {
                return $query->where('statut', $request->statut);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Statistiques du client
        $stats = [
            'total_ventes' => $client->ventes()->where('statut', 'complétée')->count(),
            'total_montant' => $client->ventes()->where('statut', 'complétée')->sum('montant_total'),
            'derniere_vente' => $client->ventes()->latest('created_at')->first()?->created_at,
        ];

        return Inertia::render('clients/show', [
            'client' => $client,
            'ventes' => $ventes,
            'stats' => $stats,
            'filters' => $request->only(['statut']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client)
    {
        $this->authorizeClientAccess($client);

        $user = Auth::user();

        if ($user->isAdmin()) {
            $boutiques = Boutique::orderBy('nom')->get(['id', 'nom']);
        } else {
            $boutiques = Boutique::where('id', $user->boutique_id)->get(['id', 'nom']);
        }

        return Inertia::render('clients/edit', [
            'client' => $client,
            'boutiques' => $boutiques,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClientRequest $request, Client $client)
    {
        $this->authorizeClientAccess($client);

        $data = $request->validated();

        // Forcer la boutique de l'employé
        $user = Auth::user();
        if (! $user->isAdmin()) {
            $data['boutique_id'] = $user->boutique_id;
        }

        $client->update($data);

        return redirect()->route('clients.edit', $client)
            ->with('success', 'Client mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        $this->authorizeClientAccess($client);

        $client->delete();

        return redirect()->route('clients.index')
            ->with('success', 'Client supprimé avec succès.');
    }

    /**
     * Toggle client active status.
     */
    public function toggleStatus(Client $client)
    {
        $this->authorizeClientAccess($client);

        $client->update([
            'actif' => ! $client->actif,
        ]);

        $message = $client->actif ? 'Client activé avec succès.' : 'Client désactivé avec succès.';

        return redirect()->back()
            ->with('success', $message);
    }

    /**
     * Vérifie qu'un employé n'accède qu'aux clients de sa boutique.
     */
    private function authorizeClientAccess(Client $client): void
    {
        $user = Auth::user();

        if (! $user->isAdmin() && $client->boutique_id !== $user->boutique_id) {
            abort(403, 'Vous n\'avez pas accès à ce client.');
        }
    }

    /**
     * API JSON : retourne les clients d'une boutique (pour le POS).
     * GET /clients/par-boutique?boutique_id=X  (admin)
     * Un employé ne voit que ses clients de boutique.
     */
    public function parBoutique(Request $request): \Illuminate\Http\JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $query = Client::select('id', 'nom', 'telephone', 'boutique_id')
            ->where('actif', true)
            ->orderBy('nom');

        if ($user->isAdmin()) {
            $boutiqueId = $request->query('boutique_id');
            if ($boutiqueId) {
                $query->where('boutique_id', $boutiqueId);
            }
        } else {
            $query->where('boutique_id', $user->boutique_id);
        }

        return response()->json($query->get());
    }

    /**
     * Création rapide d'un client depuis le POS (retour JSON).
     * POST /clients/creation-rapide
     */
    public function storeRapide(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:50',
            'email' => 'nullable|email|unique:clients,email|max:255',
            'adresse' => 'nullable|string|max:500',
            'boutique_id' => 'nullable|exists:boutiques,id',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Un employé crée toujours dans sa boutique
        if (! $user->isAdmin()) {
            $validated['boutique_id'] = $user->boutique_id;
        }

        $validated['actif'] = true;

        $client = Client::create($validated);

        return response()->json([
            'id' => $client->id,
            'nom' => $client->nom,
            'telephone' => $client->telephone,
            'email' => $client->email,
            'boutique_id' => $client->boutique_id,
        ], 201);
    }
}
