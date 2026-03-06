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
    Wallet,
    AlertTriangle,
    PackageOpen,
    ArrowRightLeft,
    Store,
    Target,
    Zap
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import RapportController from '@/actions/App/Http/Controllers/RapportController';
import MouvementStockController from '@/actions/App/Http/Controllers/MouvementStockController';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';

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
        panier_moyen: number;
    };
    charts: {
        tendance_ventes: ChartData[];
        par_mode: { mode_paiement: string; total: number; count: number; }[];
        par_boutique: { nom: string; total: number; count: number; }[];
        par_categorie: { nom: string; total: number; qte: number; }[];
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

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const pieData = useMemo(() =>
        charts.par_mode.map(item => ({
            name: item.mode_paiement,
            value: item.total
        }))
        , [charts.par_mode]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rapports & Analyses" />

            <div className="space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto pb-32 animate-in fade-in duration-700">
                {/* SECTION 1: HEADER & FILTRES */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                            <Target className="size-3" />
                            Business Intelligence
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">Rapports</h1>
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                            <div className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            Analyse complète des performances et stocks.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 bg-white/50 dark:bg-zinc-900/80 backdrop-blur-xl p-2 rounded-sm border border-white/20 dark:border-zinc-800/50 shadow-sm w-full lg:w-auto">
                        <div className="space-y-1 w-full sm:w-[180px]">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Période</label>
                            <Select value={period} onValueChange={handlePeriodChange}>
                                <SelectTrigger className="h-10 bg-white dark:bg-zinc-800/50 border-white/20 dark:border-zinc-700/50 rounded-lg font-bold text-xs">
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="today">Aujourd'hui</SelectItem>
                                    <SelectItem value="week">Cette semaine</SelectItem>
                                    <SelectItem value="month">Ce mois-ci</SelectItem>
                                    <SelectItem value="year">Cette année</SelectItem>
                                    <SelectItem value="custom">Personnalisé</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {isCustom && (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 animate-in slide-in-from-right-4 fade-in duration-300 w-full">
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Du</label>
                                    <Input
                                        type="date"
                                        value={customStart}
                                        onChange={e => setCustomStart(e.target.value)}
                                        className="h-10 bg-white/50 dark:bg-zinc-800/50 border-white/20 dark:border-zinc-700/50 rounded-xl text-xs font-bold w-full"
                                    />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Au</label>
                                    <Input
                                        type="date"
                                        value={customEnd}
                                        onChange={e => setCustomEnd(e.target.value)}
                                        className="h-10 bg-white/50 dark:bg-zinc-800/50 border-white/20 dark:border-zinc-700/50 rounded-xl text-xs font-bold w-full"
                                    />
                                </div>
                                <Button size="sm" onClick={applyCustomDates} className="h-10 rounded-xl bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 font-black uppercase tracking-widest text-[10px] px-6 w-full sm:w-auto">
                                    OK
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* SECTION 2: TABS NAVIGATION */}
                <Tabs defaultValue="resume" className="space-y-8">
                    <div className="overflow-x-auto pb-2 scrollbar-none">
                        <TabsList className="bg-white dark:bg-zinc-950/40 backdrop-blur-md py-6 h-auto inline-flex rounded-2xl border border-white/20 dark:border-hinc-800/50 shadow-inner min-w-full sm:min-w-0">
                            <TabsTrigger value="resume" className="px-6 py-6 rounded-xl transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 text-xs font-black uppercase tracking-widest whitespace-nowrap">
                                <BarChart3 className="size-4 mr-2" /> Vue d'ensemble
                            </TabsTrigger>
                            <TabsTrigger value="ventes" className="px-6 py-6 rounded-xl transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 text-xs font-black uppercase tracking-widest whitespace-nowrap">
                                <TrendingUp className="size-4 mr-2" /> Ventes & Marges
                            </TabsTrigger>
                            <TabsTrigger value="stocks" className="px-6 py-6 rounded-xl transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 text-xs font-black uppercase tracking-widest whitespace-nowrap">
                                <PackageOpen className="size-4 mr-2" /> Inventaire
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* ONGLET 1: RÉSUMÉ (KPIs + Graphiques) */}
                    <TabsContent value="resume" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        {/* KPI CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: "Revenue Total", value: formatCurrency(kpis.ventes.total_ca), sub: `${kpis.ventes.nombre_ventes} ventes`, icon: <Wallet />, color: "bg-emerald-500", shadow: "shadow-emerald-500/20" },
                                { label: "Panier Moyen", value: formatCurrency(kpis.panier_moyen), sub: "Par client", icon: <Zap />, color: "bg-indigo-500", shadow: "shadow-indigo-500/20" },
                                { label: "Valeur du Stock", value: formatCurrency(kpis.stock_valeur), sub: "Total actifs", icon: <PackageOpen />, color: "bg-blue-500", shadow: "shadow-blue-500/20" },
                                { label: "Performance", value: period === 'today' ? "LIVE" : "PÉRIODE", sub: period.toUpperCase(), icon: <TrendingUp />, color: "bg-orange-500", shadow: "shadow-orange-500/20" },
                            ].map((kpi, i) => (
                                <Card key={i} className="group relative overflow-hidden rounded-lg bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/40 dark:border-zinc-800/40 shadow-sm transition-all hover:scale-105">
                                    <div className={cn("absolute top-0 right-0 size-24 blur-3xl opacity-10 -mr-6 -mt-6", kpi.color)} />
                                    <CardContent className="">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={cn("size-12 rounded-lg flex items-center justify-center text-white", kpi.color, kpi.shadow)}>
                                                {kpi.icon}
                                            </div>
                                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                                                {kpi.label}
                                            </div>
                                        </div>
                                        <div className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 mb-1">
                                            {kpi.value}
                                        </div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                                            {kpi.sub}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* CHARTS GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Revenue Evolution Card */}
                            <Card className="lg:col-span-2 rounded-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-sm overflow-hidden">
                                <CardHeader className="">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-100 italic">Flux de revenus</CardTitle>
                                            <CardDescription className="text-xs font-medium">Analyse temporelle des performances directes</CardDescription>
                                        </div>
                                        <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <TrendingUp className="size-5 text-indigo-500" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="">
                                    <div className="h-[350px] w-full">
                                        {charts.tendance_ventes.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={charts.tendance_ventes} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 700 }} />
                                                    <YAxis hide />
                                                    <Tooltip
                                                        cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                return (
                                                                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg shadow-lg">
                                                                        <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">{payload[0].payload.name}</div>
                                                                        <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(payload[0].value as number)}</div>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="ca"
                                                        stroke="#6366f1"
                                                        strokeWidth={4}
                                                        fillOpacity={1}
                                                        fill="url(#colorCA)"
                                                        animationDuration={2000}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-[2rem] bg-zinc-50/50 dark:bg-zinc-800/10">
                                                <BarChart3 className="size-12 opacity-20 mb-4" />
                                                <span className="font-black uppercase tracking-widest text-xs opacity-40">Pas de data disponible</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Mode Distribution */}
                            <Card className="rounded-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-xl font-black uppercase tracking-widest italic">Encaissements</CardTitle>
                                    <CardDescription className="text-xs">Répartition par mode de paiement</CardDescription>
                                </CardHeader>
                                <CardContent className="">
                                    <div className="h-[250px] w-full flex items-center justify-center">
                                        {pieData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={pieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={8}
                                                        dataKey="value"
                                                        animationDuration={1500}
                                                        cornerRadius={8}
                                                    >
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-center opacity-40">--</div>
                                        )}
                                    </div>
                                    <div className="space-y-3 mt-4">
                                        {charts.par_mode.map((mode, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">{mode.mode_paiement}</span>
                                                </div>
                                                <span className="text-xs font-black">{formatCurrency(mode.total)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* SECOND ROW: TOP PRODUCTS + BOUTIQUES */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="rounded-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-sm overflow-hidden">
                                <CardHeader className="p-8 border-b border-white/10">
                                    <CardTitle className="text-xl font-black uppercase tracking-widest italic flex items-center gap-3">
                                        <Zap className="size-5 text-indigo-500" /> Produits les plus vendus
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {top_produits.map((prod, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 hover:bg-white/40 dark:hover:bg-zinc-800/40 transition-colors border-b border-white/5 group">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 font-black flex items-center justify-center text-zinc-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black uppercase tracking-tight">{prod.nom}</div>
                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-40 tracking-widest">
                                                        {prod.total_vendu} unités
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                                    {formatCurrency(prod.ca_genere)}
                                                </div>
                                                <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Impact Revenue</div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="rounded-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-sm overflow-hidden">
                                <CardHeader className="p-8 border-b border-white/10">
                                    <CardTitle className="text-xl font-black uppercase tracking-widest italic flex items-center gap-3">
                                        <Store className="size-5 text-indigo-500" /> Performance Boutique
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {charts.par_boutique.length > 0 ? (
                                        charts.par_boutique.map((boutique, i) => (
                                            <div key={i} className="p-8 border-b border-white/5 last:border-0">
                                                <div className="flex justify-between items-end mb-4">
                                                    <div>
                                                        <div className="text-lg font-black uppercase tracking-tight">{boutique.nom}</div>
                                                        <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-40 tracking-widest">{boutique.count} transactions</div>
                                                    </div>
                                                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                                        {formatCurrency(boutique.total)}
                                                    </div>
                                                </div>
                                                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-1000"
                                                        style={{ width: `${Math.min(100, (boutique.total / kpis.ventes.total_ca) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center text-muted-foreground font-black uppercase tracking-[0.2em] italic opacity-20">No Data</div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ONGLET 2: VENTES DÉTAILLÉES (Par Catégorie) */}
                    <TabsContent value="ventes" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <Card className="rounded-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-lg overflow-hidden">
                            <CardHeader >
                                <CardTitle className="text-xl font-black uppercase tracking-widest italic">Répartition par Catégorie</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={charts.par_categorie}>
                                            <XAxis dataKey="nom" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis hide />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2rem] shadow-2xl">
                                                                <div className="text-xs font-black uppercase text-muted-foreground italic mb-2">{data.nom}</div>
                                                                <div className="space-y-1">
                                                                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(data.total)}</div>
                                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">{data.qte} unités vendues</div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar dataKey="total" fill="#6366f1" radius={[15, 15, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ONGLET 3: INVENTAIRE */}
                    <TabsContent value="stocks" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="rounded-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-lg overflow-hidden">
                                <CardHeader className="p-8 bg-rose-500/5 border-b border-rose-500/10">
                                    <CardTitle className="text-xl font-black uppercase tracking-widest italic flex items-center gap-3 text-rose-600">
                                        <AlertTriangle className="size-5" /> Stock Critique
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {alertes_stock.length > 0 ? (
                                        alertes_stock.map((stock, i) => (
                                            <div key={i} className="p-6 flex items-center justify-between border-b border-rose-500/5 last:border-0 hover:bg-rose-500/5 transition-colors">
                                                <div>
                                                    <div className="text-sm font-black uppercase tracking-tight">{stock.produit}</div>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40 tracking-widest italic">Taille: {stock.taille}</span>
                                                </div>
                                                <Badge variant={stock.quantite <= 0 ? "destructive" : "outline"} className={cn(
                                                    "px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px]",
                                                    stock.quantite > 0 ? "border-orange-500/20 text-orange-600 bg-orange-500/10" : "bg-rose-600 text-white border-0 shadow-lg shadow-rose-500/20"
                                                )}>
                                                    {stock.quantite} restant
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-20 text-center flex flex-col items-center">
                                            <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
                                                <TrendingUp className="size-8" />
                                            </div>
                                            <div className="font-black uppercase tracking-widest text-emerald-600 italic">Rien à signaler</div>
                                            <div className="text-xs text-muted-foreground mt-1">Tous vos stocks sont optimaux.</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="rounded-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-lg overflow-hidden">
                                <CardHeader className="p-8 border-b border-white/10 flex flex-row items-center justify-between">
                                    <CardTitle className="text-xl font-black uppercase tracking-widest italic flex items-center gap-3">
                                        <ArrowRightLeft className="size-5 text-indigo-500" /> Flux récents
                                    </CardTitle>
                                    <Link href={MouvementStockController.index.url()}>
                                        <Button variant="outline" size="sm" className="rounded-lg font-black uppercase tracking-widest text-[9px]">Historique complète</Button>
                                    </Link>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {mouvements_recents.map((mvt, i) => (
                                        <div key={i} className="p-6 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/40 dark:hover:bg-zinc-800/40 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black uppercase tracking-tight">{mvt.produit.nom}</span>
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 tracking-widest italic">
                                                    {new Date(mvt.created_at).toLocaleDateString('fr-FR')} par {mvt.user.name}
                                                </span>
                                            </div>
                                            <div className={cn(
                                                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                                mvt.type === 'entrée' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                    mvt.type === 'sortie' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                                        'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                            )}>
                                                {mvt.type === 'entrée' ? '+' : '-'}{Math.abs(mvt.quantite)}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
