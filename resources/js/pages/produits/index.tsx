import ProduitController from '@/actions/App/Http/Controllers/ProduitController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
    MoreVertical,
    Eye,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { useState, useMemo } from 'react';
import Pagination from '@/components/ui/pagination-custom';

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

interface SousCategorie {
    id: number;
    nom: string;
    categorie_id: number;
    categorie?: { id: number; nom: string };
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
    sousCategorie: { id: number; nom: string } | null;
    boutique: Boutique | null;
}

export default function ProduitsIndex({
    produits,
    boutiques = [],
    categories = [],
    sousCategories = [],
    stats,
    filters
}: {
    produits: {
        data: Produit[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    boutiques: Boutique[];
    categories: Category[];
    sousCategories: SousCategorie[];
    stats: { total_produits: number; low_stock: number; total_value: number; };
    filters: { search?: string; boutique_id?: string; categorie_id?: string; sous_categorie_id?: string; };
}) {
    const { auth } = usePage().props as unknown as { auth: { user: { permissions: string[] } } };
    const canManage = auth.user.permissions.includes('manage products');

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedBoutique, setSelectedBoutique] = useState<string>(filters.boutique_id || 'all');
    const [selectedCategory, setSelectedCategory] = useState<string>(filters.categorie_id || 'all');
    const [selectedSousCategorie, setSelectedSousCategorie] = useState<string>(filters.sous_categorie_id || 'all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [produitToDelete, setProduitToDelete] = useState<Produit | null>(null);

    const filteredSousCategories = useMemo(() => {
        if (selectedCategory === 'all') return sousCategories;
        return sousCategories.filter(sc => sc.categorie_id.toString() === selectedCategory);
    }, [sousCategories, selectedCategory]);

    const buildFilterParams = (overrides: Record<string, string | undefined> = {}) => {
        const params: Record<string, string | undefined> = {
            search: searchQuery || undefined,
            boutique_id: selectedBoutique === 'all' ? undefined : selectedBoutique,
            categorie_id: selectedCategory === 'all' ? undefined : selectedCategory,
            sous_categorie_id: selectedSousCategorie === 'all' ? undefined : selectedSousCategorie,
            ...overrides,
        };
        // Remove undefined keys
        return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined));
    };

    const handleSearch = () => {
        router.get(ProduitController.index.url(), buildFilterParams(), { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedBoutique('all');
        setSelectedCategory('all');
        setSelectedSousCategorie('all');
        router.get(ProduitController.index.url(), {}, { preserveState: true, replace: true });
    };

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
                    {canManage && (
                        <Link href={ProduitController.create.url()} className="group">
                            <Button className="h-14 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 border-0 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative w-full sm:w-auto">
                                <span className="relative z-10 flex items-center gap-2">
                                    <PlusIcon className="size-5 stroke-[3px]" /> Ajouter un produit
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            </Button>
                        </Link>
                    )}
                </div>

                {/* --- SECTION 2: STATS --- */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                    {[
                        { title: 'Total Produits', value: stats.total_produits, icon: Package, color: 'indigo', desc: 'Références actives' },
                        { title: 'Valeur du Stock', value: stats.total_value.toLocaleString('fr-FR'), suffix: 'FCFA', icon: TrendingUp, color: 'blue', desc: 'Estimation à la vente' },
                        { title: 'Stock Faible', value: stats.low_stock, icon: AlertTriangle, color: stats.low_stock > 0 ? 'rose' : 'emerald', desc: 'À réapprovisionner' }
                    ].map((stat, i) => (
                        <Card key={i} className="group relative overflow-hidden bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-lg shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
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
                    <CardContent>
                        <div className="flex flex-col lg:flex-row items-center gap-4">
                            <div className="relative flex-1 w-full group">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                                <Input
                                    placeholder="Rechercher par nom, catégorie..."
                                    className="pl-11 h-12 bg-gray-200 dark:bg-zinc-800/50 border-white/20 dark:border-zinc-700/50 rounded-2xl focus-visible:ring-indigo-500/30 transition-all font-medium"
                                    value={searchQuery}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <Select value={selectedBoutique} onValueChange={(val) => {
                                    setSelectedBoutique(val);
                                    router.get(ProduitController.index.url(), {
                                        search: searchQuery,
                                        boutique_id: val === 'all' ? undefined : val
                                    }, { preserveState: true, replace: true });
                                }}>
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
                                <Select value={selectedCategory} onValueChange={(val) => {
                                    setSelectedCategory(val);
                                    setSelectedSousCategorie('all');
                                    router.get(ProduitController.index.url(), buildFilterParams({
                                        categorie_id: val === 'all' ? undefined : val,
                                        sous_categorie_id: undefined,
                                    }), { preserveState: true, replace: true });
                                }}>
                                    <SelectTrigger className="w-full lg:w-[200px] h-12 bg-gray-200 dark:bg-zinc-800/50 border-white/20 dark:border-zinc-700/50 rounded-2xl">
                                        <SelectValue placeholder="Catégories" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg bg-gray-200 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800">
                                        <SelectItem value="all">Catégories</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nom}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {filteredSousCategories.length > 0 && (
                                    <Select value={selectedSousCategorie} onValueChange={(val) => {
                                        setSelectedSousCategorie(val);
                                        router.get(ProduitController.index.url(), buildFilterParams({
                                            sous_categorie_id: val === 'all' ? undefined : val,
                                        }), { preserveState: true, replace: true });
                                    }}>
                                        <SelectTrigger className="w-full lg:w-[200px] h-12 bg-gray-200 dark:bg-zinc-800/50 border-white/20 dark:border-zinc-700/50 rounded-2xl">
                                            <SelectValue placeholder="Sous-catégories" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg bg-gray-200 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800">
                                            <SelectItem value="all">Sous-catégories</SelectItem>
                                            {filteredSousCategories.map((sc) => (
                                                <SelectItem key={sc.id} value={sc.id.toString()}>{sc.nom}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                <div className="hidden sm:flex h-12 px-4 items-center bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                    {produits.total} RÉFÉRENCES
                                </div>
                                <Button variant="outline" className="h-12 rounded-2xl hidden lg:flex" onClick={clearFilters}>
                                    Effacer
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* --- SECTION 4: LISTE --- */}
                {produits.data.length === 0 ? (
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
                    <div className="space-y-8">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {produits.data.map((produit) => {
                                const isLowStock = produit.totalStock < 10 && produit.totalStock > 0;
                                const isOutOfStock = produit.totalStock === 0;

                                return (
                                    <Card key={produit.id} className="group relative flex flex-col rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl m-2 bg-zinc-100 dark:bg-zinc-900">
                                            <img
                                                src={produit.imageUrl || placeholderUrl}
                                                alt={produit.nom}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                onError={(e) => { (e.target as HTMLImageElement).src = placeholderUrl; }}
                                            />
                                            <div className="absolute top-3 right-3 z-30">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button size="icon" className="size-8 rounded-xl bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 border-0 shadow-lg text-zinc-900 dark:text-zinc-50 transition-colors active:scale-95">
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-900">
                                                        <Link href={ProduitController.show.url(produit.id)}>
                                                            <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                                                                <Eye className="size-4 text-indigo-500" />
                                                                Détails
                                                            </DropdownMenuItem>
                                                        </Link>
                                                        {canManage && (
                                                            <>
                                                                <Link href={ProduitController.edit.url(produit.id)}>
                                                                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                                                                        <PencilIcon className="size-4 text-emerald-500" />
                                                                        Modifier
                                                                    </DropdownMenuItem>
                                                                </Link>
                                                                <DropdownMenuItem
                                                                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold text-xs uppercase tracking-widest text-rose-600 focus:bg-rose-50 focus:text-rose-600"
                                                                    onClick={() => handleDeleteClick(produit)}
                                                                >
                                                                    <TrashIcon className="size-4" />
                                                                    Supprimer
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="absolute top-3 left-3 flex flex-col gap-1">
                                                <Badge className="bg-white/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-50 border-0 shadow-sm backdrop-blur-md px-3 py-1 rounded-xl font-black uppercase text-[9px] tracking-widest">
                                                    {produit.category.nom}
                                                </Badge>
                                                {produit.sousCategorie && (
                                                    <Badge className="bg-indigo-500/80 text-white border-0 shadow-sm backdrop-blur-md px-3 py-1 rounded-xl font-bold text-[8px] tracking-wider">
                                                        {produit.sousCategorie.nom}
                                                    </Badge>
                                                )}
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
                                                        isOutOfStock ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" :
                                                            isLowStock ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 animate-pulse" :
                                                                "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
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

                        {/* PAGINATION */}
                        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800/50">
                            <Pagination
                                links={produits.links}
                                meta={{
                                    current_page: produits.current_page,
                                    from: (produits as any).from,
                                    last_page: produits.last_page,
                                    per_page: (produits as any).per_page,
                                    to: (produits as any).to,
                                    total: produits.total
                                }}
                            />
                        </div>
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