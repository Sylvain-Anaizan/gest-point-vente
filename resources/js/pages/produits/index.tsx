import ProduitController from '@/actions/App/Http/Controllers/ProduitController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    Search,
    Package,
    AlertTriangle,
    TrendingUp,
    Warehouse,
    Store,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: '/dashboard' },
    { title: 'Produits', href: ProduitController.index.url() },
];

interface Category {
    id: number;
    nom: string;
}


interface Boutique {
    id: number;
    nom: string;
}

interface Produit {
    id: number;
    nom: string;
    totalStock: number;
    prixMin: number;
    prixMax: number;
    description: string | null;
    imageUrl: string | null;
    category: Category;
    boutique: Boutique | null;
}

export default function ProduitsIndex({
    produits = [],
    boutiques = [],
}: {
    produits: Produit[];
    boutiques: Boutique[];
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBoutique, setSelectedBoutique] = useState<string>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [produitToDelete, setProduitToDelete] = useState<Produit | null>(null);

    // --- LOGIQUE DE FILTRAGE ET STATISTIQUES ---

    // Filtrer les produits selon la recherche et la boutique
    const filteredProduits = useMemo(() => {
        let result = produits;

        if (selectedBoutique !== 'all') {
            result = result.filter(p => p.boutique?.id.toString() === selectedBoutique);
        }

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.nom.toLowerCase().includes(lowerQuery) ||
                p.category.nom.toLowerCase().includes(lowerQuery) ||
                p.boutique?.nom.toLowerCase().includes(lowerQuery)
            );
        }

        return result;
    }, [produits, searchQuery, selectedBoutique]);

    // Calcul des KPIs (Statistiques)
    const stats = useMemo(() => {
        const totalProduits = produits.length;
        const lowStock = produits.filter(p => p.totalStock < 10).length;
        const totalValue = produits.reduce((acc, p) => acc + (p.prixMin * p.totalStock), 0);
        return { totalProduits, lowStock, totalValue };
    }, [produits]);

    const handleDeleteClick = (produit: Produit) => {
        setProduitToDelete(produit);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (produitToDelete) {
            router.delete(
                ProduitController.destroy.url(produitToDelete.id),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setDeleteDialogOpen(false);
                        setProduitToDelete(null);
                    },
                },
            );
        }
    };

    const placeholderUrl = 'https://placehold.co/600x400/eeeeee/333333?text=PRODUIT';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Produits" />

            <div className="space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto pb-32 animate-in fade-in duration-700">

                {/* --- SECTION 1: HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                            <Package className="size-3" />
                            Inventaire global
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">Produits</h1>
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                            <div className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            Gérez votre catalogue et suivez vos niveaux de stock.
                        </p>
                    </div>
                    <Link href={ProduitController.create.url()} className="group">
                        <Button className="h-14 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 border-0 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative w-full sm:w-auto">
                            <span className="relative z-10 flex items-center gap-2">
                                <PlusIcon className="size-5 stroke-[3px]" /> Ajouter un produit
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </Button>
                    </Link>
                </div>

                {/* --- SECTION 2: STATS --- */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                    {[
                        { title: 'Total Produits', value: stats.totalProduits, icon: Package, color: 'indigo', desc: 'Références actives' },
                        { title: 'Valeur du Stock', value: stats.totalValue.toLocaleString('fr-FR'), suffix: 'FCFA', icon: TrendingUp, color: 'blue', desc: 'Estimation à la vente' },
                        { title: 'Stock Faible', value: stats.lowStock, icon: AlertTriangle, color: stats.lowStock > 0 ? 'rose' : 'emerald', desc: 'À réapprovisionner' }
                    ].map((stat, i) => (
                        <Card key={i} className="group relative overflow-hidden bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                            <div className={`absolute -right-6 -top-6 size-32 bg-${stat.color}-500/5 rounded-full blur-3xl group-hover:bg-${stat.color}-500/10 transition-all duration-700`} />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`size-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center border border-${stat.color}-500/20`}>
                                    <stat.icon className={`size-5 text-${stat.color}-600 dark:text-${stat.color}-400 shrink-0`} />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 relative z-10">
                                <div className="flex items-baseline gap-2">
                                    <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter tabular-nums">
                                        {stat.value}
                                    </div>
                                    {stat.suffix && (
                                        <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">
                                            {stat.suffix}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider opacity-60">
                                    {stat.desc}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* --- SECTION 3: FILTRES --- */}
                <Card className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-lg shadow">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row items-center gap-4">
                            <div className="relative flex-1 w-full group">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                                <Input
                                    placeholder="Rechercher par nom, catégorie..."
                                    className="pl-11 h-12 bg-gray-200 dark:bg-zinc-800/50 border-white/20 dark:border-zinc-700/50 rounded-2xl focus-visible:ring-indigo-500/30 transition-all font-medium"
                                    value={searchQuery}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <Select value={selectedBoutique} onValueChange={setSelectedBoutique}>
                                    <SelectTrigger className="w-full lg:w-[240px] h-12 bg-gray-200 dark:bg-zinc-800/50 border-white/20 dark:border-zinc-700/50 rounded-2xl">
                                        <SelectValue placeholder="Toutes les boutiques" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg bg-gray-200 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800">
                                        <SelectItem value="all">Toutes les boutiques</SelectItem>
                                        {boutiques?.map((b) => (
                                            <SelectItem key={b.id} value={b.id.toString()}>
                                                {b.nom}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="hidden sm:flex h-12 px-4 items-center bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                    {filteredProduits.length} RÉFÉRENCES
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* --- SECTION 4: LISTE --- */}
                {filteredProduits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white/20 dark:bg-zinc-900/10 backdrop-blur-sm rounded-sm border border-dashed border-zinc-300 dark:border-zinc-800">
                        <div className="size-20 mb-6 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center ring-8 ring-indigo-500/5 animate-pulse">
                            <Package className="size-10 text-indigo-500 opacity-40" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-zinc-400">Aucun produit</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-xs font-medium opacity-60">
                            {searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Commencez par ajouter des produits à votre inventaire."}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProduits.map((produit) => {
                            const isLowStock = produit.totalStock < 10 && produit.totalStock > 0;
                            const isOutOfStock = produit.totalStock === 0;

                            return (
                                <Card key={produit.id} className="group relative flex flex-col rounded-lg bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/40 dark:border-zinc-800/40 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg m-3 bg-zinc-100 dark:bg-zinc-800/50">
                                        <img
                                            src={produit.imageUrl || placeholderUrl}
                                            alt={produit.nom}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => { (e.target as HTMLImageElement).src = placeholderUrl; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="absolute top-3 left-3">
                                            <Badge className="bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-50 border-0 shadow-sm backdrop-blur-md px-3 py-1 rounded-xl font-black uppercase text-[9px] tracking-widest">
                                                {produit.category.nom}
                                            </Badge>
                                        </div>

                                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75">
                                            <div className="flex gap-2">
                                                <Link href={ProduitController.edit.url(produit.id)}>
                                                    <Button size="icon" className="size-8 rounded-xl bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white transition-colors">
                                                        <PencilIcon className="size-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    className="size-8 rounded-xl backdrop-blur-md border border-rose-500/30 transition-all"
                                                    onClick={() => handleDeleteClick(produit)}
                                                >
                                                    <TrashIcon className="size-4" />
                                                </Button>
                                            </div>
                                            <Link href={ProduitController.show.url(produit.id)}>
                                                <Button size="sm" className="h-8 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white border-0 font-bold uppercase text-[9px] tracking-widest px-4 shadow-lg shadow-indigo-500/20">
                                                    Détails
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>

                                    <CardHeader className="px-6 py-4 space-y-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                                <Store className="size-3" />
                                                {produit.boutique ? produit.boutique.nom : 'Stock Central'}
                                            </div>
                                            <CardTitle className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 line-clamp-1 uppercase group-hover:text-indigo-500 transition-colors">
                                                {produit.nom}
                                            </CardTitle>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Prix (min)</div>
                                                <div className="text-2xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400">
                                                    {Math.round(produit.prixMin).toLocaleString('fr-FR')}
                                                    <span className="text-xs ml-0.5 opacity-60">F</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className={cn(
                                                    "flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm transition-all duration-500 group-hover:scale-105",
                                                    isOutOfStock ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                                                        isLowStock ? "bg-orange-500/10 text-orange-600 border-orange-500/20 animate-pulse" :
                                                            "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                )}>
                                                    <Warehouse className="size-3" />
                                                    {produit.totalStock} en stock
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* --- MODALE DE SUPPRESSION --- */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="max-w-[400px] w-full p-0 overflow-hidden border-0 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl">
                        <div className="p-8 space-y-6">
                            <div className="size-16 rounded-3xl bg-rose-500/10 flex items-center justify-center mx-auto">
                                <TrashIcon className="size-8 text-rose-500" />
                            </div>
                            <div className="text-center space-y-2">
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Supprimer le produit ?</DialogTitle>
                                <DialogDescription className="text-sm font-medium text-muted-foreground">
                                    Cette action supprimera définitivement <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-zinc-50">{produitToDelete?.nom}</code> et toutes ses données associées.
                                </DialogDescription>
                            </div>
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
                                    onClick={() => { setDeleteDialogOpen(false); setProduitToDelete(null); }}
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