import ProduitController from '@/actions/App/Http/Controllers/ProduitController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
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
    DialogFooter,
    DialogHeader,
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
import AppLayout from '@/layouts/app-layout';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tableau de bord',
        href: '/dashboard', // Adaptez selon votre route
    },
    {
        title: 'Gestion des produits',
        href: ProduitController.index.url(),
    },
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

    // URL de l'image de placeholder générique
    const placeholderUrl = 'https://placehold.co/600x400/eeeeee/333333?text=PRODUIT';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Produits" />

            <div className="space-y-6 p-6">

                {/* --- SECTION 1: TITRE ET BOUTON CRÉATION --- */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
                        <p className="text-muted-foreground">
                            Vue d'ensemble et gestion de l'inventaire.
                        </p>
                    </div>
                    <Link href={ProduitController.create.url()}>
                        <Button className="w-full sm:w-auto">
                            <PlusIcon className="mr-2 size-4" />
                            Ajouter un produit
                        </Button>
                    </Link>
                </div>

                {/* --- SECTION 2: CARTES STATISTIQUES (KPI) --- */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Produits
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalProduits}</div>
                            <p className="text-xs text-muted-foreground">
                                Références actives
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Valeur du Stock
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalValue.toLocaleString('fr-FR')} FCFA
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Estimation à la vente
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Stock Faible
                            </CardTitle>
                            <AlertTriangle className={`h-4 w-4 ${stats.lowStock > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.lowStock}</div>
                            <p className="text-xs text-muted-foreground">
                                Produits nécessitant réapprovisionnement
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* --- SECTION 3: CARDS DE PRODUITS --- */}
                <Card>
                    <CardHeader className="px-6 border-b">
                        <div className="flex items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Rechercher un produit..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <Select value={selectedBoutique} onValueChange={setSelectedBoutique}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Toutes les boutiques" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes les boutiques</SelectItem>
                                    {boutiques?.map((b) => (
                                        <SelectItem key={b.id} value={b.id.toString()}>
                                            {b.nom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <span className="text-sm text-muted-foreground hidden sm:block">
                                {filteredProduits.length} produit{filteredProduits.length > 1 ? 's' : ''} affiché{filteredProduits.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        {filteredProduits.length === 0 ? (
                            <div className="flex flex-col items-center justify-center  text-center">
                                <div className="rounded-full bg-muted p-3">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold">Aucun produit trouvé</h3>
                                <p className="text-muted-foreground mb-4 max-w-sm">
                                    {searchQuery
                                        ? `Aucun résultat pour "${searchQuery}".`
                                        : "Commencez par créer votre premier produit."}
                                </p>
                                {!searchQuery && (
                                    <Link href={ProduitController.create.url()}>
                                        <Button variant="outline">Créer un produit</Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredProduits.map((produit) => (
                                    <Card
                                        key={produit.id}
                                        className="transition-all hover:shadow-lg hover:border-primary/50"
                                    >
                                        {/* NOUVEAU: Affichage de l'image */}
                                        <div className="relative aspect-[3/2] overflow-hidden rounded-t-lg mx-2 bg-muted">
                                            <img
                                                src={produit.imageUrl || placeholderUrl}
                                                alt={`Image de ${produit.nom}`}
                                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                                                // Fallback au cas où l'image est manquante ou l'URL invalide
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.onerror = null; // Empêche la boucle infinie
                                                    target.src = placeholderUrl;
                                                }}
                                            />
                                            <div className="absolute top-2 right-2">
                                                <Badge variant="secondary" className="flex-shrink-0">
                                                    {produit.category.nom}
                                                </Badge>
                                            </div>
                                        </div>

                                        <CardHeader className="">
                                            <div className="flex items-start justify-between">
                                                <CardTitle className="text-lg flex-1 line-clamp-2">
                                                    {produit.nom}
                                                </CardTitle>
                                            </div>

                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center justify-between border-t pt-3">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-muted-foreground">Prix :</span>
                                                    <span className="text-lg font-bold text-primary">
                                                        {produit.prixMin === produit.prixMax
                                                            ? `${produit.prixMin.toLocaleString('fr-FR')} FCFA`
                                                            : `${produit.prixMin.toLocaleString('fr-FR')} - ${produit.prixMax.toLocaleString('fr-FR')} FCFA`
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Store className="h-3 w-3" /> Boutique :
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {produit.boutique ? produit.boutique.nom : 'Stock Général'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                                                <div className="flex items-center space-x-2">
                                                    <Warehouse className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">Stock Total :</span>
                                                </div>
                                                <span
                                                    className={`text-lg font-bold flex items-center gap-1 ${produit.totalStock === 0 ? 'text-destructive' :
                                                        produit.totalStock < 10 ? 'text-orange-500' : 'text-green-600'
                                                        }`}
                                                >
                                                    {produit.totalStock === 0 && <AlertTriangle className="h-4 w-4" />}
                                                    {produit.totalStock}
                                                </span>
                                            </div>
                                        </CardContent>
                                        <div className="p-6 pt-0 flex flex-col gap-2">
                                            <Link
                                                href={ProduitController.show.url(produit.id)}
                                                className="w-full"
                                            >
                                                <Button variant="outline" className="w-full">
                                                    <EyeIcon className="mr-2 size-4" />
                                                    Détails
                                                </Button>
                                            </Link>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={ProduitController.edit.url(produit.id)}
                                                    className="flex-1"
                                                >
                                                    <Button variant="secondary" className="w-full">
                                                        <PencilIcon className="size-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => handleDeleteClick(produit)}
                                                    className="flex-1"
                                                >
                                                    <TrashIcon className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* --- DIALOG DE CONFIRMATION --- */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer le produit</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer <strong>{produitToDelete?.nom}</strong> ?
                                Cette action est irréversible et supprimera toutes les données associées.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setProduitToDelete(null);
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                            >
                                Supprimer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}