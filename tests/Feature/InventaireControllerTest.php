<?php

namespace Tests\Feature;

use App\Models\Categorie;
use App\Models\Produit;
use App\Models\Taille;
use App\Models\User;
use App\Models\Variante;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventaireControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Need to seed permissions for the middleware to work
        $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);
        $this->app->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_user_can_view_inventory_if_they_have_permission(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('manage inventory');

        $categorie = Categorie::factory()->create(['nom' => 'Test Cat']);
        $produit = Produit::factory()->create(['nom' => 'Test Prod', 'categorie_id' => $categorie->id]);
        $taille = Taille::factory()->create(['nom' => 'M']);
        Variante::factory()->create([
            'produit_id' => $produit->id,
            'taille_id' => $taille->id,
            'quantite' => 10,
            'seuil_alerte' => 5,
        ]);

        $response = $this->actingAs($user)->get(route('inventaire.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Inventaire/Index')
            ->has('variantes', 1)
            ->where('variantes.0.produit', 'Test Prod')
        );
    }

    public function test_user_cannot_view_inventory_without_permission(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('inventaire.index'));

        $response->assertStatus(403);
    }

    public function test_user_can_update_alert_threshold(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('manage inventory');

        $variante = Variante::factory()->create(['seuil_alerte' => 5]);

        $response = $this->actingAs($user)->patch(route('inventaire.seuil', $variante), [
            'seuil_alerte' => 12,
        ]);

        $response->assertRedirect();
        $this->assertEquals(12, $variante->fresh()->seuil_alerte);
    }

    public function test_cannot_update_threshold_to_negative_value(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('manage inventory');

        $variante = Variante::factory()->create(['seuil_alerte' => 5]);

        $response = $this->actingAs($user)->patch(route('inventaire.seuil', $variante), [
            'seuil_alerte' => -1,
        ]);

        $response->assertSessionHasErrors(['seuil_alerte']);
    }

    public function test_inventory_does_not_crash_with_missing_relationships(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('manage inventory');

        // Product with no category
        // Créer un produit avec une catégorie (obligatoire)
        $categorie = Categorie::factory()->create();
        $produit = Produit::factory()->create([
            'categorie_id' => $categorie->id,
        ]);

        // Créer une variante avec une taille nulle (autorisé par la migration)
        $variante = Variante::factory()->create([
            'produit_id' => $produit->id,
            'taille_id' => null,
            'quantite' => 10,
        ]);

        $response = $this->actingAs($user)->get(route('inventaire.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Inventaire/Index')
            ->has('variantes', 1)
            ->where('variantes.0.categorie', $categorie->nom)
            ->where('variantes.0.taille', 'Unique')
        );
    }
}
