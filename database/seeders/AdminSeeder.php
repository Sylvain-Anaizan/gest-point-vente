<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@anaizan.com')->first();

        if (!$admin) {
            $admin = User::factory()->admin()->create([
                'name' => 'Administrateur',
                'email' => 'admin@anaizan.com',
                'numero' => '00000000',
                'password' => 'password',
                'email_verified_at' => now(),
            ]);
        } else {
            $admin->update(['role' => 'admin']);
            $admin->assignRole('admin');
        }
    }
}
