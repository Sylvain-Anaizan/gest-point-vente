import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { WhatsAppShareModal } from '@/components/whatsapp-share-modal';
import {
    ShoppingCart,
    Package,
    Users,
    AlertTriangle,
    TrendingUp,
    CreditCard,
    Receipt,
    Plus,
    BarChart3,
    Wallet,
    Banknote,
    Smartphone,
    Search,
    Calendar,
    Tag,
    MessageCircle,
    Store,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

// --- Interfaces ---
interface Stats {
    total_produits: number;
    total_stock_value: number;
    out_of_stock_products: number;
    low_stock_products: number;
    today_sales: number;
    month_sales: number;
    today_sales_count: number;
    yearly_revenue: number;
    total_clients: number;
    active_clients: number;
}
interface SalesChartData { date: string; formatted_date: string; total: number; }
interface LowStockProduct { id: number; nom: string; quantite: number; prix_vente: number; category: { nom: string; }; }
interface RecentSale { id: number; numero: string; montant_total: number | string; mode_paiement: string; created_at: string; client: { nom: string } | null; vendeur: string; produits_count: number; }
interface TopProduct { id: number; nom: string; total_vendu: number; total_revenus: number; }
interface TopCategory { id: number; nom: string; total_vendu: number; total_revenus: number; }
interface BoutiqueStat { id: number; nom: string; produits_count: number; }
interface Client { id: number; nom: string; telephone: string; email: string; }


export default function Dashboard({
    stats,
    salesChart,
    lowStockProducts,
    recentSales,
    topProducts,
    topCategories,
    boutiques,
    clients,
}: {
    stats: Stats;
    salesChart: SalesChartData[];
    lowStockProducts: LowStockProduct[];
    recentSales: RecentSale[];
    topProducts: TopProduct[];
    topCategories: TopCategory[];
    boutiques: BoutiqueStat[];
    clients: Client[];
}) {
    const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);

    // Évite la division par zéro
    const maxSalesValue = Math.max(...salesChart.map(d => d.total), 1);

    // Fonction pour formater les montants : pas de décimales, espaces pour les milliers
    const formatMontant = (montant: string | number | null | undefined): string => {
        // Vérifier et convertir en nombre si nécessaire
        let numericValue: number;

        if (typeof montant === 'string') {
            // Si c'est une chaîne, essayer de l'analyser
            const cleaned = montant.replace(/[^\d.,-]/g, '').replace(',', '.');
            numericValue = parseFloat(cleaned);
        } else if (typeof montant === 'number') {
            numericValue = montant;
        } else if (montant === null || montant === undefined) {
            return '0';
        } else {
            // Pour tout autre type, essayer de convertir
            numericValue = Number(montant);
        }

        // Vérifier si la conversion a réussi
        if (isNaN(numericValue)) {
            return '0';
        }

        // Arrondir et formater
        return Math.round(numericValue).toLocaleString('fr-FR');
    };

    const getPaymentIcon = (mode: string) => {
        switch (mode) {
            case 'espèces': return <Banknote className="h-4 w-4 text-emerald-600" />;
            case 'carte': return <CreditCard className="h-4 w-4 text-blue-600" />;
            case 'virement': return <Receipt className="h-4 w-4 text-purple-600" />;
            case 'mobile_money': return <Smartphone className="h-4 w-4 text-orange-600" />;
            default: return <Wallet className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord" />

            {/* Container principal avec overflow-hidden pour éviter le scroll horizontal global */}
            <div className="space-y-6 p-4 md:p-8 max-w-[100vw] overflow-x-hidden pb-24">

                {/* HEADER */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-gradient-to-r from-background to-muted/30 p-6 rounded-2xl border shadow-sm">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Tableau de bord</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Aperçu détaillé de l'activité commerciale.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto bg-background/80 backdrop-blur-md p-1.5 rounded-xl border shadow-sm">
                        <Calendar className="h-4 w-4 text-primary ml-2" />
                        <span className="text-sm font-semibold px-2 py-1 text-foreground">
                            {new Date().toLocaleDateString('fr-FR', {
                                weekday: 'short', day: 'numeric', month: 'short'
                            })}
                        </span>
                    </div>
                </div>

                {/* KPI CARDS (Grid 1 colonne mobile -> 2 tablette -> 4 desktop) */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Ventes Jour */}
                    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-primary">Ventes du jour</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-foreground">{formatMontant(stats.today_sales)} <span className="text-sm font-normal text-muted-foreground">F</span></div>
                            <p className="text-xs font-medium text-muted-foreground mt-1">
                                {stats.today_sales_count} transactions
                            </p>
                            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
                            <ShoppingCart className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 text-primary/20 transition-transform group-hover:scale-110" />
                        </CardContent>
                    </Card>

                    {/* Revenus Mois */}
                    <Card className="relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent hover:border-blue-500/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-blue-600 dark:text-blue-400">Ce mois-ci</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-foreground">{formatMontant(stats.month_sales)} <span className="text-sm font-normal text-muted-foreground">F</span></div>
                            <p className="text-xs font-medium text-muted-foreground mt-1">Revenus cumulés</p>
                            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
                            <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 text-blue-500/20 transition-transform group-hover:scale-110" />
                        </CardContent>
                    </Card>

                    {/* Valeur Stock */}
                    <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent hover:border-emerald-500/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Valeur Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-foreground">{formatMontant(stats.total_stock_value)} <span className="text-sm font-normal text-muted-foreground">F</span></div>
                            <p className="text-xs font-medium text-muted-foreground mt-1">{stats.total_produits} produits</p>
                            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
                            <Package className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 text-emerald-500/20 transition-transform group-hover:scale-110" />
                        </CardContent>
                    </Card>

                    {/* Clients */}
                    <Card className="relative overflow-hidden border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent hover:border-orange-500/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-orange-600 dark:text-orange-400">Clients Actifs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-foreground">{stats.active_clients}</div>
                            <p className="text-xs font-medium text-muted-foreground mt-1">Sur {stats.total_clients} total</p>
                            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />
                            <Users className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 text-orange-500/20 transition-transform group-hover:scale-110" />
                        </CardContent>
                    </Card>
                </div>

                {/* ACTIONS RAPIDES (Grid 2 cols Mobile / 4 cols Desktop) */}
                <div className="pt-2">
                    <h2 className="text-sm font-semibold mb-3 px-1 text-muted-foreground uppercase tracking-wider">Raccourcis</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link href="/ventes/create" className="group">
                            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 items-center justify-center border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 bg-background shadow-sm hover:shadow-md transition-all duration-300">
                                <Plus className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-semibold">Vente</span>
                            </Button>
                        </Link>
                        <Link href="/produits/create" className="group">
                            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 items-center justify-center border-dashed border-blue-500/30 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 bg-background shadow-sm hover:shadow-md transition-all duration-300">
                                <Package className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-semibold">Produit</span>
                            </Button>
                        </Link>
                        <Link href="/clients/create" className="group">
                            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 items-center justify-center border-dashed border-orange-500/30 hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-500/10 bg-background shadow-sm hover:shadow-md transition-all duration-300">
                                <Users className="h-6 w-6 text-orange-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-semibold">Client</span>
                            </Button>
                        </Link>
                        <Link href="/ventes" className="group">
                            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 items-center justify-center border-dashed border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 bg-background shadow-sm hover:shadow-md transition-all duration-300">
                                <Search className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-semibold">Recherche</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* ALERTES STOCK (Si nécessaire) */}
                {(stats.out_of_stock_products > 0 || stats.low_stock_products > 0) && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <div className="p-2 bg-white rounded-full shadow-sm shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-red-900">Alertes Stock</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {stats.out_of_stock_products > 0 && <Badge variant="destructive" className="text-[10px]">{stats.out_of_stock_products} Ruptures</Badge>}
                                {stats.low_stock_products > 0 && <Badge variant="outline" className="text-[10px] border-orange-500 text-orange-700 bg-white">{stats.low_stock_products} Faibles</Badge>}
                            </div>
                        </div>
                        <Link href="/produits" className="w-full sm:w-auto">
                            <Button size="sm" variant="outline" className="w-full border-red-200 text-red-700 bg-white hover:bg-red-50">
                                Voir
                            </Button>
                        </Link>
                    </div>
                )}

                {/* GRILLE CONTENU PRINCIPAL */}
                <div className="grid gap-6 grid-cols-1 xl:grid-cols-7">

                    {/* GRAPHIQUE DES VENTES (Colspan 4) */}
                    <Card className="xl:col-span-4 shadow-sm overflow-hidden border-border/50 hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-primary" />
                                Évolution (30 jours)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Scroll horizontal pour mobile : min-w-[600px] force le scroll si l'écran est petit */}
                            <ScrollArea className="w-full pb-4">
                                <div className="h-[200px] min-w-[600px] w-full pt-4 pr-4">
                                    {salesChart.length > 0 ? (
                                        <div className="flex h-full items-end gap-2">
                                            {salesChart.map((data, i) => (
                                                <div key={i} className="group relative flex h-full flex-1 flex-col justify-end">
                                                    <div className="w-full rounded-t-sm bg-primary/80 transition-all hover:bg-primary"
                                                        style={{ height: `${(data.total / maxSalesValue) * 100}%` }}
                                                    />
                                                    {/* Date en petit en bas */}
                                                    <span className="text-[9px] text-muted-foreground text-center mt-1 truncate w-full block">
                                                        {data.formatted_date.split(' ')[0]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                                            Pas de données
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                                <span className="text-muted-foreground">Total Annuel</span>
                                <span className="font-bold">{formatMontant(stats.yearly_revenue)} F</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* TOP PRODUITS (Colspan 3) */}
                    <Card className="xl:col-span-3 shadow-sm flex flex-col border-border/50 hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                                Top Produits
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <ScrollArea className="h-[280px]">
                                {topProducts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                                        <Package className="h-8 w-8 opacity-20 mb-2" />
                                        <p className="text-sm">Aucune vente</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {topProducts.map((product, index) => (
                                            <div key={product.id} className="flex items-center justify-between p-3 hover:bg-primary/5 transition-colors group">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className={cn(
                                                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                                        index === 0 ? "bg-yellow-100 text-yellow-700" :
                                                            index === 1 ? "bg-slate-100 text-slate-700" :
                                                                index === 2 ? "bg-orange-100 text-orange-700" :
                                                                    "bg-muted text-muted-foreground"
                                                    )}>
                                                        {index + 1}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate pr-2">{product.nom}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {product.total_vendu} ventes
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-xs font-semibold shrink-0">
                                                    {formatMontant(product.total_revenus)} F
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* STATS BOUTIQUES */}
                    <Card className="shadow-sm flex flex-col xl:col-span-7 border-border/50 hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Store className="h-4 w-4 text-emerald-500" />
                                Boutiques & Inventaire
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <ScrollArea className="h-[280px]">
                                {boutiques.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                                        <Store className="h-8 w-8 opacity-20 mb-2" />
                                        <p className="text-sm">Aucune boutique</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {boutiques.map((boutique) => (
                                            <div key={boutique.id} className="flex items-center justify-between p-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 transition-colors group">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                        <Store className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate pr-2">{boutique.nom}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {boutique.produits_count} produits référencés
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="shrink-0">
                                                    <Link href={`/boutiques/${boutique.id}`}>
                                                        <Button variant="ghost" size="sm" className="text-xs h-7">
                                                            Voir
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                        <Separator />
                        <div className="p-3 text-center">
                            <Link href="/boutiques">
                                <Button variant="link" size="sm" className="text-xs">
                                    Gérer les boutiques
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* NOUVELLE SECTION: TOP CATÉGORIES ET GRAPHIQUE */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* TOP CATÉGORIES */}
                    <Card className="shadow-sm flex flex-col border-border/50 hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Tag className="h-4 w-4 text-purple-500" />
                                Top Catégories
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <ScrollArea className="h-[280px]">
                                {topCategories.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                                        <Tag className="h-8 w-8 opacity-20 mb-2" />
                                        <p className="text-sm">Aucune vente</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {topCategories.map((category, index) => (
                                            <div key={category.id} className="flex items-center justify-between p-3 hover:bg-purple-50/50 dark:hover:bg-purple-500/10 transition-colors group">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className={cn(
                                                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                                        index === 0 ? "bg-yellow-100 text-yellow-700" :
                                                            index === 1 ? "bg-slate-100 text-slate-700" :
                                                                index === 2 ? "bg-orange-100 text-orange-700" :
                                                                    "bg-muted text-muted-foreground"
                                                    )}>
                                                        {index + 1}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate pr-2">{category.nom}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {category.total_vendu} articles vendus
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-xs font-semibold shrink-0">
                                                    {formatMontant(category.total_revenus)} F
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* DERNIÈRES VENTES */}
                    <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-emerald-600" />
                                Dernières Ventes
                            </CardTitle>
                            <Link href="/ventes" className="text-xs text-primary hover:underline">Voir tout</Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[300px]">
                                {recentSales.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-muted-foreground">Rien à afficher</div>
                                ) : (
                                    <div className="divide-y">
                                        {recentSales.map((sale) => (
                                            <div key={sale.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="h-8 w-8 shrink-0 rounded-full bg-muted flex items-center justify-center">
                                                        {getPaymentIcon(sale.mode_paiement)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {sale.client ? `${sale.client.nom}` : 'Client anonyme'}
                                                        </p>
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                            <span className="font-mono">{sale.numero}</span>
                                                            <span>•</span>
                                                            <span>{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-bold text-primary">
                                                        +{formatMontant(sale.montant_total)} F
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {sale.produits_count} art.
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* STOCK CRITIQUE */}
                    <Card className="shadow-sm border-orange-200 dark:border-orange-900/50 hover:shadow-orange-500/10 transition-shadow duration-300 bg-gradient-to-br from-orange-50/30 to-transparent dark:from-orange-950/20">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2 text-orange-700 dark:text-orange-400">
                                <AlertTriangle className="h-4 w-4" />
                                Stock Critique
                            </CardTitle>
                            <Link href="/produits" className="text-xs text-orange-600 hover:underline">Inventaire</Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[300px]">
                                {lowStockProducts.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-muted-foreground">Tout va bien</div>
                                ) : (
                                    <div className="divide-y">
                                        {lowStockProducts.map((product) => (
                                            <div key={product.id} className="p-3 flex items-center justify-between hover:bg-orange-50/50">
                                                <div className="min-w-0 pr-2">
                                                    <p className="text-sm font-medium truncate">{product.nom}</p>
                                                    <p className="text-[10px] text-muted-foreground">{product.category.nom}</p>
                                                </div>
                                                <Badge variant={product.quantite === 0 ? "destructive" : "outline"} className={cn(
                                                    "shrink-0 text-[10px] h-5",
                                                    product.quantite > 0 && "border-orange-200 text-orange-700 bg-orange-50"
                                                )}>
                                                    {product.quantite === 0 ? "0" : `${product.quantite} rest.`}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>



                {/* WhatsApp Catalog Section */}
                <div className="pt-4">
                    <h2 className="text-sm font-semibold mb-3 px-1 text-muted-foreground uppercase tracking-wider">Communication</h2>
                    <Button
                        onClick={() => setWhatsappModalOpen(true)}
                        className="w-full h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden group relative"
                    >
                        <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-base tracking-wide">Envoyer Catalogue WhatsApp</span>
                    </Button>
                </div>

            </div>

            {/* WhatsApp Modal */}
            <WhatsAppShareModal
                open={whatsappModalOpen}
                onOpenChange={setWhatsappModalOpen}
                clients={clients}
            />
        </AppLayout>
    );
}