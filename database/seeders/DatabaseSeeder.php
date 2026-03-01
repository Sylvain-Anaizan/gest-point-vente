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
        // User::factory(10)->create();

        \App\Models\Boutique::firstOrCreate(
            ['nom' => 'Boutique Principale'],
            ['adresse' => 'Bamako, Mali', 'telephone' => '00000000']
        );

        $this->call([
            AdminSeeder::class,
        ]);

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'numero' => '0123456789',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        // Créer 20 clients pour le test
        Client::factory(20)->create();
    }
}
