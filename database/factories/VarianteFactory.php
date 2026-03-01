<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Variante>
 */
class VarianteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'produit_id' => \App\Models\Produit::factory(),
            'taille_id' => null,
            'prix_vente' => fake()->randomFloat(2, 50, 1000),
            'quantite' => fake()->numberBetween(0, 50),
        ];
    }
}
