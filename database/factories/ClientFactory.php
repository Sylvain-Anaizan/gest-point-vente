<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Client>
 */
class ClientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'telephone' => fake()->phoneNumber(),
            'adresse' => fake()->address(),
            'actif' => fake()->boolean(90),
        ];
    }

    /**
     * Indicate that the client is inactive.
     */
    public function inactif(): static
    {
        return $this->state(fn (array $attributes) => [
            'actif' => false,
        ]);
    }
}
