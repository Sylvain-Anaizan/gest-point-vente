<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Client::query();

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
        return Inertia::render('clients/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClientRequest $request)
    {
        $client = Client::create($request->validated());

        return redirect()->route('clients.index')
            ->with('success', 'Client créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client, Request $request)
    {
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
        return Inertia::render('clients/edit', [
            'client' => $client,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClientRequest $request, Client $client)
    {
        $client->update($request->validated());

        return redirect()->route('clients.edit', $client)
            ->with('success', 'Client mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        $client->delete();

        return redirect()->route('clients.index')
            ->with('success', 'Client supprimé avec succès.');
    }

    /**
     * Toggle client active status.
     */
    public function toggleStatus(Client $client)
    {
        $client->update([
            'actif' => ! $client->actif,
        ]);

        $message = $client->actif ? 'Client activé avec succès.' : 'Client désactivé avec succès.';

        return redirect()->back()
            ->with('success', $message);
    }
}
