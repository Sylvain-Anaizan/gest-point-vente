<?php

namespace Tests\Feature;

use App\Models\Boutique;
use App\Models\Client;
use App\Models\Commande;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommandeTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Boutique $boutique;

    protected function setUp(): void
    {
        parent::setUp();

        $this->boutique = Boutique::factory()->create();
        $this->user = User::factory()->create([
            'boutique_id' => $this->boutique->id,
        ]);
    }

    public function test_can_list_commandes(): void
    {
        Commande::factory()->count(5)->create([
            'boutique_id' => $this->boutique->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('commandes.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Commandes/Index')
            ->has('commandes.data', 5)
        );
    }

    public function test_can_filter_commandes_by_search(): void
    {
        $commande1 = Commande::factory()->create([
            'numero' => 'CMD-SEARCH-1',
            'boutique_id' => $this->boutique->id,
        ]);

        $commande2 = Commande::factory()->create([
            'numero' => 'CMD-SEARCH-2',
            'boutique_id' => $this->boutique->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('commandes.index', ['search' => 'SEARCH-1']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Commandes/Index')
            ->has('commandes.data', 1)
            ->where('commandes.data.0.numero', 'CMD-SEARCH-1')
        );
    }

    public function test_can_filter_commandes_by_status(): void
    {
        Commande::factory()->create([
            'statut' => 'en_attente',
            'boutique_id' => $this->boutique->id,
        ]);

        Commande::factory()->create([
            'statut' => 'livrée',
            'boutique_id' => $this->boutique->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('commandes.index', ['statut' => 'livrée']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Commandes/Index')
            ->has('commandes.data', 1)
            ->where('commandes.data.0.statut', 'livrée')
        );
    }

    public function test_can_search_by_client_name(): void
    {
        $client = Client::factory()->create([
            'nom' => 'John Doe',
        ]);

        $commande = Commande::factory()->create([
            'client_id' => $client->id,
            'boutique_id' => $this->boutique->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('commandes.index', ['search' => 'John']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Commandes/Index')
            ->has('commandes.data', 1)
        );
    }
}
