import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
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
    Calendar,
    Tag,
    Store,
    Star,
    Trophy,
    History,
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
interface TopProduct { id: number; nom: string; total_vendu: number; total_revenus: number; categorie?: string; }
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
    //const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);

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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-gradient-to-r from-white to-white/30 p-4 md:p-6 rounded-2xl border shadow-sm">
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
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Ventes Jour - Glassmorphism & Gradient Primary */}
                    <Card className="group relative overflow-hidden border-0 bg-white/50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-zinc-900/50">
                        <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="relative flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 shadow-inner dark:bg-indigo-500/20 dark:text-indigo-400">
                                <ShoppingCart className="h-7 w-7 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                            </div>
                            <div>
                                <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Ventes Jour</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-2xl font-bold tracking-tight">{formatMontant(stats.today_sales)} F</h3>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-indigo-500/10">
                            <div className="h-full w-[65%] rounded-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-1000 group-hover:w-[75%]" />
                        </div>
                    </Card>

                    {/* Revenus Mois - Glassmorphism & Gradient Blue */}
                    <Card className="group relative overflow-hidden border-0 bg-white/50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-zinc-900/50">
                        <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-transparent to-cyan-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="relative flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 shadow-inner dark:bg-blue-500/20 dark:text-blue-400">
                                <TrendingUp className="h-7 w-7 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
                            </div>
                            <div>
                                <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">C.A Mois</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-2xl font-bold tracking-tight">{formatMontant(stats.month_sales)} F</h3>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-blue-500/10">
                            <div className="h-full w-[45%] rounded-full bg-linear-to-r from-blue-500 to-cyan-500 transition-all duration-1000 group-hover:w-[55%]" />
                        </div>
                    </Card>

                    {/* Valeur Stock - Glassmorphism & Gradient Emerald */}
                    <Card className="group relative overflow-hidden border-0 bg-white/50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-zinc-900/50">
                        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 via-transparent to-teal-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="relative flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 shadow-inner dark:bg-emerald-500/20 dark:text-emerald-400">
                                <Package className="h-7 w-7 transition-transform duration-500 group-hover:scale-110" />
                            </div>
                            <div>
                                <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Stock Total</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-2xl font-bold tracking-tight">{formatMontant(stats.total_stock_value)} F</h3>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-emerald-500/10">
                            <div className="h-full w-[80%] rounded-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-1000 group-hover:w-[90%]" />
                        </div>
                    </Card>

                    {/* Clients Actifs - Glassmorphism & Gradient Orange */}
                    <Card className="group relative overflow-hidden border-0 bg-white/50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-zinc-900/50">
                        <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 via-transparent to-amber-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="relative flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 shadow-inner dark:bg-orange-500/20 dark:text-orange-400">
                                <Users className="h-7 w-7 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                            </div>
                            <div>
                                <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Clients</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-2xl font-bold tracking-tight">{stats.active_clients}</h3>
                                    <span className="flex items-center text-xs font-semibold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                                        Actifs
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-orange-500/10">
                            <div className="h-full w-[55%] rounded-full bg-linear-to-r from-orange-500 to-amber-500 transition-all duration-1000 group-hover:w-[65%]" />
                        </div>
                    </Card>
                </div>

                {/* ACTIONS RAPIDES */}
                <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h2 className="text-xs font-bold mb-4 px-1 text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                        Accès Rapide
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/ventes/create" className="group">
                            <Card className="h-24 flex flex-col gap-2 items-center justify-center border-0 bg-white/50 shadow-sm hover:shadow-lg hover:bg-indigo-500 hover:text-white transition-all duration-500 dark:bg-zinc-900/50 dark:hover:bg-indigo-600">
                                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                    <Plus className="h-6 w-6 transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Nouvelle Vente</span>
                            </Card>
                        </Link>
                        <Link href="/produits/create" className="group">
                            <Card className="h-24 flex flex-col gap-2 items-center justify-center border-0 bg-white/50 shadow-sm hover:shadow-lg hover:bg-blue-500 hover:text-white transition-all duration-500 dark:bg-zinc-900/50 dark:hover:bg-blue-600">
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                    <Package className="h-6 w-6 transition-transform duration-500 group-hover:scale-110" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Nouveau Produit</span>
                            </Card>
                        </Link>
                        <Link href="/clients/create" className="group">
                            <Card className="h-24 flex flex-col gap-2 items-center justify-center border-0 bg-white/50 shadow-sm hover:shadow-lg hover:bg-orange-500 hover:text-white transition-all duration-500 dark:bg-zinc-900/50 dark:hover:bg-orange-600">
                                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                    <Users className="h-6 w-6 transition-transform duration-500 group-hover:scale-110" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Nouveau Client</span>
                            </Card>
                        </Link>
                        <Link href="/mouvements" className="group">
                            <Card className="h-24 flex flex-col gap-2 items-center justify-center border-0 bg-white/50 shadow-sm hover:shadow-lg hover:bg-emerald-500 hover:text-white transition-all duration-500 dark:bg-zinc-900/50 dark:hover:bg-emerald-600">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                    <History className="h-6 w-6 transition-transform duration-500 group-hover:scale-110" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Mouvement de Stock</span>
                            </Card>
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
                    <Card className="xl:col-span-4 relative overflow-hidden border-0 bg-white/50 shadow-sm dark:bg-zinc-900/50 group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                            <BarChart3 className="h-24 w-24 text-indigo-500" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                Évolution des Ventes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="w-full pb-4">
                                <div className="h-[240px] min-w-[600px] w-full pt-8 pr-4">
                                    {salesChart.length > 0 ? (
                                        <div className="flex h-full items-end gap-3 px-2">
                                            {salesChart.map((data, i) => (
                                                <div key={i} className="group/bar relative flex h-full flex-1 flex-col justify-end">
                                                    {/* Tooltip on hover */}
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 scale-90 group-hover/bar:scale-100">
                                                        {formatMontant(data.total)} F
                                                    </div>
                                                    <div className="w-full rounded-t-lg bg-linear-to-t from-indigo-500/80 to-purple-500/80 transition-all duration-500 hover:from-indigo-500 hover:to-purple-500 group-hover/bar:scale-x-110 shadow-sm"
                                                        style={{ height: `${(data.total / maxSalesValue) * 100}%` }}
                                                    />
                                                    <span className="text-[10px] font-medium text-muted-foreground text-center mt-3 truncate w-full block">
                                                        {data.formatted_date.split(' ')[0]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground bg-zinc-100/50 dark:bg-zinc-800/50 rounded-xl border border-dashed">
                                            Aucune donnée disponible
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            <Separator className="my-4 opacity-50" />
                            <div className="flex justify-between items-center p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Annuel</span>
                                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{formatMontant(stats.yearly_revenue)} F</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* TOP PRODUITS (Colspan 3) */}
                    <Card className="xl:col-span-3 border-0 bg-white/50 shadow-sm dark:bg-zinc-900/50 overflow-hidden flex flex-col group">
                        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                            <CardTitle className="text-lg font-bold flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                        <Star className="h-5 w-5" />
                                    </div>
                                    Top Produits
                                </div>
                                <Trophy className="h-5 w-5 text-yellow-500 opacity-50" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            <ScrollArea className="h-[340px]">
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {topProducts.length > 0 ? (
                                        topProducts.map((p, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 hover:bg-orange-500/5 transition-all duration-300 group/item">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={cn(
                                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold transition-all duration-300",
                                                        i === 0 ? "bg-yellow-500 text-white shadow-sm shadow-yellow-500/30 scale-110" :
                                                            i === 1 ? "bg-slate-400 text-white shadow-sm shadow-slate-400/30" :
                                                                i === 2 ? "bg-orange-400 text-white shadow-sm shadow-orange-400/30" :
                                                                    "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                                                    )}>
                                                        {i + 1}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm truncate group-hover/item:text-orange-600 transition-colors">{p.nom}</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{p.categorie}</p>
                                                            {i < 3 && <Badge className="h-4 text-[8px] bg-emerald-500/10 text-emerald-600 border-0">Top Tier</Badge>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0 ml-2">
                                                    <p className="text-sm font-black">{p.total_vendu} v.</p>
                                                    <p className="text-[10px] font-bold text-zinc-400">{formatMontant(p.total_revenus)} F</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center text-muted-foreground text-sm italic">
                                            Pas encore de ventes
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* STATS BOUTIQUES */}
                    <Card className="xl:col-span-7 border-0 bg-white/50 shadow-sm dark:bg-zinc-900/50 overflow-hidden group/main">
                        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <CardTitle className="text-lg font-bold flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        <Store className="h-5 w-5" />
                                    </div>
                                    Boutiques & Inventaire
                                </div>
                                <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-600">Vue d'ensemble</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[300px]">
                                <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-zinc-100 dark:divide-zinc-800">
                                    {boutiques.length > 0 ? (
                                        boutiques.map((boutique) => (
                                            <div key={boutique.id} className="flex items-center justify-between p-5 hover:bg-emerald-500/5 transition-all duration-300 group/boutique">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner group-hover/boutique:bg-emerald-100 dark:bg-zinc-800 dark:text-emerald-400">
                                                        <Store className="h-6 w-6 transition-transform duration-500 group-hover/boutique:scale-110" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-base truncate group-hover/boutique:text-emerald-600 transition-colors uppercase tracking-tight">{boutique.nom}</p>
                                                        <p className="text-xs text-muted-foreground font-medium">
                                                            {boutique.produits_count} références actives
                                                        </p>
                                                    </div>
                                                </div>
                                                <Link href={`/boutiques/${boutique.id}`}>
                                                    <Button variant="ghost" size="sm" className="rounded-xl hover:bg-emerald-500 hover:text-white transition-all duration-300">
                                                        Détails
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 p-12 text-center text-muted-foreground text-sm italic">
                                            Aucune boutique configurée
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                        <Separator className="opacity-50" />
                        <div className="p-4 flex justify-center bg-zinc-50/50 dark:bg-zinc-800/30">
                            <Link href="/boutiques">
                                <Button variant="link" size="sm" className="text-xs font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700">
                                    Gérer toutes les boutiques →
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* NOUVELLE SECTION: TOP CATÉGORIES ET GRAPHIQUE */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* TOP CATÉGORIES */}
                    <Card className="border-0 bg-white/50 shadow-sm dark:bg-zinc-900/50 overflow-hidden flex flex-col group">
                        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-purple-50/30 dark:bg-purple-900/10">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                    <Tag className="h-5 w-5" />
                                </div>
                                Performance Catégories
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            <ScrollArea className="h-[300px]">
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {topCategories.length > 0 ? (
                                        topCategories.map((cat, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 hover:bg-purple-500/5 transition-all duration-300 group/cat">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-100 text-purple-600 font-black dark:bg-zinc-800">
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm group-hover/cat:text-purple-600 transition-colors uppercase tracking-tight">{cat.nom}</p>
                                                        <div className="h-1.5 w-32 bg-zinc-100 rounded-full mt-1 overflow-hidden dark:bg-zinc-800 shadow-inner">
                                                            <div className="h-full bg-linear-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (cat.total_vendu / 100) * 100)}%` }} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black">{cat.total_vendu} v.</p>
                                                    <p className="text-[10px] font-bold text-purple-500">{formatMontant(cat.total_revenus)} F</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center text-muted-foreground text-sm italic">
                                            Données insuffisantes
                                        </div>
                                    )}
                                </div>
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



                {/* <div className="pt-4">
                    <h2 className="text-sm font-semibold mb-3 px-1 text-muted-foreground uppercase tracking-wider">Communication</h2>
                    <Button
                        onClick={() => setWhatsappModalOpen(true)}
                        className="w-full h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden group relative"
                    >
                        <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-base tracking-wide">Envoyer Catalogue WhatsApp</span>
                    </Button>
                </div> */}

            </div>

            {/* <WhatsAppShareModal
                open={whatsappModalOpen}
                onOpenChange={setWhatsappModalOpen}
                clients={clients}
            /> */}
        </AppLayout>
    );
}