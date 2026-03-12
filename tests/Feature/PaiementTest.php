<?php

namespace Tests\Feature;

use App\Models\Boutique;
use App\Models\Commande;
use App\Models\Paiement;
use App\Models\User;
use App\Models\Vente;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaiementTest extends TestCase
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

    public function test_can_list_paiements(): void
    {
        Paiement::factory()->count(3)->create([
            'boutique_id' => $this->boutique->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('paiements.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Paiements/Index')
            ->has('paiements.data', 3)
        );
    }

    public function test_can_filter_paiements_by_mode(): void
    {
        Paiement::factory()->create([
            'mode_paiement' => 'espèces',
            'boutique_id' => $this->boutique->id,
            'user_id' => $this->user->id,
        ]);

        Paiement::factory()->create([
            'mode_paiement' => 'carte',
            'boutique_id' => $this->boutique->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('paiements.index', ['mode' => 'espèces']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Paiements/Index')
            ->has('paiements.data', 1)
            ->where('paiements.data.0.mode_paiement', 'espèces')
        );
    }

    public function test_can_view_create_form(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('paiements.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Paiements/Create')
            ->has('ventes')
            ->has('commandes')
        );
    }

    public function test_can_store_paiement_for_vente(): void
    {
        $vente = Vente::factory()->create([
            'boutique_id' => $this->boutique->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('paiements.store'), [
                'montant' => 5000,
                'mode_paiement' => 'espèces',
                'date_paiement' => now()->format('Y-m-d H:i'),
                'vente_id' => $vente->id,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('paiements', [
            'montant' => 5000,
            'mode_paiement' => 'espèces',
            'vente_id' => $vente->id,
            'user_id' => $this->user->id,
        ]);
    }

    public function test_can_store_paiement_for_commande(): void
    {
        $commande = Commande::factory()->create([
            'boutique_id' => $this->boutique->id,
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('paiements.store'), [
                'montant' => 10000,
                'mode_paiement' => 'mobile_money',
                'reference' => 'REF-MM-001',
                'date_paiement' => now()->format('Y-m-d H:i'),
                'commande_id' => $commande->id,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('paiements', [
            'montant' => 10000,
            'mode_paiement' => 'mobile_money',
            'reference' => 'REF-MM-001',
            'commande_id' => $commande->id,
        ]);
    }

    public function test_store_validates_required_fields(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('paiements.store'), []);

        $response->assertSessionHasErrors(['montant', 'mode_paiement', 'date_paiement']);
    }

    public function test_store_validates_invalid_mode(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('paiements.store'), [
                'montant' => 5000,
                'mode_paiement' => 'invalid_mode',
                'date_paiement' => now()->format('Y-m-d H:i'),
            ]);

        $response->assertSessionHasErrors(['mode_paiement']);
    }

    public function test_can_show_paiement(): void
    {
        $paiement = Paiement::factory()->create([
            'boutique_id' => $this->boutique->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('paiements.show', $paiement));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Paiements/Show')
            ->has('paiement')
            ->where('paiement.id', $paiement->id)
        );
    }

    public function test_cannot_view_paiement_from_other_boutique(): void
    {
        $nonAdminUser = User::factory()->create([
            'role' => 'vendeur',
            'boutique_id' => $this->boutique->id,
        ]);
        $nonAdminUser->givePermissionTo('manage sales');

        $otherBoutique = Boutique::factory()->create();
        $paiement = Paiement::factory()->create([
            'boutique_id' => $otherBoutique->id,
        ]);

        $response = $this->actingAs($nonAdminUser)
            ->get(route('paiements.show', $paiement));

        $response->assertStatus(403);
    }

    public function test_can_delete_paiement(): void
    {
        $paiement = Paiement::factory()->create([
            'boutique_id' => $this->boutique->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('paiements.destroy', $paiement));

        $response->assertRedirect(route('paiements.index'));
        $this->assertDatabaseMissing('paiements', ['id' => $paiement->id]);
    }

    public function test_cannot_delete_paiement_from_other_boutique(): void
    {
        $nonAdminUser = User::factory()->create([
            'role' => 'vendeur',
            'boutique_id' => $this->boutique->id,
        ]);
        $nonAdminUser->givePermissionTo('manage sales');

        $otherBoutique = Boutique::factory()->create();
        $paiement = Paiement::factory()->create([
            'boutique_id' => $otherBoutique->id,
        ]);

        $response = $this->actingAs($nonAdminUser)
            ->delete(route('paiements.destroy', $paiement));

        $response->assertStatus(403);
        $this->assertDatabaseHas('paiements', ['id' => $paiement->id]);
    }
}
