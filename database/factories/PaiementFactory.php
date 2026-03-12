<?php

namespace Database\Factories;

use App\Models\Boutique;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Paiement>
 */
class PaiementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'montant' => fake()->randomFloat(2, 500, 50000),
            'mode_paiement' => fake()->randomElement(['espèces', 'carte', 'virement', 'mobile_money', 'chèque']),
            'reference' => fake()->optional()->bothify('REF-####-??'),
            'date_paiement' => fake()->dateTimeBetween('-30 days', 'now'),
            'commentaire' => fake()->optional()->sentence(),
            'user_id' => User::factory(),
            'boutique_id' => Boutique::factory(),
        ];
    }
}
