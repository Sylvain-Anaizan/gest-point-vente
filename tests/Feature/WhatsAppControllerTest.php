<?php

namespace Tests\Feature;

use App\Models\Categorie;
use App\Models\Client;
use App\Models\Produit;
use App\Models\User;
use App\Models\Variante;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WhatsAppControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a user for authentication
        $this->user = User::factory()->create();
        
        // Give the user the required permission
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'super_admin']);
        $permission = \Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'manage products']);
        $this->user->givePermissionTo($permission);
    }

    /** @test */
    public function it_can_generate_whatsapp_catalog_link()
    {
        $this->actingAs($this->user);

        // Create category with products
        $categorie = Categorie::factory()->create(['nom' => 'Vêtements']);
        $produit1 = Produit::factory()->create([
            'categorie_id' => $categorie->id,
            'nom' => 'T-Shirt',
        ]);
        Variante::factory()->create([
            'produit_id' => $produit1->id,
            'prix_vente' => 150,
            'quantite' => 10,
        ]);
        $produit2 = Produit::factory()->create([
            'categorie_id' => $categorie->id,
            'nom' => 'Pantalon',
        ]);
        Variante::factory()->create([
            'produit_id' => $produit2->id,
            'prix_vente' => 300,
            'quantite' => 5,
        ]);

        $response = $this->postJson(route('whatsapp.send-catalog'), [
            'categorie_id' => $categorie->id,
            'telephone' => '0612345678',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'whatsapp_link',
                'message',
                'products_count',
            ]);

        $data = $response->json();

        $this->assertTrue($data['success']);
        $this->assertEquals(2, $data['products_count']);
        $this->assertStringContainsString('wa.me', $data['whatsapp_link']);
        $this->assertStringContainsString('212612345678', $data['whatsapp_link']);
    }

    /** @test */
    public function it_formats_phone_number_correctly()
    {
        $this->actingAs($this->user);

        $categorie = Categorie::factory()->create();
        Produit::factory()->create(['categorie_id' => $categorie->id]);

        // Test with local format
        $response = $this->postJson(route('whatsapp.send-catalog'), [
            'categorie_id' => $categorie->id,
            'telephone' => '0612345678',
        ]);

        $this->assertStringContainsString('212612345678', $response->json('whatsapp_link'));

        // Test with international format
        $response = $this->postJson(route('whatsapp.send-catalog'), [
            'categorie_id' => $categorie->id,
            'telephone' => '+212612345678',
        ]);

        $this->assertStringContainsString('212612345678', $response->json('whatsapp_link'));
    }

    /** @test */
    public function it_can_use_client_phone_number()
    {
        $this->actingAs($this->user);

        $client = Client::factory()->create(['telephone' => '0698765432']);
        $categorie = Categorie::factory()->create();
        Produit::factory()->create(['categorie_id' => $categorie->id]);

        $response = $this->postJson(route('whatsapp.send-catalog'), [
            'categorie_id' => $categorie->id,
            'client_id' => $client->id,
        ]);

        $response->assertOk();
        $this->assertStringContainsString('212698765432', $response->json('whatsapp_link'));
    }

    /** @test */
    public function it_validates_required_fields()
    {
        $this->actingAs($this->user);

        $response = $this->postJson(route('whatsapp.send-catalog'), []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['categorie_id']);
    }

    /** @test */
    public function it_requires_phone_or_client()
    {
        $this->actingAs($this->user);

        $categorie = Categorie::factory()->create();

        $response = $this->postJson(route('whatsapp.send-catalog'), [
            'categorie_id' => $categorie->id,
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function it_can_get_categories_with_products()
    {
        $this->actingAs($this->user);

        $categorie1 = Categorie::factory()->create();
        $categorie2 = Categorie::factory()->create();
        $categorieEmpty = Categorie::factory()->create();

        Produit::factory()->count(3)->create(['categorie_id' => $categorie1->id]);
        Produit::factory()->count(2)->create(['categorie_id' => $categorie2->id]);

        $response = $this->getJson(route('whatsapp.categories'));

        $response->assertOk();
        $data = $response->json();

        $this->assertCount(2, $data); // Only categories with products
        $this->assertEquals(3, $data[0]['produits_count']);
    }

    /** @test */
    public function it_can_get_category_products()
    {
        $this->actingAs($this->user);

        $categorie = Categorie::factory()->create();
        $produit1 = Produit::factory()->create(['categorie_id' => $categorie->id]);
        $produit2 = Produit::factory()->create(['categorie_id' => $categorie->id]);

        $response = $this->getJson(route('whatsapp.category-products', [
            'categorie_id' => $categorie->id,
        ]));

        $response->assertOk();
        $data = $response->json();

        $this->assertCount(2, $data);
        $this->assertArrayHasKey('imageUrl', $data[0]);
    }

    /** @test */
    public function it_generates_correct_message_format()
    {
        $this->actingAs($this->user);

        $categorie = Categorie::factory()->create([
            'nom' => 'Électronique',
            'description' => 'Produits électroniques',
        ]);
        $produit = Produit::factory()->create([
            'categorie_id' => $categorie->id,
            'nom' => 'Smartphone',
            'description' => 'Dernier modèle',
        ]);
        Variante::factory()->create([
            'produit_id' => $produit->id,
            'prix_vente' => 2500,
            'quantite' => 5,
        ]);

        $response = $this->postJson(route('whatsapp.send-catalog'), [
            'categorie_id' => $categorie->id,
            'telephone' => '0612345678',
        ]);

        $message = $response->json('message');

        $this->assertStringContainsString('Catalogue Électronique', $message);
        $this->assertStringContainsString('1 photos disponibles', $message);
        $this->assertStringContainsString('Anaizan', $message);
    }
}
