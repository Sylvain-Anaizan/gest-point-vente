<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Commande>
 */
class CommandeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'numero' => 'CMD-' . strtoupper(fake()->bothify('??####')),
            'nom_client' => fake()->name(),
            'telephone_client' => fake()->phoneNumber(),
            'adresse_origine' => fake()->address(),
            'adresse_destination' => fake()->address(),
            'statut' => fake()->randomElement(['en_attente', 'en_cours', 'livrée', 'annulée']),
            'montant_total' => fake()->randomFloat(2, 5000, 500000),
            'date_commande' => fake()->dateTimeBetween('-1 month', 'now'),
            'observations' => fake()->sentence(),
        ];
    }
}
