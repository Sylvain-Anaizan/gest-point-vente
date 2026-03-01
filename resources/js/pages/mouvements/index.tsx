import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowDownLeft, ArrowUpRight, History, Plus, Search, Scale } from 'lucide-react';
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
                    icon: <ArrowDownLeft className="h-4 w-4 text-emerald-600" />,
                    badge: <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">Entrée</Badge>,
                    color: 'text-emerald-600'
                };
            case 'sortie':
                return {
                    icon: <ArrowUpRight className="h-4 w-4 text-blue-600" />,
                    badge: <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Sortie</Badge>,
                    color: 'text-blue-600'
                };
            case 'perte':
                return {
                    icon: <ArrowUpRight className="h-4 w-4 text-rose-600" />,
                    badge: <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50">Perte</Badge>,
                    color: 'text-rose-600'
                };
            case 'ajustement':
                return {
                    icon: <Scale className="h-4 w-4 text-orange-600" />,
                    badge: <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">Ajustement</Badge>,
                    color: 'text-orange-600'
                };
            default:
                return {
                    icon: <History className="h-4 w-4 text-muted-foreground" />,
                    badge: <Badge variant="secondary">{type}</Badge>,
                    color: 'text-muted-foreground'
                };
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mouvements de stock" />

            <div className="space-y-6 p-4 md:p-6 max-w-[1200px] pb-24">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Mouvements de stock</h1>
                        <p className="text-sm text-muted-foreground mt-1">Historique des entrées et sorties de produits.</p>
                    </div>
                    <Link href={MouvementStockController.create.url()} className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all border border-primary/20 bg-gradient-to-b from-primary to-primary/90">
                            <Plus className="mr-2 size-4" /> Nouvelle entrée/sortie
                        </Button>
                    </Link>
                </div>

                <div className="bg-card p-4 rounded-xl border shadow-sm space-y-3">
                    <div className="flex flex-col lg:flex-row gap-3">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher (Produit)..."
                                className="pl-9 w-full bg-muted/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 sm:flex gap-3 w-full lg:w-auto">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full sm:w-[140px] bg-muted/50 col-span-2 sm:col-span-1">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Tous</SelectItem>
                                    <SelectItem value="entrée">Entrée</SelectItem>
                                    <SelectItem value="sortie">Sortie</SelectItem>
                                    <SelectItem value="perte">Perte</SelectItem>
                                    <SelectItem value="ajustement">Ajustement</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input type="date" className="w-full sm:w-auto bg-muted/50 text-xs" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
                            <Input type="date" className="w-full sm:w-auto bg-muted/50 text-xs" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                        <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!searchQuery && typeFilter === 'none' && !dateDebut}>
                            Effacer
                        </Button>
                        <Button onClick={applyFilters} size="sm">
                            Appliquer
                        </Button>
                    </div>
                </div>

                {mouvements.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed rounded-xl bg-muted/30">
                        <div className="h-16 w-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center ring-8 ring-primary/5">
                            <History className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="mt-2 text-xl font-bold tracking-tight">Aucun mouvement trouvé</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-sm mb-6">
                            Commencez par ajouter ou retirer du stock aux produits.
                        </p>
                    </div>
                ) : (
                    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold">Date</th>
                                        <th className="px-5 py-4 font-semibold">Type</th>
                                        <th className="px-5 py-4 font-semibold">Produit & Taille</th>
                                        <th className="px-5 py-4 text-center font-semibold text-primary">Quantité</th>
                                        <th className="px-5 py-4 font-semibold">Auteur</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mouvements.data.map((mvt) => {
                                        const details = getTypeDetails(mvt.type);
                                        const isPositive = mvt.type === 'entrée' || (mvt.type === 'ajustement' && mvt.quantite > 0);

                                        return (
                                            <tr key={mvt.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <div className="font-medium">
                                                        {new Date(mvt.created_at).toLocaleDateString('fr-FR', {
                                                            day: '2-digit', month: 'short', year: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                                        {new Date(mvt.created_at).toLocaleTimeString('fr-FR', {
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-7 w-7 rounded-full bg-background border flex items-center justify-center shadow-sm">
                                                            {details.icon}
                                                        </div>
                                                        {details.badge}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold">{mvt.produit.nom}</div>
                                                    {mvt.variante.taille && (
                                                        <Badge variant="secondary" className="mt-1 text-[10px] py-0 px-1.5 h-4">
                                                            Taille: {mvt.variante.taille.nom}
                                                        </Badge>
                                                    )}
                                                    {mvt.commentaire && (
                                                        <div className="text-[10px] text-muted-foreground mt-1.5 line-clamp-1 italic">
                                                            "{mvt.commentaire}"
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-center whitespace-nowrap">
                                                    <span className={`font-black text-base px-3 py-1 bg-background border rounded-lg shadow-sm ${details.color}`}>
                                                        {isPositive ? '+' : '-'} {Math.abs(mvt.quantite)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 font-medium text-muted-foreground whitespace-nowrap">
                                                    {mvt.user.name}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {mouvements.last_page > 1 && (
                    <div className="flex justify-center pt-4">
                        <div className="flex flex-nowrap overflow-x-auto gap-2 scrollbar-hide">
                            {Array.from({ length: mouvements.last_page }, (_, i) => i + 1).map((page) => (
                                <Link key={page} href={MouvementStockController.index.url({ mergeQuery: { page: page } })} preserveScroll preserveState>
                                    <Button variant={page === mouvements.current_page ? "default" : "outline"} size="sm" className="w-9 h-9 p-0">
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
