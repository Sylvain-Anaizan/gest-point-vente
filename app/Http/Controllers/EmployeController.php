<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeRequest;
use App\Http\Requests\UpdateEmployeRequest;
use App\Models\Boutique;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class EmployeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        Gate::authorize('admin');

        return Inertia::render('employes/index', [
            'employes' => User::query()
                ->with(['boutique', 'roles'])
                ->where('role', '!=', 'customer')
                ->latest()
                ->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('employes/create', [
            'boutiques' => Boutique::all(['id', 'nom']),
            'roles' => \Spatie\Permission\Models\Role::all(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEmployeRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $roles = $validated['roles'] ?? [];
        unset($validated['roles']);

        $validated['password'] = Hash::make($validated['password']);

        // Legacy column sync
        $validated['role'] = in_array('admin', $roles) ? 'admin' : 'employé';

        $user = User::create($validated);
        $user->assignRole($roles);

        return redirect()->route('employes.index')
            ->with('success', 'Employé créé avec succès.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $employe): Response
    {
        return Inertia::render('employes/edit', [
            'employe' => $employe->load(['boutique', 'roles']),
            'boutiques' => Boutique::all(['id', 'nom']),
            'roles' => \Spatie\Permission\Models\Role::all(['id', 'name']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEmployeRequest $request, User $employe): RedirectResponse
    {
        $validated = $request->validated();
        $roles = $validated['roles'] ?? [];
        unset($validated['roles']);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        // Legacy column sync
        if (! empty($roles)) {
            $validated['role'] = in_array('admin', $roles) ? 'admin' : 'employé';
        }

        $employe->update($validated);

        $employe->syncRoles($roles);

        return redirect()->route('employes.index')
            ->with('success', 'Employé mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $employe): RedirectResponse
    {
        Gate::authorize('delete users');

        $employe->delete();

        return redirect()->route('employes.index')
            ->with('success', 'Employé supprimé avec succès.');
    }
}
