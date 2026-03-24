<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MouvementStock>
 */
class MouvementStockFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $variante = \App\Models\Variante::factory()->create();
        $produit = $variante->produit;

        return [
            'produit_id' => $produit->id,
            'variante_id' => $variante->id,
            'boutique_id' => $produit->boutique_id,
            'user_id' => \App\Models\User::factory(),
            'type' => $this->faker->randomElement(['entrée', 'sortie', 'vente', 'ajustement']),
            'quantite' => $this->faker->numberBetween(1, 100),
            'reference' => 'REF-'.$this->faker->unique()->numberBetween(1000, 9999),
            'notes' => $this->faker->sentence(),
        ];
    }
}
