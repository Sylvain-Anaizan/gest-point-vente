<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'array',
        ]);

        $role = Role::create(['name' => $validated['name']]);
        
        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return back()->with('success', 'Rôle créé avec succès.');
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id,
            'permissions' => 'array',
        ]);

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions'] ?? []);

        return back()->with('success', 'Rôle mis à jour avec succès.');
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'admin') {
            return back()->with('error', 'Le rôle administrateur ne peut pas être supprimé.');
        }

        $role->delete();

        return back()->with('success', 'Rôle supprimé avec succès.');
    }
}
