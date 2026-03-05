<?php

namespace App\Http\Controllers;

use App\Models\LigneVente;
use App\Models\Vente;
use App\Models\Produit;
use App\Models\Variante;
use App\Models\MouvementStock;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class RapportController extends Controller
{
    /**
     * Display the main reports dashboard.
     */
    public function index(Request $request): Response
    {
        // 1. Définition de la période
        $period = $request->input('period', 'month'); // Options: today, week, month, year, custom
        $dates = $this->getDateRange($period, $request);
        $startDate = $dates['start'];
        $endDate = $dates['end'];

        // 2. Chiffres clés (KPIs) des Ventes
        $ventesQuery = Vente::whereBetween('ventes.created_at', [$startDate, $endDate])
                            ->where('ventes.statut', '!=', 'annulée');

        $kpiVentes = [
            'total_ca' => (clone $ventesQuery)->sum('montant_total'),
            'nombre_ventes' => (clone $ventesQuery)->count(),
        ];

        // 3. Tendance des ventes (Graphique)
        $tendanceVentes = $this->getSalesTrend($startDate, $endDate, $period);

        // 4. Top Produits de la période
        $topProduits = LigneVente::with(['variante.produit', 'variante.taille'])
            ->whereHas('vente', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate, $endDate])
                  ->where('statut', '!=', 'annulée');
            })
            ->select('variante_id', DB::raw('SUM(quantite) as total_vendu'), DB::raw('SUM(sous_total) as ca_genere'))
            ->groupBy('variante_id')
            ->orderByDesc('total_vendu')
            ->take(5)
            ->get()
            ->map(function ($ligne) {
                $variante = $ligne->variante;
                $produitNom = $variante && $variante->produit ? $variante->produit->nom : 'Produit inconnu';
                $tailleNom = $variante && $variante->taille ? ' - ' . $variante->taille->nom : '';
                return [
                    'id' => $variante ? $variante->id : null,
                    'nom' => $produitNom . $tailleNom,
                    'total_vendu' => (int) $ligne->total_vendu,
                    'ca_genere' => (float) $ligne->ca_genere,
                ];
            });

        // 5. KPIs et Alertes de Stock (Indépendant de la période de vente)
        // Valeur globale du stock = Somme(Quantité * Prix Vente)
        $valeurGlobaleStock = Variante::sum(DB::raw('quantite * prix_vente'));
        
        // Alertes: Stock < 5 (Considéré critique ou rupture)
        $alertesStock = Variante::with(['produit', 'taille'])
            ->where('quantite', '<=', 5)
            ->orderBy('quantite', 'asc')
            ->take(10)
            ->get()
            ->map(function ($variante) {
                return [
                    'id' => $variante->id,
                    'produit' => $variante->produit ? $variante->produit->nom : 'Inconnu',
                    'taille' => $variante->taille ? $variante->taille->nom : 'Unique',
                    'quantite' => $variante->quantite,
                ];
            });

        // 6. Mouvements de stock récents
        $mouvementsRecents = MouvementStock::with(['produit', 'variante.taille', 'user'])
            ->latest()
            ->take(10)
            ->get();

        // 7. Ventes par Mode de Paiement
        $ventesParMode = (clone $ventesQuery)
            ->select('ventes.mode_paiement', DB::raw('SUM(ventes.montant_total) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('ventes.mode_paiement')
            ->get();

        // 8. Performance par Boutique
        $perfBoutiques = (clone $ventesQuery)
            ->join('boutiques', 'ventes.boutique_id', '=', 'boutiques.id')
            ->select('boutiques.nom', DB::raw('SUM(ventes.montant_total) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('boutiques.id', 'boutiques.nom')
            ->get();

        // 9. Ventes par Catégorie
        $ventesParCategorie = LigneVente::join('variantes', 'ligne_ventes.variante_id', '=', 'variantes.id')
            ->join('produits', 'variantes.produit_id', '=', 'produits.id')
            ->join('categories', 'produits.categorie_id', '=', 'categories.id')
            ->whereHas('vente', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate, $endDate])
                  ->where('statut', '!=', 'annulée');
            })
            ->select('categories.nom', DB::raw('SUM(ligne_ventes.sous_total) as total'), DB::raw('SUM(ligne_ventes.quantite) as qte'))
            ->groupBy('categories.id', 'categories.nom')
            ->orderByDesc('total')
            ->get();

        return Inertia::render('rapports/index', [
            'filters' => [
                'period' => $period,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
            'kpis' => [
                'ventes' => $kpiVentes,
                'stock_valeur' => $valeurGlobaleStock,
                'panier_moyen' => $kpiVentes['nombre_ventes'] > 0 ? $kpiVentes['total_ca'] / $kpiVentes['nombre_ventes'] : 0,
            ],
            'charts' => [
                'tendance_ventes' => $tendanceVentes,
                'par_mode' => $ventesParMode,
                'par_boutique' => $perfBoutiques,
                'par_categorie' => $ventesParCategorie,
            ],
            'top_produits' => $topProduits,
            'alertes_stock' => $alertesStock,
            'mouvements_recents' => $mouvementsRecents,
        ]);
    }

    /**
     * Determine start and end dates based on the requested period.
     */
    private function getDateRange(string $period, Request $request): array
    {
        $now = Carbon::now();
        
        switch ($period) {
            case 'today':
                return ['start' => $now->copy()->startOfDay(), 'end' => $now->copy()->endOfDay()];
            case 'week':
                return ['start' => $now->copy()->startOfWeek(), 'end' => $now->copy()->endOfWeek()];
            case 'year':
                return ['start' => $now->copy()->startOfYear(), 'end' => $now->copy()->endOfYear()];
            case 'custom':
                $start = $request->input('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : $now->copy()->startOfMonth();
                $end = $request->input('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : $now->copy()->endOfDay();
                return ['start' => $start, 'end' => $end];
            case 'month':
            default:
                return ['start' => $now->copy()->startOfMonth(), 'end' => $now->copy()->endOfMonth()];
        }
    }

    /**
     * Generate chart data for sales trend within the dates.
     */
    private function getSalesTrend(Carbon $startDate, Carbon $endDate, string $period): array
    {
        $diffInDays = $startDate->diffInDays($endDate);
        
        $periodType = 'day';

        if ($period === 'year' || $diffInDays > 60) {
            $periodType = 'month';
        }

        $ventes = Vente::whereBetween('created_at', [$startDate, $endDate])
            ->where('statut', '!=', 'annulée')
            ->get();

        $groupedVentes = $ventes->groupBy(function ($vente) use ($periodType) {
            return $periodType === 'month' 
                ? Carbon::parse($vente->created_at)->format('Y-m') 
                : Carbon::parse($vente->created_at)->format('Y-m-d');
        });

        // Format data for chart (Recharts)
        $chartData = [];
        
        // Sort keys (dates) and build the chart array
        $sortedKeys = $groupedVentes->keys()->sort();
        
        foreach ($sortedKeys as $key) {
            $group = $groupedVentes[$key];
            
            $label = $periodType === 'month' 
                ? Carbon::createFromFormat('Y-m', $key)->translatedFormat('M Y')
                : Carbon::createFromFormat('Y-m-d', $key)->translatedFormat('d M');
                
            $chartData[] = [
                'name' => $label,
                'ca' => (float) $group->sum('montant_total'),
                'raw_date' => $key
            ];
        }

        return $chartData;
    }
}
