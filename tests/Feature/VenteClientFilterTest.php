<?php

namespace Tests\Feature;

use App\Models\Boutique;
use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VenteClientFilterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);
    }

    public function test_employee_sees_only_clients_from_their_boutique_on_vente_create(): void
    {
        $boutiqueA = Boutique::factory()->create(['nom' => 'Boutique A']);
        $boutiqueB = Boutique::factory()->create(['nom' => 'Boutique B']);

        $clientA = Client::factory()->create(['boutique_id' => $boutiqueA->id, 'actif' => true]);
        $clientB = Client::factory()->create(['boutique_id' => $boutiqueB->id, 'actif' => true]);

        $employee = User::factory()->employe()->create([
            'boutique_id' => $boutiqueA->id,
        ]);

        $this->actingAs($employee);

        $response = $this->get(route('ventes.create'));

        $response->assertStatus(200);

        $clients = $response->original->getData()['page']['props']['clients'];

        // L'employé ne doit voir que le client de sa boutique
        $clientIds = collect($clients)->pluck('id')->all();
        $this->assertContains($clientA->id, $clientIds);
        $this->assertNotContains($clientB->id, $clientIds);
    }

    public function test_admin_sees_empty_client_list_on_vente_create(): void
    {
        $boutique = Boutique::factory()->create();
        Client::factory()->create(['boutique_id' => $boutique->id, 'actif' => true]);

        $admin = User::factory()->admin()->create();

        $this->actingAs($admin);

        $response = $this->get(route('ventes.create'));

        $response->assertStatus(200);

        $clients = $response->original->getData()['page']['props']['clients'];

        // L'admin ne voit aucun client au départ (il doit d'abord sélectionner une boutique)
        $this->assertCount(0, $clients);
    }

    public function test_par_boutique_endpoint_returns_filtered_clients(): void
    {
        $boutiqueA = Boutique::factory()->create();
        $boutiqueB = Boutique::factory()->create();

        $clientA = Client::factory()->create(['boutique_id' => $boutiqueA->id, 'actif' => true]);
        $clientB = Client::factory()->create(['boutique_id' => $boutiqueB->id, 'actif' => true]);

        $admin = User::factory()->admin()->create();
        $this->actingAs($admin);

        $response = $this->getJson(route('clients.par-boutique', ['boutique_id' => $boutiqueA->id]));

        $response->assertStatus(200);

        $clientIds = collect($response->json())->pluck('id')->all();
        $this->assertContains($clientA->id, $clientIds);
        $this->assertNotContains($clientB->id, $clientIds);
    }
}
