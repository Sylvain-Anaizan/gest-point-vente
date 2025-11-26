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
    Filter,
    MoreHorizontal
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
    DialogFooter,
    DialogHeader,
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
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: '/dashboard' },
    { title: 'Gestion des ventes', href: VenteController.index.url() },
];

interface Client { id: number; nom: string; prenom: string; telephone: string; }
interface User { id: number; name: string; email: string; }
interface LigneVente { id: number; produit_id: number; quantite: number; prix_unitaire: number; sous_total: number; produit: { id: number; nom: string; }; }
interface Vente { id: number; numero: string; client_id: number | null; user_id: number; montant_total: number | string; statut: 'complétée' | 'annulée'; mode_paiement: 'espèces' | 'carte' | 'virement' | 'mobile_money'; created_at: string; updated_at: string; client?: Client; user: User; lignes: LigneVente[]; }

export default function VentesIndex({ ventes, filters }: { ventes: { data: Vente[]; current_page: number; last_page: number; per_page: number; total: number; }; filters: { search?: string; statut?: string; date_debut?: string; date_fin?: string; }; }) {

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statutFilter, setStatutFilter] = useState(filters.statut || 'none');
    const [dateDebut, setDateDebut] = useState(filters.date_debut || '');
    const [dateFin, setDateFin] = useState(filters.date_fin || '');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [venteToDelete, setVenteToDelete] = useState<Vente | null>(null);

    // Fonction pour formater les montants : pas de décimales, espaces pour les milliers
    const formatMontant = (montant: any): string => {
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
            case 'complétée': return <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 w-fit">Complétée</Badge>;
            case 'annulée': return <Badge variant="destructive" className="w-fit">Annulée</Badge>;
            default: return <Badge variant="secondary" className="w-fit">{statut}</Badge>;
        }
    };

    const getModePaiementDetails = (mode: string) => {
        switch (mode) {
            case 'espèces': return { icon: <Banknote className="h-3 w-3" />, label: 'Espèces', color: 'text-emerald-600' };
            case 'carte': return { icon: <CreditCard className="h-3 w-3" />, label: 'Carte', color: 'text-blue-600' };
            case 'virement': return { icon: <Receipt className="h-3 w-3" />, label: 'Virement', color: 'text-purple-600' };
            case 'mobile_money': return { icon: <User className="h-3 w-3" />, label: 'Mobile', color: 'text-orange-600' };
            default: return { icon: <Banknote className="h-3 w-3" />, label: mode, color: 'text-gray-600' };
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Ventes" />

            <div className="space-y-6 p-4 md:p-6 max-w-[1600px] mx-auto pb-24">
                {/* SECTION 1: HEADER (Responsive Flex) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ventes</h1>
                        <p className="text-sm text-muted-foreground">Suivi des encaissements.</p>
                    </div>
                    <Link href={VenteController.create.url()} className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto shadow-sm">
                            <Plus className="mr-2 size-4" /> Nouvelle vente
                        </Button>
                    </Link>
                </div>

                {/* SECTION 2: STATS (Grid 2 cols on mobile, 4 on desktop) */}
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    {/* CARTE REVENUS (Celle qui déborde souvent) */}
                    <Card className="bg-primary/5 border-primary/20 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                            <CardTitle className="text-[10px] sm:text-xs font-medium uppercase text-muted-foreground truncate">
                                Revenus
                            </CardTitle>
                            <Banknote className="h-4 w-4 text-primary shrink-0" />
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 pt-0">
                            {/* Ajout de min-w-0 pour forcer le truncate si besoin */}
                            <div className="flex items-baseline gap-1 min-w-0">
                                <div
                                    className="text-lg sm:text-2xl font-bold truncate"
                                    title={formatMontant(stats.totalRevenus) + " FCFA"}
                                >
                                    {stats.totalRevenus}
                                </div>
                                <span className="text-[10px] sm:text-xs font-normal text-muted-foreground shrink-0">
                                    F
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                            <CardTitle className="text-[10px] sm:text-xs font-medium uppercase text-muted-foreground truncate">
                                Total Ventes
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground shrink-0" />
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 pt-0">
                            <div className="text-lg sm:text-2xl font-bold truncate">
                                {stats.totalVentes}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                            <CardTitle className="text-[10px] sm:text-xs font-medium uppercase text-muted-foreground truncate">
                                Validées
                            </CardTitle>
                            <Receipt className="h-4 w-4 text-green-600 shrink-0" />
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 pt-0">
                            <div className="text-lg sm:text-2xl font-bold text-green-600 truncate">
                                {stats.ventesCompletees}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                            <CardTitle className="text-[10px] sm:text-xs font-medium uppercase text-muted-foreground truncate">
                                Annulées
                            </CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 pt-0">
                            <div className="text-lg sm:text-2xl font-bold text-red-600 truncate">
                                {stats.ventesAnnulees}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SECTION 3: FILTRES (Collapsible / Stacked on Mobile) */}
                <div className="bg-card p-4 rounded-xl border shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Filter className="h-4 w-4" /> Filtres
                    </div>
                    <div className="flex flex-col lg:flex-row gap-3">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher (Client, N°)..."
                                className="pl-9 w-full bg-muted/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 sm:flex gap-3 w-full lg:w-auto">
                            <Select value={statutFilter || 'none'} onValueChange={setStatutFilter}>
                                <SelectTrigger className="w-full sm:w-[140px] bg-muted/50 col-span-2 sm:col-span-1">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Tous</SelectItem>
                                    <SelectItem value="complétée">Complétée</SelectItem>
                                    <SelectItem value="annulée">Annulée</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input type="date" className="w-full sm:w-auto bg-muted/50 text-xs" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
                            <Input type="date" className="w-full sm:w-auto bg-muted/50 text-xs" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                        <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!searchQuery && !statutFilter && !dateDebut}>
                            Effacer
                        </Button>
                        <Button onClick={applyFilters} size="sm">
                            Appliquer
                        </Button>
                    </div>
                </div>

                {/* SECTION 4: LISTE DES VENTES */}
                {ventes.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
                        <div className="rounded-full bg-muted p-3"><ShoppingCart className="h-6 w-6 text-muted-foreground" /></div>
                        <h3 className="mt-4 text-lg font-semibold">Aucune vente trouvée</h3>
                        <Link href={VenteController.create.url()} className="mt-4"><Button variant="outline">Créer une vente</Button></Link>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {ventes.data.map((vente) => {
                            const paiement = getModePaiementDetails(vente.mode_paiement);
                            return (
                                <Card key={vente.id} className="group hover:shadow-lg transition-all duration-300 flex flex-col border-l-4 border-l-primary/50 relative overflow-hidden">
                                    <CardHeader className="pb-2 p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-xs text-muted-foreground font-bold">{vente.numero}</span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(vente.created_at).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                            {getStatutBadge(vente.statut)}
                                        </div>
                                        <div className="pt-2">
                                            <div className="text-xl font-bold tracking-tight text-primary">
                                                {formatMontant(vente.montant_total)} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-4 pt-0 pb-3 flex-1">
                                        <Separator className="my-2" />
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium leading-none truncate">
                                                    {vente.client ? `${vente.client.nom} ${vente.client.prenom}` : 'Client Anonyme'}
                                                </p>
                                                {vente.client && <p className="text-xs text-muted-foreground mt-0.5 truncate">{vente.client.telephone}</p>}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                                            <div className={`flex items-center gap-1.5 ${paiement.color} font-medium`}>
                                                {paiement.icon} {paiement.label}
                                            </div>
                                            <span>{vente.lignes.length} art.</span>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-3 pt-0 flex gap-2 border-t bg-muted/10 mt-auto">
                                        <Link href={VenteController.show.url(vente.id)} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                                                <Eye className="mr-2 h-3 w-3" /> Détails
                                            </Button>
                                        </Link>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={VenteController.edit.url(vente.id)} className="cursor-pointer w-full flex items-center">
                                                        <Pencil className="mr-2 h-4 w-4" /> Modifier
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDeleteClick(vente)} className="text-destructive focus:text-destructive cursor-pointer">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
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
                    <div className="flex justify-center pt-4">
                        <div className="flex flex-nowrap overflow-x-auto pb-2 gap-2 w-full justify-start md:justify-center px-2 scrollbar-hide">
                            {Array.from({ length: ventes.last_page }, (_, i) => i + 1).map((page) => (
                                <Link key={page} href={VenteController.index.url({ page })} preserveScroll preserveState className="shrink-0">
                                    <Button variant={page === ventes.current_page ? "default" : "outline"} size="sm" className="w-9 h-9 p-0">
                                        {page}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* DIALOG DELETE */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="max-w-[90vw] rounded-lg">
                        <DialogHeader>
                            <DialogTitle>Supprimer la vente ?</DialogTitle>
                            <DialogDescription>
                                Irréversible. Vente <strong>{venteToDelete?.numero}</strong>.
                                {venteToDelete?.statut === 'complétée' && <div className="mt-2 p-2 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded">Le stock sera restauré.</div>}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex-row gap-2 justify-end">
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="flex-1 sm:flex-none">Annuler</Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm} className="flex-1 sm:flex-none">Supprimer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}