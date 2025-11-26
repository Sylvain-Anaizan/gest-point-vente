<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Produit>
 */
class ProduitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => fake()->words(2, true),
            'prix_vente' => fake()->randomFloat(2, 50, 1000),
            'quantite' => fake()->numberBetween(0, 100),
            'categorie_id' => \App\Models\Categorie::factory(),
            'taille_id' => null,
            'description' => fake()->optional()->sentence(),
            'image' => null,
        ];
    }
}
