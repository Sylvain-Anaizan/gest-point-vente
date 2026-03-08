<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \App\Models\Boutique::firstOrCreate(
            ['nom' => 'Boutique Principale'],
            ['adresse' => 'Bamako, Mali', 'telephone' => '00000000']
        );

        $this->call([
            RoleAndPermissionSeeder::class,
            AdminSeeder::class,
        ]);

        if (!User::where('email', 'test@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'numero' => '0123456789',
                'password' => 'password',
                'email_verified_at' => now(),
            ]);
        }

        // Créer 20 clients pour le test
        Client::factory(20)->create();
    }
}
