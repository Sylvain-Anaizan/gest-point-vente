<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vente;
use App\Models\LigneVente;
use App\Models\Produit;
use App\Models\Variante;
use App\Models\Boutique;
use App\Models\Categorie;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class RapportTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private $variante1;
    private $varianteCritique;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        
        // Setup initial structure
        $boutique = Boutique::factory()->create();
        $categorie = Categorie::factory()->create();
        
        $produit1 = Produit::factory()->create([
            'boutique_id' => $boutique->id,
            'categorie_id' => $categorie->id,
            'nom' => 'Chaussure Test'
        ]);
        
        $this->variante1 = Variante::factory()->create([
            'produit_id' => $produit1->id,
            'prix_vente' => 15000,
            'quantite' => 10
        ]);

        $this->varianteCritique = Variante::factory()->create([
            'produit_id' => $produit1->id,
            'prix_vente' => 5000,
            'quantite' => 2 // Alerte stock
        ]);
    }

    public function test_can_view_rapports_index()
    {
        $response = $this->actingAs($this->admin)->get(route('rapports.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('rapports/index')
            ->has('kpis.ventes')
            ->has('kpis.stock_valeur')
            ->has('alertes_stock')
        );
    }

    public function test_it_calculates_kpi_correctly_for_current_month()
    {
        // Créer une vente aujourd'hui
        $vente = Vente::create([
            'numero' => 'FAC-001',
            'user_id' => $this->admin->id,
            'boutique_id' => $this->variante1->produit->boutique_id,
            'statut' => 'payée',
            'montant_total' => 30000,
            'mode_paiement' => 'espèces'
        ]);

        LigneVente::create([
            'vente_id' => $vente->id,
            'produit_id' => $this->variante1->produit_id,
            'variante_id' => $this->variante1->id,
            'quantite' => 2,
            'prix_unitaire' => 15000,
            'sous_total' => 30000
        ]);

        // Créer une vente annulée qui ne doit pas compter
        Vente::create([
            'numero' => 'FAC-002',
            'user_id' => $this->admin->id,
            'boutique_id' => $this->variante1->produit->boutique_id,
            'statut' => 'annulée',
            'montant_total' => 50000,
        ]);

        $response = $this->actingAs($this->admin)->get(route('rapports.index', ['period' => 'month']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('kpis.ventes.total_ca', 30000)
            ->where('kpis.ventes.nombre_ventes', 1) // sans l'annulée
            ->has('alertes_stock', 1)
            ->where('alertes_stock.0.id', $this->varianteCritique->id) // Quantité 2
        );
    }

    public function test_it_filters_by_custom_dates_correctly()
    {
        // Vente passée (il y a 2 mois)
        $pastDate = Carbon::now()->subMonths(2)->startOfMonth()->addDays(2);
        
        $ventePast = Vente::create([
            'numero' => 'FAC-PAST',
            'user_id' => $this->admin->id,
            'boutique_id' => $this->variante1->produit->boutique_id,
            'statut' => 'payée',
            'montant_total' => 10000,
            'created_at' => $pastDate,
            'updated_at' => $pastDate
        ]);

        // Filtre spécifique testant juste ce mois
        $start = $pastDate->copy()->startOfMonth()->format('Y-m-d');
        $end = $pastDate->copy()->endOfMonth()->format('Y-m-d');
        
        // Force db re-read for proper bounds validation
        Vente::where('id', $ventePast->id)->update(['created_at' => $pastDate]);

        $response = $this->actingAs($this->admin)->get(route('rapports.index', [
            'period' => 'custom',
            'start_date' => $start,
            'end_date' => $end
        ]));

        $response->assertStatus(200);
        
        // This validates if the aggregate sums match the exact date filtered boundary
        $response->assertInertia(fn ($page) => $page
            ->where('kpis.ventes.total_ca', 10000)
        );
    }
}
