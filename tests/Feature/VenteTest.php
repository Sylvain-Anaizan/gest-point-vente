<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Produit;
use App\Models\User;
use App\Models\Vente;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VenteTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer un utilisateur pour les tests
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    public function test_user_can_view_ventes_index()
    {
        // Créer quelques ventes manuellement pour le test
        $client = Client::factory()->create();
        $produit = Produit::factory()->create(['quantite' => 10]);

        for ($i = 0; $i < 3; $i++) {
            $vente = Vente::create([
                'numero' => 'V-'.date('Ymd').'-'.strtoupper(uniqid()),
                'client_id' => $client->id,
                'user_id' => $this->user->id,
                'montant_total' => 1000,
                'mode_paiement' => 'espèces',
                'statut' => 'complétée',
            ]);

            $vente->lignes()->create([
                'produit_id' => $produit->id,
                'quantite' => 1,
                'prix_unitaire' => 1000,
                'sous_total' => 1000,
            ]);
        }

        $response = $this->get(route('ventes.index'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Ventes/Index')
                ->has('ventes.data', 3)
            );
    }

    public function test_user_can_create_vente()
    {
        $client = Client::factory()->create();
        $produit = Produit::factory()->create(['quantite' => 10]);

        $venteData = [
            'client_id' => $client->id,
            'mode_paiement' => 'espèces',
            'lignes' => [
                [
                    'produit_id' => $produit->id,
                    'quantite' => 2,
                    'prix_unitaire' => $produit->prix_vente,
                ],
            ],
        ];

        $response = $this->post(route('ventes.store'), $venteData);

        $response->assertRedirect(route('ventes.show', Vente::first()));
        $this->assertDatabaseHas('ventes', [
            'client_id' => $client->id,
            'user_id' => $this->user->id,
            'mode_paiement' => 'espèces',
            'statut' => 'complétée',
        ]);
        $this->assertDatabaseHas('ligne_ventes', [
            'produit_id' => $produit->id,
            'quantite' => 2,
        ]);

        // Vérifier que le stock a été décrémenté
        $produit->refresh();
        $this->assertEquals(8, $produit->quantite);
    }

    public function test_user_can_view_vente_details()
    {
        $client = Client::factory()->create();
        $produit = Produit::factory()->create(['quantite' => 10]);

        $vente = Vente::create([
            'numero' => 'V-'.date('Ymd').'-'.strtoupper(uniqid()),
            'client_id' => $client->id,
            'user_id' => $this->user->id,
            'montant_total' => 1000,
            'mode_paiement' => 'espèces',
            'statut' => 'complétée',
        ]);

        $vente->lignes()->create([
            'produit_id' => $produit->id,
            'quantite' => 1,
            'prix_unitaire' => 1000,
            'sous_total' => 1000,
        ]);

        $response = $this->get(route('ventes.show', $vente));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Ventes/Show')
                ->has('vente')
            );
    }

    public function test_user_can_update_vente()
    {
        $client = Client::factory()->create();
        $produit = Produit::factory()->create(['quantite' => 10]);

        $vente = Vente::create([
            'numero' => 'V-'.date('Ymd').'-'.strtoupper(uniqid()),
            'client_id' => $client->id,
            'user_id' => $this->user->id,
            'montant_total' => 2000,
            'mode_paiement' => 'espèces',
            'statut' => 'complétée',
        ]);

        // Créer une ligne de vente
        $vente->lignes()->create([
            'produit_id' => $produit->id,
            'quantite' => 2,
            'prix_unitaire' => 1000,
            'sous_total' => 2000,
        ]);

        // Décrémenter le stock
        $produit->decrement('quantite', 2);

        $updateData = [
            'client_id' => $vente->client_id,
            'mode_paiement' => 'carte',
            'statut' => 'complétée',
            'lignes' => [
                [
                    'produit_id' => $produit->id,
                    'quantite' => 3,
                    'prix_unitaire' => 1000,
                ],
            ],
        ];

        $response = $this->put(route('ventes.update', $vente), $updateData);

        $response->assertRedirect(route('ventes.show', $vente));

        $vente->refresh();
        $this->assertEquals('carte', $vente->mode_paiement);

        // Vérifier que le stock a été ajusté (3 - 2 = +1 décrémenté)
        $produit->refresh();
        $this->assertEquals(9, $produit->quantite);
    }

    public function test_user_can_delete_vente()
    {
        $client = Client::factory()->create();
        $produit = Produit::factory()->create(['quantite' => 10]);

        $vente = Vente::create([
            'numero' => 'V-'.date('Ymd').'-'.strtoupper(uniqid()),
            'client_id' => $client->id,
            'user_id' => $this->user->id,
            'montant_total' => 2000,
            'mode_paiement' => 'espèces',
            'statut' => 'complétée',
        ]);

        // Créer une ligne de vente
        $vente->lignes()->create([
            'produit_id' => $produit->id,
            'quantite' => 2,
            'prix_unitaire' => 1000,
            'sous_total' => 2000,
        ]);

        // Décrémenter le stock
        $produit->decrement('quantite', 2);

        $response = $this->delete(route('ventes.destroy', $vente));

        $response->assertRedirect(route('ventes.index'));
        $this->assertDatabaseMissing('ventes', ['id' => $vente->id]);

        // Vérifier que le stock a été restauré
        $produit->refresh();
        $this->assertEquals(10, $produit->quantite);
    }

    public function test_cannot_create_vente_with_insufficient_stock()
    {
        $produit = Produit::factory()->create(['quantite' => 1]);

        $venteData = [
            'mode_paiement' => 'espèces',
            'lignes' => [
                [
                    'produit_id' => $produit->id,
                    'quantite' => 5, // Plus que le stock disponible
                    'prix_unitaire' => $produit->prix_vente,
                ],
            ],
        ];

        $response = $this->post(route('ventes.store'), $venteData);

        $response->assertRedirect(); // Redirection avec erreurs
        $this->assertDatabaseMissing('ventes', ['user_id' => $this->user->id]);
    }
}
