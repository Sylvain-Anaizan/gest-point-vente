<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Produit;
use App\Models\User;
use App\Models\Vente;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class POSControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer un utilisateur pour les tests
        $this->user = User::factory()->create();
    }

    public function test_pos_page_loads()
    {
        $response = $this->actingAs($this->user)->get('/pos');

        $response->assertStatus(200);
    }

    public function test_can_create_sale()
    {
        // Créer des données de test
        $category = \App\Models\Categorie::factory()->create();
        $client = Client::factory()->create();
        $produit = Produit::create([
            'nom' => 'Test Produit',
            'quantite' => 10,
            'prix_vente' => 1000,
            'categorie_id' => $category->id,
        ]);

        $saleData = [
            'client_id' => $client->id,
            'panier' => [
                [
                    'id' => $produit->id,
                    'quantite' => 2,
                    'prix_vente' => 1000,
                ],
            ],
            'mode_paiement' => 'espèces',
            'montant_recu' => 2500,
        ];

        $response = $this->actingAs($this->user)->post('/pos/store', $saleData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Vérifier que la vente a été créée
        $this->assertDatabaseHas('ventes', [
            'client_id' => $client->id,
            'montant_total' => 2000,
            'mode_paiement' => 'espèces',
        ]);

        // Vérifier que le stock a été décrémenté
        $produit->refresh();
        $this->assertEquals(8, $produit->quantite);

        // Vérifier que les lignes de vente ont été créées
        $vente = Vente::latest()->first();
        $this->assertDatabaseHas('lignes_vente', [
            'vente_id' => $vente->id,
            'produit_id' => $produit->id,
            'quantite' => 2,
            'prix_unitaire' => 1000,
        ]);
    }

    public function test_data_is_received_by_controller()
    {
        $saleData = [
            'client_id' => null,
            'panier' => [
                [
                    'id' => 999, // ID qui n'existe pas, pour provoquer une erreur de validation
                    'quantite' => 1,
                    'prix_vente' => 1000,
                ],
            ],
            'mode_paiement' => 'espèces',
            'montant_recu' => 1000,
        ];

        $response = $this->actingAs($this->user)->post('/pos/store', $saleData);

        // Si les données arrivent, on devrait avoir une erreur de validation sur l'ID du produit
        $response->assertSessionHasErrors('panier.0.id');
    }
}
