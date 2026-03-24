<?php

namespace Tests\Feature;

use App\Models\Boutique;
use App\Models\Categorie;
use App\Models\Produit;
use App\Models\User;
use App\Models\Variante;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class MouvementStockTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Produit $produit;

    private Variante $variante;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        Permission::create(['name' => 'manage products']);
        $this->admin->givePermissionTo('manage products');

        $boutique = Boutique::factory()->create();
        $categorie = Categorie::factory()->create();

        $this->produit = Produit::factory()->create([
            'boutique_id' => $boutique->id,
            'categorie_id' => $categorie->id,
        ]);

        $this->variante = Variante::factory()->create([
            'produit_id' => $this->produit->id,
            'quantite' => 10,
        ]);
    }

    public function test_can_view_mouvements_index()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('mouvements-stock.index'));

        $response->assertStatus(200);
    }

    public function test_can_view_mouvements_create()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('mouvements-stock.create'));

        $response->assertStatus(200);
    }

    public function test_can_store_entree_mouvement_and_increase_stock()
    {
        $initialStock = $this->variante->quantite; // 10

        $response = $this->actingAs($this->admin)
            ->post(route('mouvements-stock.store'), [
                'produit_id' => $this->produit->id,
                'variante_id' => $this->variante->id,
                'quantite' => 5,
                'type' => 'entrée',
                'commentaire' => 'Test entrée',
            ]);

        $response->assertRedirect(route('mouvements-stock.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('mouvement_stocks', [
            'variante_id' => $this->variante->id,
            'quantite' => 5,
            'type' => 'entrée',
        ]);

        $this->assertEquals($initialStock + 5, $this->variante->fresh()->quantite);
    }

    public function test_can_store_sortie_mouvement_and_decrease_stock()
    {
        $initialStock = $this->variante->quantite; // 10

        $response = $this->actingAs($this->admin)
            ->post(route('mouvements-stock.store'), [
                'produit_id' => $this->produit->id,
                'variante_id' => $this->variante->id,
                'quantite' => 3,
                'type' => 'sortie',
            ]);

        $response->assertRedirect(route('mouvements-stock.index'));

        $this->assertEquals($initialStock - 3, $this->variante->fresh()->quantite);
    }

    public function test_cannot_store_sortie_with_insufficient_stock()
    {
        $initialStock = $this->variante->quantite; // 10

        $response = $this->actingAs($this->admin)
            ->post(route('mouvements-stock.store'), [
                'produit_id' => $this->produit->id,
                'variante_id' => $this->variante->id,
                'quantite' => 15, // Plus que le stock dispo
                'type' => 'sortie',
            ]);

        $response->assertSessionHas('error');

        // Use fresh() to get the actual column value from db.
        $this->assertEquals($initialStock, $this->variante->fresh()->quantite);
    }
}
