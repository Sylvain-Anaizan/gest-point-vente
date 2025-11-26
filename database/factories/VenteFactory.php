<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\User;
use App\Models\Vente;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vente>
 */
class VenteFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\Illuminate\Database\Eloquent\Model>
     */
    protected $model = Vente::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuts = ['complétée', 'annulée'];
        $modesPaiement = ['espèces', 'carte', 'virement', 'mobile_money'];

        return [
            'numero' => 'V-' . date('Ymd') . '-' . strtoupper(fake()->unique()->randomLetter() . fake()->randomLetter() . fake()->randomLetter() . fake()->randomLetter()),
            'client_id' => Client::factory(),
            'user_id' => User::factory(),
            'montant_total' => fake()->randomFloat(2, 1000, 50000),
            'statut' => fake()->randomElement($statuts),
            'mode_paiement' => fake()->randomElement($modesPaiement),
        ];
    }

    /**
     * Indicate that the vente is completed.
     */
    public function complete(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'complétée',
        ]);
    }

    /**
     * Indicate that the vente is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'annulée',
        ]);
    }

    /**
     * Indicate that the vente is paid in cash.
     */
    public function cash(): static
    {
        return $this->state(fn (array $attributes) => [
            'mode_paiement' => 'espèces',
        ]);
    }
}