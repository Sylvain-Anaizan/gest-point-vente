import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowDownLeft, ArrowUpRight, History, Plus, Search, Scale, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import MouvementStockController from '@/actions/App/Http/Controllers/MouvementStockController';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: '/dashboard' },
    { title: 'Mouvements de stock', href: MouvementStockController.index.url() },
];

interface Produit { id: number; nom: string; }
interface Taille { id: number; nom: string; }
interface Variante { id: number; taille: Taille | null; prix_vente: number; quantite: number; }
interface User { id: number; name: string; }

interface MouvementStock {
    id: number;
    produit_id: number;
    variante_id: number;
    user_id: number;
    quantite: number;
    type: 'entrée' | 'sortie' | 'perte' | 'ajustement';
    commentaire: string | null;
    created_at: string;
    produit: Produit;
    variante: Variante;
    user: User;
}

export default function MouvementsIndex({
    mouvements,
    filters
}: {
    mouvements: { data: MouvementStock[]; current_page: number; last_page: number; };
    filters: { search?: string; type?: string; date_debut?: string; date_fin?: string; };
}) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'none');
    const [dateDebut, setDateDebut] = useState(filters.date_debut || '');
    const [dateFin, setDateFin] = useState(filters.date_fin || '');

    const applyFilters = () => {
        router.get(MouvementStockController.index.url(), {
            search: searchQuery,
            type: typeFilter !== 'none' ? typeFilter : '',
            date_debut: dateDebut,
            date_fin: dateFin
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearchQuery(''); setTypeFilter('none'); setDateDebut(''); setDateFin('');
        router.get(MouvementStockController.index.url(), {}, { preserveState: true, replace: true });
    };

    const getTypeDetails = (type: string) => {
        switch (type) {
            case 'entrée':
                return {
                    icon: <ArrowDownLeft className="h-3 w-3" />,
                    label: 'Entrée',
                    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20'
                };
            case 'sortie':
                return {
                    icon: <ArrowUpRight className="h-3 w-3" />,
                    label: 'Sortie',
                    color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20'
                };
            case 'perte':
                return {
                    icon: <ArrowUpRight className="h-3 w-3" />,
                    label: 'Perte',
                    color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20'
                };
            case 'ajustement':
                return {
                    icon: <Scale className="h-3 w-3" />,
                    label: 'Ajustement',
                    color: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20'
                };
            default:
                return {
                    icon: <History className="h-3 w-3" />,
                    label: type,
                    color: 'text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800'
                };
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mouvements de stock" />

            <div className="space-y-8 p-4 md:p-8 max-w-[1600px] pb-32 animate-in fade-in duration-700">
                {/* SECTION 1: HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                            <History className="size-3" />
                            Journal de flux
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">Mouvements</h1>
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                            <div className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            Historique précis des entrées et sorties de stock.
                        </p>
                    </div>
                    <Link href={MouvementStockController.create.url()} className="group">
                        <Button className="h-14 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 border-0 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative w-full sm:w-auto">
                            <span className="relative z-10 flex items-center gap-2">
                                <Plus className="size-5 stroke-[3px]" /> Nouveau mouvement
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </Button>
                    </Link>
                </div>

                {/* SECTION 2: FILTRES */}
                <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-lg shadow-sm">
                    <CardContent >
                        <div className="flex flex-col lg:flex-row items-center gap-4">
                            <div className="relative flex-1 w-full group">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                                <Input
                                    placeholder="Rechercher un produit..."
                                    className="pl-11 h-12 bg-white dark:bg-zinc-800/50 border-white/20 dark:border-zinc-700/50 rounded-2xl focus-visible:ring-indigo-500/30 transition-all font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 md:flex items-center gap-3 w-full lg:w-auto">
                                <Select value={typeFilter || 'none'} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-full md:w-[150px] h-12 bg-white dark:bg-zinc-800/50 border-white/20 dark:border-zinc-700/50 rounded-2xl">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg border-zinc-200 dark:border-zinc-800">
                                        <SelectItem value="none">Tous les types</SelectItem>
                                        <SelectItem value="entrée">Entrée</SelectItem>
                                        <SelectItem value="sortie">Sortie</SelectItem>
                                        <SelectItem value="perte">Perte</SelectItem>
                                        <SelectItem value="ajustement">Ajustement</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex items-center gap-2 h-12 px-3 bg-white dark:bg-zinc-800/50 border border-white/20 dark:border-zinc-700/50 rounded-2xl min-w-0">
                                    <Calendar className="size-4 text-muted-foreground shrink-0" />
                                    <input
                                        type="date"
                                        className="bg-transparent border-0 text-xs focus:ring-0 p-0 w-full"
                                        value={dateDebut}
                                        onChange={(e) => setDateDebut(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 h-12 px-3 bg-white dark:bg-zinc-800/50 border border-white/20 dark:border-zinc-700/50 rounded-2xl min-w-0">
                                    <Calendar className="size-4 text-muted-foreground shrink-0" />
                                    <input
                                        type="date"
                                        className="bg-transparent border-0 text-xs focus:ring-0 p-0 w-full"
                                        value={dateFin}
                                        onChange={(e) => setDateFin(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                                <Button
                                    variant="outline"
                                    className="flex-1 lg:flex-none h-12 rounded-lg border-white/20 dark:border-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold uppercase tracking-widest text-[10px]"
                                    onClick={clearFilters}
                                >
                                    Effacer
                                </Button>
                                <Button
                                    className="flex-1 lg:flex-none h-12 px-6 rounded-lg bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 font-black uppercase tracking-widest text-[10px] shadow-sm shadow-zinc-500/20"
                                    onClick={applyFilters}
                                >
                                    Appliquer
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* SECTION 3: LISTE DES MOUVEMENTS */}
                {mouvements.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white/20 dark:bg-zinc-900/10 backdrop-blur-sm rounded-[3rem] border border-dashed border-zinc-300 dark:border-zinc-800">
                        <div className="size-20 mb-6 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center ring-8 ring-indigo-500/5 animate-pulse">
                            <History className="size-10 text-indigo-500 opacity-40" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-zinc-400">Aucun mouvement</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-xs font-medium opacity-60">
                            Aucune opération de stock enregistrée pour cette période.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {mouvements.data.map((mvt) => {
                            const details = getTypeDetails(mvt.type);
                            const isPositive = mvt.type === 'entrée' || (mvt.type === 'ajustement' && mvt.quantite > 0);

                            return (
                                <Card key={mvt.id} className="group relative flex flex-col rounded-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/40 dark:border-zinc-800/40 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                                    <div className={cn(
                                        "absolute top-0 left-0 w-full h-1.5 opacity-50",
                                        mvt.type === 'entrée' ? "bg-emerald-500" :
                                            mvt.type === 'sortie' ? "bg-blue-500" :
                                                mvt.type === 'perte' ? "bg-rose-500" : "bg-orange-500"
                                    )} />

                                    <CardHeader className="pb-2 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black uppercase tracking-tighter opacity-60">
                                                    <Calendar className="size-3" />
                                                    {new Date(mvt.created_at).toLocaleDateString('fr-FR', {
                                                        day: '2-digit', month: 'short', year: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-[9px] font-mono text-muted-foreground/40">
                                                    {new Date(mvt.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div className={cn("text-[10px] font-black uppercase tracking-widest", details.color)}>
                                                {details.icon} {details.label}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Quantité</div>
                                            <div className={cn(
                                                "text-4xl font-black tracking-tighter scale-100 group-hover:scale-110 origin-left transition-transform duration-500",
                                                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                            )}>
                                                {isPositive ? '+' : '-'} {Math.abs(mvt.quantite)}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1 space-y-4">
                                        <div className=" px-4 py-2 rounded-md bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 shadow-inner">
                                            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mb-1">Produit</div>
                                            <p className="text-sm font-black uppercase tracking-tight line-clamp-1 text-zinc-900 dark:text-zinc-100">
                                                {mvt.produit.nom}
                                            </p>
                                            {mvt.variante.taille && (
                                                <Badge variant="secondary" className="mt-2 text-[9px] py-0 px-2 h-4 rounded-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                                    Taille: {mvt.variante.taille.nom}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                                <Users className="size-3.5 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Responsable</div>
                                                <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate tracking-tight uppercase">
                                                    {mvt.user.name}
                                                </p>
                                            </div>
                                        </div>

                                        {mvt.commentaire && (
                                            <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 italic">
                                                <p className="text-[10px] text-orange-700/70 dark:text-orange-400/70 line-clamp-2 leading-relaxed font-medium">
                                                    "{mvt.commentaire}"
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* PAGINATION */}
                {mouvements.last_page > 1 && (
                    <div className="flex justify-center pt-8">
                        <div className="flex flex-nowrap overflow-x-auto pb-4 gap-3 w-full justify-start md:justify-center px-4 scrollbar-hide">
                            {Array.from({ length: mouvements.last_page }, (_, i) => i + 1).map((page) => (
                                <Link key={page} href={MouvementStockController.index.url({ mergeQuery: { page: page } })} preserveScroll preserveState className="shrink-0">
                                    <Button
                                        variant={page === mouvements.current_page ? "default" : "outline"}
                                        className={cn(
                                            "size-11 rounded-lg font-bold transition-all shadow-md",
                                            page === mouvements.current_page
                                                ? "bg-indigo-600 text-white shadow-indigo-500/20 scale-110"
                                                : "bg-white/50 dark:bg-zinc-800/50 border-white/20 dark:border-zinc-700/50 hover:bg-white dark:hover:bg-zinc-800"
                                        )}
                                    >
                                        {page}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
