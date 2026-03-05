import VenteController from '@/actions/App/Http/Controllers/VenteController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Plus,
    Search,
    ShoppingCart,
    Banknote,
    AlertTriangle,
    CreditCard,
    User,
    Receipt,
    Calendar,
    Eye,
    Pencil,
    Trash2,
    MoreHorizontal,
    Smartphone
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: '/dashboard' },
    { title: 'Gestion des ventes', href: VenteController.index.url() },
];

interface Client { id: number; nom: string; prenom: string; telephone: string; }
interface User { id: number; name: string; email: string; }
interface LigneVente { id: number; produit_id: number; quantite: number; prix_unitaire: number; sous_total: number; produit: { id: number; nom: string; }; }
interface Vente { id: number; numero: string; client_id: number | null; user_id: number; montant_total: number | string; statut: 'complétée' | 'annulée'; mode_paiement: 'espèces' | 'carte' | 'virement' | 'mobile_money'; created_at: string; updated_at: string; client?: Client; user: User; lignes: LigneVente[]; boutique?: { id: number; nom: string; }; }

export default function VentesIndex({ ventes, filters }: { ventes: { data: Vente[]; current_page: number; last_page: number; per_page: number; total: number; }; filters: { search?: string; statut?: string; date_debut?: string; date_fin?: string; }; }) {

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statutFilter, setStatutFilter] = useState(filters.statut || 'none');
    const [dateDebut, setDateDebut] = useState(filters.date_debut || '');
    const [dateFin, setDateFin] = useState(filters.date_fin || '');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [venteToDelete, setVenteToDelete] = useState<Vente | null>(null);

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

    const handleDeleteClick = (vente: Vente) => { setVenteToDelete(vente); setDeleteDialogOpen(true); };
    const handleDeleteConfirm = () => { if (venteToDelete) { router.delete(VenteController.destroy.url(venteToDelete.id), { preserveScroll: true, onSuccess: () => { setDeleteDialogOpen(false); setVenteToDelete(null); }, }); } };
    const applyFilters = () => {
        const statutValue = statutFilter === 'none' ? '' : statutFilter;
        router.get(VenteController.index.url(), { search: searchQuery, statut: statutValue, date_debut: dateDebut, date_fin: dateFin }, { preserveState: true, replace: true });
    };
    const clearFilters = () => { setSearchQuery(''); setStatutFilter('none'); setDateDebut(''); setDateFin(''); router.get(VenteController.index.url(), {}, { preserveState: true, replace: true }); };

    const stats = useMemo(() => {
        const ventesData = ventes.data;
        const totalVentes = ventesData.length;
        const ventesCompletees = ventesData.filter(v => v.statut === 'complétée').length;

        // Calcul sécurisé des revenus avec vérification des valeurs
        const totalRevenus = ventesData
            .filter(v => v.statut === 'complétée')
            .reduce((acc, v) => {
                // Convertir en nombre si c'est une chaîne
                let montant = v.montant_total;
                if (typeof montant === 'string') {
                    montant = parseFloat(montant) || 0;
                } else if (typeof montant !== 'number' || isNaN(montant)) {
                    montant = 0;
                }
                return acc + montant;
            }, 0);

        const ventesAnnulees = ventesData.filter(v => v.statut === 'annulée').length;
        return { totalVentes, ventesCompletees, totalRevenus, ventesAnnulees };
    }, [ventes.data]);

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case 'complétée': return <Badge variant="outline" className="border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 font-black uppercase text-[9px] tracking-widest px-2 py-0.5 rounded-lg">Complétée</Badge>;
            case 'annulée': return <Badge variant="outline" className="border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 font-black uppercase text-[9px] tracking-widest px-2 py-0.5 rounded-lg">Annulée</Badge>;
            default: return <Badge variant="secondary" className="font-black uppercase text-[9px] tracking-widest px-2 py-0.5 rounded-lg">{statut}</Badge>;
        }
    };

    const getModePaiementDetails = (mode: string) => {
        switch (mode) {
            case 'espèces': return { icon: <Banknote className="h-3 w-3" />, label: 'Espèces', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20' };
            case 'carte': return { icon: <CreditCard className="h-3 w-3" />, label: 'Carte', color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20' };
            case 'virement': return { icon: <Receipt className="h-3 w-3" />, label: 'Virement', color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20' };
            case 'mobile_money': return { icon: <Smartphone className="h-3 w-3" />, label: 'Mobile', color: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20' };
            default: return { icon: <Banknote className="h-3 w-3" />, label: mode, color: 'text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800' };
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Ventes" />

            <div className="space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto pb-32 animate-in fade-in duration-700">
                {/* SECTION 1: HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                            <ShoppingCart className="size-3" />
                            Historique financier
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">Ventes</h1>
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                            <div className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            Suivi en temps réel des transactions et revenus.
                        </p>
                    </div>
                    <Link href={VenteController.create.url()} className="group">
                        <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 border-0 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative">
                            <span className="relative z-10 flex items-center gap-2">
                                <Plus className="size-5 stroke-[3px]" /> Nouvelle vente
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </Button>
                    </Link>
                </div>

                {/* SECTION 2: STATS */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    {[
                        { title: 'Revenus', value: formatMontant(stats.totalRevenus), suffix: 'FCFA', icon: Banknote, color: 'indigo' },
                        { title: 'Total Ventes', value: stats.totalVentes, icon: ShoppingCart, color: 'blue' },
                        { title: 'Validées', value: stats.ventesCompletees, icon: Receipt, color: 'emerald' },
                        { title: 'Annulées', value: stats.ventesAnnulees, icon: AlertTriangle, color: 'rose' }
                    ].map((stat, i) => (
                        <Card key={i} className="group relative overflow-hidden bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                            <div className={`absolute -right-6 -top-6 size-32 bg-${stat.color}-500/5 rounded-full blur-3xl group-hover:bg-${stat.color}-500/10 transition-all duration-700`} />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`size-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center border border-${stat.color}-500/20`}>
                                    <stat.icon className={`size-5 text-${stat.color}-600 dark:text-${stat.color}-400 shrink-0`} />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 relative z-10">
                                <div className="flex items-baseline gap-2">
                                    <div className={`text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter tabular-nums`}>
                                        {stat.value}
                                    </div>
                                    {stat.suffix && (
                                        <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">
                                            {stat.suffix}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* SECTION 3: FILTRES */}
                <Card className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-lg shadow-md">
                    <CardContent className="">
                        <div className="flex flex-col lg:flex-row items-center gap-4">
                            <div className="relative flex-1 w-full group">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                                <Input
                                    placeholder="Rechercher par client ou N° de vente..."
                                    className="pl-11 h-12 bg-white dark:bg-zinc-800/50 border-white/20 dark:border-zinc-700/50 rounded-2xl focus-visible:ring-indigo-500/30 transition-all font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 md:flex items-center gap-3 w-full lg:w-auto">
                                <Select value={statutFilter || 'none'} onValueChange={setStatutFilter}>
                                    <SelectTrigger className="w-full md:w-[160px] h-12 bg-white dark:bg-zinc-800/50 border-white/20 dark:border-zinc-700/50 rounded-2xl">
                                        <SelectValue placeholder="Tous les statuts" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800">
                                        <SelectItem value="none">Tous les statuts</SelectItem>
                                        <SelectItem value="complétée">Complétée</SelectItem>
                                        <SelectItem value="annulée">Annulée</SelectItem>
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
                                    className="flex-1 lg:flex-none h-12 rounded-2xl border-white/20 dark:border-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold uppercase tracking-widest text-[10px]"
                                    onClick={clearFilters}
                                >
                                    Effacer
                                </Button>
                                <Button
                                    className="flex-1 lg:flex-none h-12 px-6 rounded-2xl bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-zinc-500/20"
                                    onClick={applyFilters}
                                >
                                    Appliquer
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* SECTION 4: LISTE DES VENTES */}
                {ventes.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white/20 dark:bg-zinc-900/10 backdrop-blur-sm rounded-[3rem] border border-dashed border-zinc-300 dark:border-zinc-800">
                        <div className="size-20 mb-6 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center ring-8 ring-indigo-500/5 animate-pulse">
                            <ShoppingCart className="size-10 text-indigo-500 opacity-40" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-zinc-400">Aucune vente</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-xs font-medium opacity-60">
                            Vos critères ne correspondent à aucune transaction enregistrée.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {ventes.data.map((vente) => {
                            const paiement = getModePaiementDetails(vente.mode_paiement);
                            const isCompleted = vente.statut === 'complétée';
                            const isCancelled = vente.statut === 'annulée';

                            return (
                                <Card key={vente.id} className="group relative flex flex-col rounded-md bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/40 dark:border-zinc-800/40 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-full h-1.5 bg-${isCompleted ? 'emerald' : isCancelled ? 'rose' : 'indigo'}-500/50`} />

                                    <CardHeader className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1.5">
                                                <Badge variant="outline" className="font-mono text-[10px] py-0 h-5 border-zinc-200 dark:border-zinc-700 text-muted-foreground bg-zinc-50 dark:bg-zinc-800/50">
                                                    {vente.numero}
                                                </Badge>
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black uppercase tracking-tighter opacity-60">
                                                    <Calendar className="size-3" />
                                                    {new Date(vente.created_at).toLocaleDateString('fr-FR', {
                                                        day: '2-digit', month: 'short', year: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                            {getStatutBadge(vente.statut)}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Montant Total</div>
                                            <div className={`text-3xl font-black tracking-tighter ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : isCancelled ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'} scale-100 group-hover:scale-110 origin-left transition-transform duration-500`}>
                                                {formatMontant(vente.montant_total)}
                                                <span className="text-xs ml-1 opacity-60">F</span>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1 space-y-6">
                                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 shadow-inner">
                                            <div className="size-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:rotate-12 duration-500">
                                                <User className="size-5 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Client</div>
                                                <p className="text-sm font-black uppercase truncate text-zinc-900 dark:text-zinc-100">
                                                    {vente.client ? vente.client.nom : 'Client Anonyme'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className={`flex items-center gap-2 ${paiement.color} text-[10px] font-black uppercase tracking-widest truncate`}>
                                                {paiement.icon} {paiement.label}
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[9px] font-black uppercase text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                                                    {vente.lignes.length} Item(s)
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex gap-2 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-white/20 dark:border-zinc-800/50 backdrop-blur-sm">
                                        <Link href={VenteController.show.url(vente.id)} className="flex-[2] group/btn">
                                            <Button variant="outline" className="w-full h-11 rounded-xl bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 font-bold uppercase tracking-widest text-[10px] transition-all">
                                                <Eye className="mr-2 size-4 text-indigo-500 group-hover/btn:scale-110 transition-transform" />
                                                <span>Détails</span>
                                            </Button>
                                        </Link>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="flex-1 h-11 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all">
                                                    <MoreHorizontal className="size-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-2xl border-zinc-200 dark:border-zinc-800 p-2 shadow-2xl min-w-[160px]">
                                                <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground p-3">Options de vente</DropdownMenuLabel>
                                                <DropdownMenuItem asChild className="rounded-xl h-11">
                                                    <Link href={VenteController.edit.url(vente.id)} className="cursor-pointer w-full flex items-center font-bold uppercase tracking-tight text-xs">
                                                        <Pencil className="mr-3 size-4 text-emerald-500" /> Modifier
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                                                <DropdownMenuItem onClick={() => handleDeleteClick(vente)} className="rounded-xl h-11 text-rose-500 focus:text-rose-500 focus:bg-rose-50 dark:focus:bg-rose-950/30 cursor-pointer font-bold uppercase tracking-tight text-xs">
                                                    <Trash2 className="mr-3 size-4" /> Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* PAGINATION SCROLLABLE */}
                {ventes.last_page > 1 && (
                    <div className="flex justify-center pt-8">
                        <div className="flex flex-nowrap overflow-x-auto pb-4 gap-3 w-full justify-start md:justify-center px-4 scrollbar-hide">
                            {Array.from({ length: ventes.last_page }, (_, i) => i + 1).map((page) => (
                                <Link key={page} href={VenteController.index.url({ mergeQuery: { page: page } })} preserveScroll preserveState className="shrink-0">
                                    <Button
                                        variant={page === ventes.current_page ? "default" : "outline"}
                                        className={cn(
                                            "size-11 rounded-xl font-bold transition-all shadow-md",
                                            page === ventes.current_page
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

                {/* DIALOG DELETE */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="max-w-[400px] w-full p-0 overflow-hidden border-0 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl">
                        <div className="p-8 space-y-6">
                            <div className="size-16 rounded-3xl bg-rose-500/10 flex items-center justify-center mx-auto">
                                <Trash2 className="size-8 text-rose-500" />
                            </div>
                            <div className="text-center space-y-2">
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Supprimer la vente ?</DialogTitle>
                                <DialogDescription className="text-sm font-medium text-muted-foreground">
                                    Cette action est irréversible. La vente <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-zinc-50">{venteToDelete?.numero}</code> sera définitivement effacée.
                                </DialogDescription>
                            </div>
                            {venteToDelete?.statut === 'complétée' && (
                                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex gap-3 items-start">
                                    <AlertTriangle className="size-5 text-orange-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] font-bold text-orange-700 dark:text-orange-400 leading-relaxed">
                                        AVERTISSEMENT : Comme cette vente est "Complétée", la suppression restaurera automatiquement les stocks des produits vendus.
                                    </p>
                                </div>
                            )}
                            <div className="flex flex-col gap-3">
                                <Button
                                    className="h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-500/20 transition-all active:scale-95"
                                    onClick={handleDeleteConfirm}
                                >
                                    Confirmer la suppression
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    onClick={() => setDeleteDialogOpen(false)}
                                >
                                    Annuler
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}