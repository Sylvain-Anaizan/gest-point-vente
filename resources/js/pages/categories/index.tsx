import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, SearchIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Catégories',
        href: CategoryController.index.url(),
    },
];

interface Category {
    id: number;
    nom: string;
    description: string | null;
    produits_count: number;
}

// Types pour le filtre
type FilterStatus = 'all' | 'with_products' | 'empty';

export default function CategoriesIndex({
    categories,
}: {
    categories: Category[];
}) {
    const { auth } = usePage().props as unknown as { auth: { user: { permissions: string[] } } };
    const canManage = auth.user.permissions.includes('manage categories');
    // États pour la suppression
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
        null,
    );

    // États pour la recherche et le filtrage
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

    // Logique de filtrage et de recherche
    const filteredCategories = useMemo(() => {
        let results = categories;

        // 1. Filtrage par statut
        if (filterStatus === 'with_products') {
            results = results.filter((cat) => cat.produits_count > 0);
        } else if (filterStatus === 'empty') {
            results = results.filter((cat) => cat.produits_count === 0);
        }

        // 2. Filtrage par terme de recherche
        if (searchTerm) {
            const lowercasedSearch = searchTerm.toLowerCase();
            results = results.filter((cat) =>
                cat.nom.toLowerCase().includes(lowercasedSearch) ||
                (cat.description && cat.description.toLowerCase().includes(lowercasedSearch))
            );
        }

        return results;
    }, [categories, searchTerm, filterStatus]);

    // Fonctions de suppression
    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (categoryToDelete) {
            router.delete(
                CategoryController.destroy.url(categoryToDelete.id),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setDeleteDialogOpen(false);
                        setCategoryToDelete(null);
                    },
                },
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catégories" />

            <div className="space-y-6 px-4 md:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Catégories
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Gérez et organisez vos catégories de produits.
                        </p>
                    </div>
                    {canManage && (
                        <Link href={CategoryController.create.url()}>
                            <Button>
                                <PlusIcon className="size-4 mr-2" />
                                Nouvelle catégorie
                            </Button>
                        </Link>
                    )}
                </div>

                {/* --- Tableau de bord / Barre de contrôle --- */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Recherche */}
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom ou description..."
                            className="w-full pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filtre par statut */}
                    <Select
                        value={filterStatus}
                        onValueChange={(value: FilterStatus) => setFilterStatus(value)}
                    >
                        <SelectTrigger className="w-full md:w-[200px] flex-shrink-0">
                            <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les catégories</SelectItem>
                            <SelectItem value="with_products">Avec produits</SelectItem>
                            <SelectItem value="empty">Vides (0 produit)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* --- Fin Barre de contrôle --- */}

                {/* Affichage des résultats */}
                {filteredCategories.length === 0 ? (
                    <Card className="shadow-none border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground text-center text-lg">
                                {searchTerm || filterStatus !== 'all'
                                    ? `Aucun résultat ne correspond à votre recherche ou filtre.`
                                    : `Aucune catégorie pour le moment.`}
                            </p>
                            {(searchTerm || filterStatus !== 'all') && (
                                <Button variant="link" onClick={() => { setSearchTerm(''); setFilterStatus('all'); }} className="mt-2">
                                    Réinitialiser les filtres
                                </Button>
                            )}
                            {categories.length === 0 && !searchTerm && filterStatus === 'all' && (
                                <Link
                                    href={CategoryController.create.url()}
                                    className="mt-4"
                                >
                                    <Button>
                                        <PlusIcon className="size-4 mr-2" />
                                        Créer votre première catégorie
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredCategories.map((category) => (
                            <div key={category.id} className="group flex flex-col transition-all duration-200 hover:shadow-lg hover:[&>div:first-child]:border-primary/50 hover:[&>div:last-child]:border-primary/50">
                                <Card className="rounded-b-none border-b-0 transition-colors duration-200">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-xl">
                                                {category.nom}
                                            </CardTitle>
                                            <Badge variant={category.produits_count > 0 ? "default" : "secondary"} className="ml-4">
                                                {category.produits_count} {category.produits_count <= 1 ? 'produit' : 'produits'}
                                            </Badge>
                                        </div>
                                        {category.description && (
                                            <CardDescription className="line-clamp-2 mt-1">
                                                {category.description}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                </Card>
                                <div className="flex gap-2 p-2 border border-t-0 rounded-b-lg bg-white transition-colors duration-200">
                                    <Link
                                        href={CategoryController.show.url(category.id)}
                                        className="flex-1"
                                    >
                                        <Button variant="outline" size="sm" className="w-full bg-background">
                                            <EyeIcon className="size-4 mr-2" />
                                            Voir
                                        </Button>
                                    </Link>
                                    {canManage && (
                                        <>
                                            <Link
                                                href={CategoryController.edit.url(category.id)}
                                                className="flex-1"
                                            >
                                                <Button variant="outline" size="sm" className="w-full bg-background">
                                                    <PencilIcon className="size-4 mr-2" />
                                                    Modifier
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteClick(category)}
                                                className="flex-shrink-0"
                                            >
                                                <TrashIcon className="size-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Dialog de suppression */}
                <Dialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer la catégorie</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer la catégorie
                                **"{categoryToDelete?.nom}"** ? Cette action est
                                irréversible.
                                <br />
                                <span className="text-red-600 font-semibold mt-2 block">
                                    Tous les {categoryToDelete?.produits_count} produits associés
                                    seront également supprimés.
                                </span>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setCategoryToDelete(null);
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                            >
                                <TrashIcon className="size-4 mr-2" />
                                Supprimer définitivement
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}