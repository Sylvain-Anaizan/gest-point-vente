<?php

namespace Tests\Feature;

use App\Models\Boutique;
use App\Models\Commande;
use App\Models\LigneCommande;
use App\Models\User;
use App\Models\Vente;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommandeVenteConversionTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Boutique $boutique;

    protected function setUp(): void
    {
        parent::setUp();

        $this->boutique = Boutique::factory()->create();
        $this->user = User::factory()->create([
            'role' => 'admin',
            'boutique_id' => $this->boutique->id,
        ]);

        \Spatie\Permission\Models\Permission::create(['name' => 'manage sales']);
        $this->user->givePermissionTo('manage sales');
    }

    public function test_delivering_a_commande_creates_a_vente(): void
    {
        // 1. Create an order
        $commande = Commande::factory()->create([
            'boutique_id' => $this->boutique->id,
            'statut' => 'en_attente',
            'montant_total' => 150.00,
        ]);

        LigneCommande::create([
            'commande_id' => $commande->id,
            'nom' => 'Article Custom 1',
            'quantite' => 2,
            'prix' => 50.00,
        ]);

        LigneCommande::create([
            'commande_id' => $commande->id,
            'nom' => 'Article Custom 2',
            'quantite' => 1,
            'prix' => 50.00,
        ]);

        // 2. Update status to 'livrée'
        $response = $this->actingAs($this->user)
            ->put(route('commandes.update', $commande), [
                'statut' => 'livrée',
                'lignes_commande' => [
                    ['id' => $commande->lignesCommande[0]->id, 'nom' => 'Article Custom 1', 'quantite' => 2, 'prix' => 50.00],
                    ['id' => $commande->lignesCommande[1]->id, 'nom' => 'Article Custom 2', 'quantite' => 1, 'prix' => 50.00],
                ],
            ]);

        $response->assertRedirect();

        // 3. Verify Vente creation
        $this->assertDatabaseHas('ventes', [
            'commande_id' => $commande->id,
            'client_id' => $commande->client_id,
            'montant_total' => 150.00,
            'statut' => 'complétée',
        ]);

        $vente = Vente::where('commande_id', $commande->id)->first();
        $this->assertCount(2, $vente->lignes);

        // Check if "Article Commande" product was used
        $this->assertDatabaseHas('produits', ['nom' => 'Article Commande']);

        $ligne1 = $vente->lignes()->where('designation_originale', 'Article Custom 1')->first();
        $this->assertNotNull($ligne1);
        $this->assertEquals(2, $ligne1->quantite);
        $this->assertEquals(50.00, $ligne1->prix_unitaire);
    }

    public function test_updating_already_delivered_order_does_not_create_duplicate_sale(): void
    {
        $commande = Commande::factory()->create([
            'boutique_id' => $this->boutique->id,
            'statut' => 'livrée',
        ]);

        Vente::factory()->create([
            'commande_id' => $commande->id,
            'boutique_id' => $this->boutique->id,
        ]);

        $this->actingAs($this->user)
            ->put(route('commandes.update', $commande), [
                'statut' => 'livrée',
                'observations' => 'Updated observation',
            ]);

        $this->assertEquals(1, Vente::where('commande_id', $commande->id)->count());
    }

    public function test_can_download_order_receipt(): void
    {
        $commande = Commande::factory()->create([
            'boutique_id' => $this->boutique->id,
            'statut' => 'en attente',
        ]);

        $response = $this->actingAs($this->user)->get("/commandes/{$commande->id}/receipt");

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }
}
