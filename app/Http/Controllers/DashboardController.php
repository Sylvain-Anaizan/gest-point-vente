<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Produit;
use App\Models\Vente;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Statistiques générales
        $stats = $this->getGeneralStats();

        // Graphiques des ventes
        $salesChart = $this->getSalesChartData();

        // Produits avec stock faible
        $lowStockProducts = $this->getLowStockProducts();

        // Dernières ventes
        $recentSales = $this->getRecentSales();

        // Top produits vendus
        $topProducts = $this->getTopProducts();

        // Top catégories
        $topCategories = $this->getTopCategories();

        // Get all clients for WhatsApp modal
        $clients = Client::actifs()->orderBy('nom')->get(['id', 'nom', 'telephone', 'email']);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'salesChart' => $salesChart,
            'lowStockProducts' => $lowStockProducts,
            'recentSales' => $recentSales,
            'topProducts' => $topProducts,
            'topCategories' => $topCategories,
            'clients' => $clients,
            'boutiques' => $this->getBoutiqueStats(),
        ]);
    }

    private function getGeneralStats()
    {
        // Nombre total de produits
        $totalProduits = Produit::count();

        // Valeur totale du stock
        $totalStockValue = \App\Models\Variante::sum(DB::raw('prix_vente * quantite'));

        // Nombre de produits en rupture de stock (produits dont toutes les variantes sont à 0)
        $outOfStockProducts = Produit::whereDoesntHave('variantes', function ($query) {
            $query->where('quantite', '>', 0);
        })->count();

        // Nombre de produits avec stock faible (< 10 au total)
        // Utilisation d'une jointure ou whereHas avec condition sur la somme des quantités des variantes
        $lowStockProducts = Produit::whereHas('variantes', function ($query) {
            $query->select(DB::raw('SUM(quantite)'))
                ->havingRaw('SUM(quantite) > 0')
                ->havingRaw('SUM(quantite) < 10');
        })->count();

        // Ventes du jour
        $todaySales = Vente::whereDate('created_at', today())
            ->where('statut', 'complétée')
            ->sum('montant_total');

        // Ventes du mois
        $monthSales = Vente::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->where('statut', 'complétée')
            ->sum('montant_total');

        // Nombre de ventes aujourd'hui
        $todaySalesCount = Vente::whereDate('created_at', today())
            ->where('statut', 'complétée')
            ->count();

        // Chiffre d'affaires annuel
        $yearlyRevenue = Vente::whereYear('created_at', now()->year)
            ->where('statut', 'complétée')
            ->sum('montant_total');

        // Nombre total de clients
        $totalClients = Client::count();

        // Nombre de clients actifs (avec au moins une vente cette année)
        $activeClients = Client::withWhereHas('ventes', function ($query) {
            $query->whereYear('created_at', now()->year)
                ->where('statut', 'complétée');
        })->count();

        return [
            'total_produits' => $totalProduits,
            'total_stock_value' => $totalStockValue,
            'out_of_stock_products' => $outOfStockProducts,
            'low_stock_products' => $lowStockProducts,
            'today_sales' => $todaySales,
            'month_sales' => $monthSales,
            'today_sales_count' => $todaySalesCount,
            'yearly_revenue' => $yearlyRevenue,
            'total_clients' => $totalClients,
            'active_clients' => $activeClients,
        ];
    }

    private function getSalesChartData()
    {
        // Ventes des 30 derniers jours
        $salesData = Vente::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(montant_total) as total')
        )
            ->where('statut', 'complétée')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Remplir les jours manquants avec 0
        $chartData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $chartData[] = [
                'date' => $date,
                'formatted_date' => now()->subDays($i)->format('d/m'),
                'total' => $salesData->get($date)->total ?? 0,
            ];
        }

        return $chartData;
    }

    private function getLowStockProducts()
    {
        return Produit::with(['category'])
            ->withSum('variantes', 'quantite')
            ->having('variantes_sum_quantite', '>', 0)
            ->having('variantes_sum_quantite', '<', 10)
            ->limit(5)
            ->get()
            ->map(function ($produit) {
                return [
                    'id' => $produit->id,
                    'nom' => $produit->nom,
                    'quantite' => (int) $produit->variantes_sum_quantite,
                    'prix_vente' => $produit->prixMin,
                    'category' => $produit->category,
                ];
            })
            ->values();
    }

    private function getRecentSales()
    {
        return Vente::with(['client', 'user', 'lignes.produit'])
            ->where('statut', 'complétée')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($vente) {
                $montantTotal = is_numeric($vente->montant_total) ? (float) $vente->montant_total : 0;

                return [
                    'id' => $vente->id,
                    'numero' => $vente->numero,
                    'montant_total' => $montantTotal,
                    'mode_paiement' => $vente->mode_paiement,
                    'created_at' => $vente->created_at,
                    'client' => $vente->client,
                    'vendeur' => $vente->user->name,
                    'produits_count' => $vente->lignes->count(),
                ];
            })
            ->values();
    }

    private function getTopProducts()
    {
        return DB::table('ligne_ventes')
            ->join('produits', 'ligne_ventes.produit_id', '=', 'produits.id')
            ->join('ventes', 'ligne_ventes.vente_id', '=', 'ventes.id')
            ->where('ventes.statut', 'complétée')
            ->where('ventes.created_at', '>=', now()->subDays(30))
            ->select(
                'produits.id',
                'produits.nom',
                DB::raw('SUM(ligne_ventes.quantite) as total_vendu'),
                DB::raw('SUM(ligne_ventes.sous_total) as total_revenus')
            )
            ->groupBy('produits.id', 'produits.nom')
            ->orderBy('total_vendu', 'desc')
            ->limit(5)
            ->get();
    }

    private function getTopCategories()
    {
        return DB::table('ligne_ventes')
            ->join('produits', 'ligne_ventes.produit_id', '=', 'produits.id')
            ->join('categories', 'produits.categorie_id', '=', 'categories.id')
            ->join('ventes', 'ligne_ventes.vente_id', '=', 'ventes.id')
            ->where('ventes.statut', 'complétée')
            ->where('ventes.created_at', '>=', now()->subDays(30))
            ->select(
                'categories.id',
                'categories.nom',
                DB::raw('SUM(ligne_ventes.quantite) as total_vendu'),
                DB::raw('SUM(ligne_ventes.sous_total) as total_revenus')
            )
            ->groupBy('categories.id', 'categories.nom')
            ->orderBy('total_revenus', 'desc')
            ->limit(5)
            ->get();
    }

    private function getBoutiqueStats()
    {
        return \App\Models\Boutique::withCount('produits')
            ->get()
            ->map(fn ($boutique) => [
                'id' => $boutique->id,
                'nom' => $boutique->nom,
                'produits_count' => $boutique->produits_count,
            ])
            ->values();
    }
}
