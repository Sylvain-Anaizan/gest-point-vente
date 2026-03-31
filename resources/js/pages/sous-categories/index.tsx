import SousCategorieController from '@/actions/App/Http/Controllers/SousCategorieController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon } from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import Pagination from '@/components/ui/pagination-custom';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sous-catégories',
        href: SousCategorieController.index.url(),
    },
];

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface SousCategorie {
    id: number;
    nom: string;
    categorie: string;
    categorie_id: number;
}

export default function SousCategoriesIndex({
    sousCategories,
    filters,
}: {
    sousCategories: {
        data: SousCategorie[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    filters: { search?: string };
}) {
    const { auth } = usePage().props as unknown as { auth: { user: { permissions: string[] } } };
    const canManage = auth.user.permissions.includes('manage categories');

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<SousCategorie | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = () => {
        router.get(SousCategorieController.index.url(), {
            search: searchTerm,
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        router.get(SousCategorieController.index.url(), {}, { preserveState: true, replace: true });
    };

    const handleDeleteClick = (item: SousCategorie) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (itemToDelete) {
            router.delete(
                SousCategorieController.destroy.url(itemToDelete.id),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setDeleteDialogOpen(false);
                        setItemToDelete(null);
                    },
                },
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sous-catégories" />

            <div className="space-y-6 px-4 md:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Sous-catégories</h1>
                        <p className="text-muted-foreground mt-2">
                            Gérez les sous-catégories de vos produits.
                        </p>
                    </div>
                    {canManage && (
                        <Link href={SousCategorieController.create.url()}>
                            <Button>
                                <PlusIcon className="size-4 mr-2" />
                                Nouvelle sous-catégorie
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Barre de recherche */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom ou catégorie..."
                            className="w-full pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button variant="outline" onClick={handleSearch}>Rechercher</Button>
                    {searchTerm && <Button variant="ghost" onClick={clearFilters}>Effacer</Button>}
                </div>

                {/* Affichage des résultats */}
                {sousCategories.data.length === 0 ? (
                    <Card className="shadow-none border-dashed bg-muted/10">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground text-center text-lg">
                                {searchTerm
                                    ? `Aucun résultat pour "${searchTerm}".`
                                    : `Aucune sous-catégorie pour le moment.`}
                            </p>
                            {searchTerm && (
                                <Button variant="link" onClick={clearFilters} className="mt-2 text-indigo-600">
                                    Afficher tout
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {sousCategories.data.map((item) => (
                                <div key={item.id} className="group flex flex-col transition-all duration-200 hover:shadow-lg">
                                    <Card className="rounded-b-none border-b-0 transition-colors duration-200 flex-1 flex flex-col dark:bg-zinc-950 dark:border-zinc-800">
                                        <CardHeader className="flex-1">
                                            <CardTitle className="text-xl dark:text-white">
                                                {item.nom}
                                            </CardTitle>
                                            <CardDescription className="mt-1 dark:text-zinc-400">
                                                <Badge variant="outline" className="mt-1">
                                                    {item.categorie}
                                                </Badge>
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                    <div className="flex gap-2 p-3 border border-t-0 rounded-b-lg bg-zinc-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 transition-colors duration-200">
                                        {canManage && (
                                            <>
                                                <Link href={SousCategorieController.edit.url(item.id)} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <PencilIcon className="size-4 mr-2 text-emerald-500" /> Modifier
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(item)}
                                                    className="flex-shrink-0 size-9 p-0"
                                                >
                                                    <TrashIcon className="size-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* PAGINATION */}
                        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-center">
                            <Pagination
                                links={sousCategories.links}
                                meta={{
                                    current_page: sousCategories.current_page,
                                    from: sousCategories.from,
                                    last_page: sousCategories.last_page,
                                    per_page: sousCategories.per_page,
                                    to: sousCategories.to,
                                    total: sousCategories.total,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Dialog de suppression */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer la sous-catégorie</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer la sous-catégorie <strong>"{itemToDelete?.nom}"</strong> ? Cette action est irréversible.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>Supprimer définitivement</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
