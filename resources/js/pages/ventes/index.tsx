import ProduitController from '@/actions/App/Http/Controllers/ProduitController';
import VenteController from '@/actions/App/Http/Controllers/VenteController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    PlusIcon,
    Search,
    ChevronRight,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Clock,
    ShoppingBag,
    Users,
    Filter,
    ArrowUpDown,
    Printer,
    Eye,
    Receipt,
    MoreVertical,
    TrashIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import Pagination from '@/components/ui/pagination-custom';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: '/dashboard' },
    { title: 'Ventes', href: VenteController.index.url() },
];

interface Vente {
    id: number;
    numero: string;
    montant_total: number;
    statut: 'complétée' | 'annulée' | 'en_attente';
    mode_paiement: string;
    created_at: string;
    client?: { nom: string; telephone: string };
    user: { name: string };
    boutique?: { nom: string };
}

export default function VentesIndex({
    ventes,
    stats,
    filters
}: {
    ventes: {
        data: Vente[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    stats: {
        total_ventes: number;
        ventes_completees: number;
        ventes_annulees: number;
        total_revenus: number;
    };
    filters: {
        search?: string;
        statut?: string;
        date_debut?: string;
        date_fin?: string;
    };
}) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statutFilter, setStatutFilter] = useState(filters.statut || 'all');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [venteToDelete, setVenteToDelete] = useState<Vente | null>(null);

    const handleSearch = () => {
        router.get(VenteController.index.url(), {
            search: searchQuery,
            statut: statutFilter === 'all' ? undefined : statutFilter,
            date_debut: filters.date_debut,
            date_fin: filters.date_fin
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatutFilter('all');
        router.get(VenteController.index.url(), {}, { preserveState: true, replace: true });
    };

    const handleDeleteClick = (vente: Vente) => {
        setVenteToDelete(vente);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (venteToDelete) {
            router.delete(VenteController.destroy.url(venteToDelete.id), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setVenteToDelete(null);
                }
            });
        }
    };

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case 'complétée':
                return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 className="size-3" /> Complétée</Badge>;
            case 'annulée':
                return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><XCircle className="size-3" /> Annulée</Badge>;
            default:
                return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Clock className="size-3" /> En attente</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Journal des Ventes" />

            <div className="space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto pb-32 animate-in fade-in duration-700">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                            <TrendingUp className="size-3" />
                            Performance Commerciale
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase italic">Ventes</h1>
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                            Suivi complet de vos transactions et revenus.
                        </p>
                    </div>
                    <Link href={VenteController.create.url()}>
                        <Button className="h-14 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 border-0 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2">
                                <ShoppingBag className="size-5 stroke-[3px]" /> Nouvelle Vente
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </Button>
                    </Link>
                </div>

                {/* STATS Reworked */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    {[
                        { title: 'Revenu Total', value: stats.total_revenus.toLocaleString('fr-FR'), suffix: 'F', icon: TrendingUp, color: 'emerald', desc: 'Complétées uniquement' },
                        { title: 'Volume Ventes', value: stats.total_ventes, icon: ShoppingBag, color: 'blue', desc: 'Toutes transactions' },
                        { title: 'Succès rate', value: stats.total_ventes > 0 ? Math.round((stats.ventes_completees / stats.total_ventes) * 100) : 0, suffix: '%', icon: CheckCircle2, color: 'indigo', desc: 'Efficacité globale' },
                        { title: 'Annulations', value: stats.ventes_annulees, icon: XCircle, color: 'rose', desc: 'Pertes potentielles' },
                    ].map((stat, i) => (
                        <Card key={i} className="group relative overflow-hidden bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-lg">
                            <div className={`absolute -right-6 -top-6 size-32 bg-${stat.color}-500/5 rounded-full blur-3xl`} />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.title}</CardTitle>
                                <stat.icon className={`size-4 text-${stat.color}-500`} />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-1">
                                    <div className="text-2xl font-black tracking-tighter">{stat.value}{stat.suffix}</div>
                                </div>
                                <p className="text-[9px] font-bold text-muted-foreground/60 uppercase mt-1">{stat.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* FILTERS */}
                <Card className="bg-white dark:bg-zinc-900/50 border-white/20 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row items-center gap-4">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher par numéro, client..."
                                    className="pl-11 h-12 bg-zinc-100 dark:bg-zinc-800/50 border-0 rounded-xl focus-visible:ring-indigo-500/30 font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <Select value={statutFilter} onValueChange={(val) => {
                                    setStatutFilter(val);
                                    router.get(VenteController.index.url(), {
                                        search: searchQuery,
                                        statut: val === 'all' ? undefined : val
                                    }, { preserveState: true, replace: true });
                                }}>
                                    <SelectTrigger className="w-full lg:w-[200px] h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border-0">
                                        <SelectValue placeholder="Tous les statuts" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="all">Tous les statuts</SelectItem>
                                        <SelectItem value="complétée">Complétées</SelectItem>
                                        <SelectItem value="annulée">Annulées</SelectItem>
                                        <SelectItem value="en_attente">En attente</SelectItem>
                                    </SelectContent>
                                </Select>
                                {searchQuery && (
                                    <Button variant="ghost" onClick={clearFilters} className="h-12 rounded-xl px-6 font-bold text-xs uppercase tracking-widest text-muted-foreground">
                                        Réinitialiser
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* LIST REPLACED WITH CARDS OR TABLE */}
                {ventes.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/20 dark:bg-zinc-900/10 backdrop-blur-sm rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <ShoppingBag className="size-12 text-zinc-300 mb-4 opacity-20" />
                        <h3 className="text-xl font-black uppercase tracking-widest text-zinc-400">Aucune vente trouvée</h3>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {ventes.data.map((vente) => (
                                <Card key={vente.id} className="group relative overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 rounded-xl">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">{vente.numero}</div>
                                            {getStatutBadge(vente.statut)}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                                <Users className="size-3" />
                                                {vente.client ? vente.client.nom : 'Client de passage'}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                                                <Clock className="size-3" /> {new Date(vente.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 border-b border-zinc-100 dark:border-zinc-800/50">
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="space-y-0.5">
                                                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Montant Total</div>
                                                <div className="text-xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100">
                                                    {Math.round(vente.montant_total).toLocaleString('fr-FR')} <span className="text-[10px] opacity-40">F</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Boutique</div>
                                                <div className="text-[10px] font-bold text-zinc-500">{vente.boutique?.nom || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="flex items-center p-2 gap-2 bg-zinc-50/50 dark:bg-zinc-900/30">
                                        <Link href={VenteController.show.url(vente.id)} className="flex-1">
                                            <Button variant="ghost" size="sm" className="w-full h-10 rounded-lg font-black uppercase text-[9px] tracking-widest hover:bg-white dark:hover:bg-zinc-800 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50">
                                                <Eye className="size-3 mr-2 text-indigo-500" /> Détails
                                            </Button>
                                        </Link>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Link href={VenteController.receipt.url(vente.id)}>
                                                <Button variant="ghost" size="icon" className="size-10 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600">
                                                    <Printer className="size-4" />
                                                </Button>
                                            </Link>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="size-10 rounded-lg">
                                                        <MoreVertical className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl">
                                                    <Link href={VenteController.edit.url(vente.id)}>
                                                        <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg cursor-pointer font-bold text-[10px] uppercase tracking-widest">
                                                            <Receipt className="size-4 text-amber-500" /> Modifier la vente
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem onClick={() => handleDeleteClick(vente)} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer font-bold text-[10px] uppercase tracking-widest text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-500/10">
                                                        <TrashIcon className="size-4" /> Annuler/Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* PAGINATION */}
                        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800/50">
                            <Pagination
                                links={ventes.links}
                                meta={{
                                    current_page: ventes.current_page,
                                    from: ventes.from,
                                    last_page: ventes.last_page,
                                    per_page: ventes.per_page,
                                    to: ventes.to,
                                    total: ventes.total
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* DIALOG DELETE */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="max-w-[400px] rounded-[2rem]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase italic tracking-tight">Supprimer la vente ?</DialogTitle>
                            <DialogDescription>
                                Cette action annulera la transaction <span className="font-bold text-zinc-900 dark:text-zinc-100">{venteToDelete?.numero}</span> et restaurera les stocks.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex-col sm:flex-col gap-2">
                            <Button variant="destructive" onClick={handleDeleteConfirm} className="w-full h-12 rounded-xl font-black uppercase text-xs">Confirmer l'annulation</Button>
                            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="w-full h-12 rounded-xl font-bold text-xs">Garder la vente</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}