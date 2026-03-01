import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart3,
    TrendingUp,
    ShoppingBag,
    Wallet,
    AlertTriangle,
    PackageOpen,
    ArrowRightLeft
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import RapportController from '@/actions/App/Http/Controllers/RapportController';
import MouvementStockController from '@/actions/App/Http/Controllers/MouvementStockController';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: '/dashboard' },
    { title: 'Rapports & Analyses', href: RapportController.index.url() },
];

interface KPIVentes {
    total_ca: number;
    nombre_ventes: number;
}

interface ChartData {
    name: string;
    ca: number;
    raw_date: string;
}

interface TopProduit {
    id: number | null;
    nom: string;
    total_vendu: number;
    ca_genere: number;
}

interface AlerteStock {
    id: number;
    produit: string;
    taille: string;
    quantite: number;
}

interface IndexProps {
    filters: {
        period: string;
        start_date: string;
        end_date: string;
    };
    kpis: {
        ventes: KPIVentes;
        stock_valeur: number;
    };
    charts: {
        tendance_ventes: ChartData[];
    };
    top_produits: TopProduit[];
    alertes_stock: AlerteStock[];
    mouvements_recents: {
        id: number;
        type: 'entrée' | 'sortie' | 'perte' | 'ajustement';
        quantite: number;
        created_at: string;
        produit: { nom: string };
        user: { name: string };
    }[];
}

export default function RapportsIndex({
    filters,
    kpis,
    charts,
    top_produits,
    alertes_stock,
    mouvements_recents
}: IndexProps) {

    const [period, setPeriod] = useState(filters.period);
    const [isCustom, setIsCustom] = useState(filters.period === 'custom');
    const [customStart, setCustomStart] = useState(filters.start_date || '');
    const [customEnd, setCustomEnd] = useState(filters.end_date || '');

    const handlePeriodChange = (val: string) => {
        setPeriod(val);
        if (val === 'custom') {
            setIsCustom(true);
        } else {
            setIsCustom(false);
            router.get(RapportController.index.url(), { period: val }, { preserveState: true });
        }
    };

    const applyCustomDates = () => {
        router.get(RapportController.index.url(), {
            period: 'custom',
            start_date: customStart,
            end_date: customEnd
        }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rapports & Analyses" />

            <div className="space-y-6 p-4 md:p-6 max-w-[1400px] pb-24">
                {/* En-tête et Filtres */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Analyses & Performances
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">Consultez l'état financier et matériel de votre boutique.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end gap-3">
                        <div className="space-y-1 w-full sm:w-auto">
                            <label className="text-xs font-medium text-muted-foreground">Période</label>
                            <Select value={period} onValueChange={handlePeriodChange}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Aujourd'hui</SelectItem>
                                    <SelectItem value="week">Cette semaine</SelectItem>
                                    <SelectItem value="month">Ce mois-ci</SelectItem>
                                    <SelectItem value="year">Cette année</SelectItem>
                                    <SelectItem value="custom">Personnalisé</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {isCustom && (
                            <div className="flex items-end gap-2 animate-in fade-in slide-in-from-left-4 w-full sm:w-auto">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Du</label>
                                    <Input
                                        type="date"
                                        value={customStart}
                                        onChange={e => setCustomStart(e.target.value)}
                                        className="text-sm h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Au</label>
                                    <Input
                                        type="date"
                                        value={customEnd}
                                        onChange={e => setCustomEnd(e.target.value)}
                                        className="text-sm h-9"
                                    />
                                </div>
                                <Button size="sm" onClick={applyCustomDates} className="h-9">Filtrer</Button>
                            </div>
                        )}
                    </div>
                </div>

                <Tabs defaultValue="resume" className="space-y-6">
                    <TabsList className="bg-muted p-1 h-auto grid grid-cols-3 w-full max-w-2xl mx-auto rounded-xl">
                        <TabsTrigger value="resume" className="py-2.5 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm font-medium transition-all">
                            <BarChart3 className="h-4 w-4 mr-2 hidden sm:inline" /> Résumé
                        </TabsTrigger>
                        <TabsTrigger value="ventes" className="py-2.5 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm font-medium transition-all">
                            <TrendingUp className="h-4 w-4 mr-2 hidden sm:inline" /> Ventes détaillées
                        </TabsTrigger>
                        <TabsTrigger value="stocks" className="py-2.5 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm font-medium transition-all">
                            <PackageOpen className="h-4 w-4 mr-2 hidden sm:inline" /> État des Stocks
                        </TabsTrigger>
                    </TabsList>

                    {/* ONGLET: RÉSUMÉ (KPIs + Graphiques) */}
                    <TabsContent value="resume" className="space-y-6 animate-in fade-in-50 duration-500">
                        {/* Cartes KPI */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="border-l-4 border-l-primary shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between space-y-0 pb-2">
                                        <p className="text-sm font-medium text-muted-foreground">Chiffre d'Affaires</p>
                                        <div className="p-2 bg-primary/10 rounded-full">
                                            <Wallet className="h-4 w-4 text-primary" />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold">{formatCurrency(kpis.ventes.total_ca)}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Sur la période ({kpis.ventes.nombre_ventes} ventes)</p>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-blue-500 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between space-y-0 pb-2">
                                        <p className="text-sm font-medium text-muted-foreground">Valeur Globale Stock</p>
                                        <div className="p-2 bg-blue-500/10 rounded-full">
                                            <PackageOpen className="h-4 w-4 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(kpis.stock_valeur)}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Indépendant de la période</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Graphiques & Top Produits */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 shadow-sm border-border/50">
                                <CardHeader>
                                    <CardTitle className="text-lg">Évolution du Chiffre d'Affaires</CardTitle>
                                    <CardDescription>Tendance des ventes générées sur la période sélectionnée.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] w-full">
                                        {charts.tendance_ventes.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={charts.tendance_ventes} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} opacity={0.6} />
                                                    <YAxis
                                                        fontSize={12}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickFormatter={(val) => `${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                                                        opacity={0.6}
                                                    />
                                                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                                                    <Tooltip
                                                        formatter={(value: number | string | undefined) => [formatCurrency(Number(value || 0)), "CA"]}
                                                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="ca"
                                                        stroke="hsl(var(--primary))"
                                                        strokeWidth={3}
                                                        fillOpacity={1}
                                                        fill="url(#colorCA)"
                                                        activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                                                Aucune donnée sur cette période
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-border/50">
                                <CardHeader className="pb-3 border-b">
                                    <CardTitle className="text-lg flex items-center">
                                        <ShoppingBag className="w-5 h-5 mr-2 text-primary" /> Top 5 Ventes
                                    </CardTitle>
                                    <CardDescription>Produits les plus vendus.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4 p-0">
                                    {top_produits.length > 0 ? (
                                        <div className="divide-y">
                                            {top_produits.map((prod, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                                                            #{i + 1}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm line-clamp-1">{prod.nom}</span>
                                                            <span className="text-xs text-muted-foreground">{prod.total_vendu} unités écoulées</span>
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-sm text-right">
                                                        {formatCurrency(prod.ca_genere)}
                                                        <div className="text-[10px] text-emerald-600 font-normal mt-0.5">de CA généré</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-muted-foreground text-sm">
                                            Aucune vente enregistrée pour ce top.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ONGLET: VENTES DETAILLEES (Placeholder - Expandable in future) */}
                    <TabsContent value="ventes" className="animate-in fade-in-50 duration-500">
                        <Card>
                            <CardHeader>
                                <CardTitle>Analyse granulaire des ventes</CardTitle>
                                <CardDescription>Consultez l'évolution en détail via vos factures dans le module Ventes.</CardDescription>
                            </CardHeader>
                            <CardContent className="py-12 flex flex-col items-center text-center">
                                <TrendingUp className="h-16 w-16 text-muted mb-4 opacity-50" />
                                <h3 className="text-xl font-bold">Pour des détails ligne par ligne...</h3>
                                <p className="text-muted-foreground max-w-sm mt-2 mb-6">Utilisez la vue principale des ventes pour filtrer les factures et reçus détaillés.</p>
                                <Link href="/ventes">
                                    <Button variant="outline">Aller aux factures de ventes</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ONGLET: STOCKS */}
                    <TabsContent value="stocks" className="animate-in fade-in-50 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Alertes de Stock */}
                            <Card className="shadow-sm border-rose-200">
                                <CardHeader className="bg-rose-50/50 pb-4 border-b">
                                    <CardTitle className="text-lg flex items-center text-rose-700">
                                        <AlertTriangle className="w-5 h-5 mr-2" /> Alertes / Ruptures de Stock
                                    </CardTitle>
                                    <CardDescription>Produits avec une quantité critique (≤ 5).</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {alertes_stock.length > 0 ? (
                                        <div className="divide-y">
                                            {alertes_stock.map((stock) => (
                                                <div key={stock.id} className="p-4 flex items-center justify-between hover:bg-muted/20">
                                                    <div>
                                                        <div className="font-semibold text-sm">{stock.produit}</div>
                                                        <span className="text-xs text-muted-foreground">Taille: {stock.taille}</span>
                                                    </div>
                                                    <Badge variant={stock.quantite <= 0 ? "destructive" : "outline"} className={stock.quantite > 0 ? "border-orange-300 text-orange-700 bg-orange-50" : ""}>
                                                        {stock.quantite} restant
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-emerald-600 font-medium">
                                            Tous les stocks sont à des niveaux sains ! 🎉
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Mouvements Récents */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-4 border-b flex flex-row items-center justify-between space-y-0">
                                    <div>
                                        <CardTitle className="text-lg flex items-center">
                                            <ArrowRightLeft className="w-5 h-5 mr-2" /> Récentes Opérations
                                        </CardTitle>
                                        <CardDescription>Les 10 derniers mouvements.</CardDescription>
                                    </div>
                                    <Link href={MouvementStockController.index.url()}>
                                        <Button variant="ghost" size="sm">Voir tout</Button>
                                    </Link>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {mouvements_recents.length > 0 ? (
                                        <div className="divide-y">
                                            {mouvements_recents.map((mvt) => (
                                                <div key={mvt.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm">{mvt.produit.nom}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(mvt.created_at).toLocaleDateString('fr-FR')} par {mvt.user.name}
                                                        </span>
                                                    </div>
                                                    <Badge variant="secondary" className={
                                                        mvt.type === 'entrée' ? 'bg-emerald-100 text-emerald-700' :
                                                            mvt.type === 'sortie' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                                    }>
                                                        {mvt.type === 'entrée' ? '+' : '-'}{Math.abs(mvt.quantite)} ({mvt.type})
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-muted-foreground text-sm">
                                            Aucun mouvement enregistré récemment.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
