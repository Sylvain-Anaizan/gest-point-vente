<?php

namespace Tests\Feature;

use App\Models\Boutique;
use App\Models\Categorie;
use App\Models\Produit;
use App\Models\SousCategorie;
use App\Models\Taille;
use App\Models\User;
use App\Models\Variante;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SousCategorieFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Boutique $boutique;

    protected Categorie $categorie;

    protected function setUp(): void
    {
        parent::setUp();

        $this->boutique = Boutique::factory()->create();
        $this->user = User::factory()->create([
            'boutique_id' => $this->boutique->id,
            'role' => 'employé',
        ]);
        $this->categorie = Categorie::factory()->create(['nom' => 'Chaussures']);

        \Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'manage products']);
        $this->user->givePermissionTo('manage products');

        $this->actingAs($this->user);
    }

    /** @test */
    public function it_can_store_a_produit_with_sous_categorie(): void
    {
        $sousCategorie = SousCategorie::factory()->create([
            'categorie_id' => $this->categorie->id,
            'nom' => 'Baskets',
        ]);
        $taille = Taille::factory()->create(['nom' => '42']);

        $response = $this->post(route('produits.store'), [
            'nom' => 'Air Max',
            'categorie_id' => $this->categorie->id,
            'sous_categorie_id' => $sousCategorie->id,
            'boutique_id' => $this->boutique->id,
            'description' => 'Une belle paire',
            'variantes' => [
                [
                    'taille_id' => $taille->id,
                    'prix_vente' => 50000,
                    'quantite' => 10,
                ],
            ],
        ]);

        $response->assertRedirect(route('produits.index'));
        $this->assertDatabaseHas('produits', [
            'nom' => 'Air Max',
            'sous_categorie_id' => $sousCategorie->id,
        ]);
    }

    /** @test */
    public function it_can_store_a_produit_without_sous_categorie(): void
    {
        $taille = Taille::factory()->create(['nom' => '42']);

        $response = $this->post(route('produits.store'), [
            'nom' => 'Sac générique',
            'categorie_id' => $this->categorie->id,
            'sous_categorie_id' => null,
            'boutique_id' => $this->boutique->id,
            'variantes' => [
                [
                    'taille_id' => $taille->id,
                    'prix_vente' => 25000,
                    'quantite' => 5,
                ],
            ],
        ]);

        $response->assertRedirect(route('produits.index'));
        $this->assertDatabaseHas('produits', [
            'nom' => 'Sac générique',
            'sous_categorie_id' => null,
        ]);
    }

    /** @test */
    public function it_shows_sous_categorie_on_produit_show_page(): void
    {
        $sousCategorie = SousCategorie::factory()->create([
            'categorie_id' => $this->categorie->id,
            'nom' => 'Mocassins',
        ]);
        $produit = Produit::factory()->create([
            'nom' => 'Mocassin Elite',
            'categorie_id' => $this->categorie->id,
            'sous_categorie_id' => $sousCategorie->id,
            'boutique_id' => $this->boutique->id,
        ]);
        Variante::factory()->create(['produit_id' => $produit->id]);

        $response = $this->get(route('produits.show', $produit));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('produits/show')
                ->has('produit')
                ->where('produit.sousCategorie.id', $sousCategorie->id)
                ->where('produit.sousCategorie.nom', 'Mocassins')
            );
    }

    /** @test */
    public function it_passes_sous_categories_to_create_page(): void
    {
        SousCategorie::factory()->count(3)->create([
            'categorie_id' => $this->categorie->id,
        ]);

        $response = $this->get(route('produits.create'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('produits/create')
                ->has('sousCategories', 3)
            );
    }

    /** @test */
    public function it_passes_sous_categories_to_edit_page(): void
    {
        $sousCategorie = SousCategorie::factory()->create([
            'categorie_id' => $this->categorie->id,
        ]);
        $produit = Produit::factory()->create([
            'categorie_id' => $this->categorie->id,
            'sous_categorie_id' => $sousCategorie->id,
            'boutique_id' => $this->boutique->id,
        ]);

        $response = $this->get(route('produits.edit', $produit));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('produits/edit')
                ->has('sousCategories')
                ->where('produit.sous_categorie_id', $sousCategorie->id)
            );
    }

    /** @test */
    public function it_shows_sous_categorie_on_index_page(): void
    {
        $sousCategorie = SousCategorie::factory()->create([
            'categorie_id' => $this->categorie->id,
            'nom' => 'Sandales',
        ]);
        $produit = Produit::factory()->create([
            'nom' => 'Sandale Été',
            'categorie_id' => $this->categorie->id,
            'sous_categorie_id' => $sousCategorie->id,
            'boutique_id' => $this->boutique->id,
        ]);
        Variante::factory()->create(['produit_id' => $produit->id]);

        $response = $this->get(route('produits.index'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('produits/index')
                ->has('produits.data', 1)
                ->where('produits.data.0.sousCategorie.nom', 'Sandales')
            );
    }

    /** @test */
    public function sous_categorie_belongs_to_categorie(): void
    {
        $sousCategorie = SousCategorie::factory()->create([
            'categorie_id' => $this->categorie->id,
            'nom' => 'Bottes',
        ]);

        $this->assertEquals($this->categorie->id, $sousCategorie->categorie_id);
        $this->assertInstanceOf(Categorie::class, $sousCategorie->categorie);
        $this->assertEquals('Chaussures', $sousCategorie->categorie->nom);
    }
}
