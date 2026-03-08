<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'view dashboard',
            'manage users',
            'manage boutiques',
            'manage products',
            'manage categories',
            'manage units',
            'manage sales',
            'manage reports',
            'manage roles',
            'manage payments',
            'manage settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create roles and assign permissions
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $adminRole->syncPermissions(Permission::all());

        $employeRole = Role::firstOrCreate(['name' => 'employé', 'guard_name' => 'web']);
        $employeRole->syncPermissions([
            'view dashboard',
            'manage products',
            'manage sales',
        ]);

        // Assign roles to existing users based on their current 'role' column
        User::all()->each(function (User $user) {
            if ($user->role === 'admin' && !$user->hasRole('admin')) {
                $user->assignRole('admin');
            } elseif (($user->role === 'employé' || $user->role === 'vendeur') && !$user->hasRole('employé')) {
                $user->assignRole('employé');
            }
        });
    }
}
