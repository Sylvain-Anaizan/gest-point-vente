<?php

namespace Tests\Feature;

use App\Models\Client;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientTest extends TestCase
{
    use RefreshDatabase;

    protected \App\Models\User $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer un utilisateur pour les tests (nécessaire pour les routes protégées)
        $this->user = \App\Models\User::factory()->create();
        $this->actingAs($this->user);
    }

    /** @test */
    public function it_can_display_clients_index_page()
    {
        Client::factory()->count(3)->create();

        $response = $this->get(route('clients.index'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Clients/Index')
                ->has('clients.data', 3)
            );
    }

    /** @test */
    public function it_can_create_a_client()
    {
        $clientData = [
            'nom' => 'Dupont',
            'prenom' => 'Jean',
            'email' => 'jean.dupont@example.com',
            'telephone' => '01 23 45 67 89',
            'adresse' => '123 rue de la Paix',
            'ville' => 'Paris',
            'code_postal' => '75001',
            'pays' => 'France',
            'date_naissance' => '1990-01-01',
            'notes' => 'Client VIP',
            'actif' => true,
        ];

        $response = $this->post(route('clients.store'), $clientData);

        $response->assertRedirect(route('clients.index'));
        $this->assertDatabaseHas('clients', $clientData);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_client()
    {
        $response = $this->post(route('clients.store'), []);

        $response->assertSessionHasErrors(['nom', 'email']);
    }

    /** @test */
    public function it_validates_email_uniqueness_when_creating_client()
    {
        Client::factory()->create(['email' => 'existing@example.com']);

        $response = $this->post(route('clients.store'), [
            'nom' => 'Dupont',
            'email' => 'existing@example.com',
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    /** @test */
    public function it_can_show_a_client()
    {
        $client = Client::factory()->create();

        $response = $this->get(route('clients.show', $client));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Clients/Show')
                ->has('client')
                ->where('client.id', $client->id)
            );
    }

    /** @test */
    public function it_can_update_a_client()
    {
        $client = Client::factory()->create([
            'nom' => 'Dupont',
            'email' => 'jean.dupont@example.com',
        ]);

        $updateData = [
            'nom' => 'Martin',
            'prenom' => 'Pierre',
            'email' => 'pierre.martin@example.com',
            'telephone' => '01 98 76 54 32',
            'adresse' => '456 avenue des Champs',
            'ville' => 'Lyon',
            'code_postal' => '69000',
            'pays' => 'France',
            'date_naissance' => '1985-05-15',
            'notes' => 'Client mis à jour',
            'actif' => false,
        ];

        $response = $this->patch(route('clients.update', $client), $updateData);

        $response->assertRedirect(route('clients.edit', $client));
        $this->assertDatabaseHas('clients', array_merge(['id' => $client->id], $updateData));
    }

    /** @test */
    public function it_validates_email_uniqueness_when_updating_client()
    {
        $client1 = Client::factory()->create(['email' => 'client1@example.com']);
        $client2 = Client::factory()->create(['email' => 'client2@example.com']);

        $response = $this->patch(route('clients.update', $client1), [
            'nom' => 'Dupont',
            'email' => 'client2@example.com', // Email déjà utilisé
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    /** @test */
    public function it_can_delete_a_client()
    {
        $client = Client::factory()->create();

        $response = $this->delete(route('clients.destroy', $client));

        $response->assertRedirect(route('clients.index'));
        $this->assertDatabaseMissing('clients', ['id' => $client->id]);
    }

    /** @test */
    public function it_can_toggle_client_status()
    {
        $client = Client::factory()->create(['actif' => true]);

        $response = $this->patch(route('clients.toggle-status', $client));

        $response->assertRedirect();
        $this->assertFalse($client->fresh()->actif);

        // Toggle again
        $response = $this->patch(route('clients.toggle-status', $client));

        $response->assertRedirect();
        $this->assertTrue($client->fresh()->actif);
    }

    /** @test */
    public function it_can_search_clients()
    {
        Client::factory()->create(['nom' => 'Dupont', 'email' => 'dupont@example.com']);
        Client::factory()->create(['nom' => 'Martin', 'email' => 'martin@example.com']);
        Client::factory()->create(['nom' => 'Durand', 'prenom' => 'Jean', 'email' => 'jean.durand@example.com']);

        $response = $this->get(route('clients.index', ['search' => 'dupont']));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Clients/Index')
                ->has('clients.data', 1)
                ->where('clients.data.0.nom', 'Dupont')
            );
    }

    /** @test */
    public function it_can_filter_active_clients()
    {
        Client::factory()->count(3)->create(['actif' => true]);
        Client::factory()->count(2)->create(['actif' => false]);

        $response = $this->get(route('clients.index', ['actif' => 'actifs']));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Clients/Index')
                ->has('clients.data', 3)
            );
    }

    /** @test */
    public function it_can_filter_inactive_clients()
    {
        Client::factory()->count(3)->create(['actif' => true]);
        Client::factory()->count(2)->create(['actif' => false]);

        $response = $this->get(route('clients.index', ['actif' => 'inactifs']));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Clients/Index')
                ->has('clients.data', 2)
            );
    }

    /** @test */
    public function it_can_paginate_clients()
    {
        Client::factory()->count(20)->create();

        $response = $this->get(route('clients.index', ['per_page' => 10]));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Clients/Index')
                ->has('clients.data', 10)
                ->where('clients.total', 20)
            );
    }

    /** @test */
    public function it_returns_correct_client_full_name()
    {
        $client = Client::factory()->create([
            'nom' => 'Dupont',
            'prenom' => 'Jean',
        ]);

        $this->assertEquals('Jean Dupont', $client->nom_complet);
    }

    /** @test */
    public function it_returns_correct_client_full_address()
    {
        $client = Client::factory()->create([
            'adresse' => '123 rue de la Paix',
            'ville' => 'Paris',
            'code_postal' => '75001',
            'pays' => 'France',
        ]);

        $expectedAddress = '123 rue de la Paix, 75001 Paris';
        $this->assertEquals($expectedAddress, $client->adresse_complete);
    }

    /** @test */
    public function it_can_scope_active_clients()
    {
        Client::factory()->count(3)->create(['actif' => true]);
        Client::factory()->count(2)->create(['actif' => false]);

        $activeClients = Client::actifs()->get();

        $this->assertCount(3, $activeClients);
        $activeClients->each(function ($client) {
            $this->assertTrue($client->actif);
        });
    }

    /** @test */
    public function it_can_scope_search_clients()
    {
        Client::factory()->create(['nom' => 'Dupont', 'email' => 'dupont@example.com']);
        Client::factory()->create(['nom' => 'Martin', 'email' => 'martin@example.com']);

        $results = Client::rechercher('dupont')->get();

        $this->assertCount(1, $results);
        $this->assertEquals('Dupont', $results->first()->nom);
    }
}
