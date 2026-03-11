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
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import Pagination from '@/components/ui/pagination-custom';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Catégories',
        href: CategoryController.index.url(),
    },
];

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Category { id: number; nom: string; description: string | null; icon: string | null; color: string; created_at: string; updated_at: string; produits_count: number; }

export default function CategoriesIndex({
    categories,
    filters
}: {
    categories: {
        data: Category[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    filters: { search?: string; };
}) {
    const { auth } = usePage().props as unknown as { auth: { user: { permissions: string[] } } };
    const canManage = auth.user.permissions.includes('manage categories');

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = () => {
        router.get(CategoryController.index.url(), {
            search: searchTerm
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        router.get(CategoryController.index.url(), {}, { preserveState: true, replace: true });
    };

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
                        <h1 className="text-3xl font-bold tracking-tight">Catégories</h1>
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

                {/* Barre de contrôle */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom..."
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
                {categories.data.length === 0 ? (
                    <Card className="shadow-none border-dashed bg-muted/10">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground text-center text-lg">
                                {searchTerm
                                    ? `Aucun résultat pour "${searchTerm}".`
                                    : `Aucune catégorie pour le moment.`}
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
                            {categories.data.map((category) => (
                                <div key={category.id} className="group flex flex-col transition-all duration-200 hover:shadow-lg">
                                    <Card className="rounded-b-none border-b-0 transition-colors duration-200 flex-1 flex flex-col dark:bg-zinc-950 dark:border-zinc-800">
                                        <CardHeader className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-xl dark:text-white">
                                                    {category.nom}
                                                </CardTitle>
                                                <Badge variant={category.produits_count > 0 ? "default" : "secondary"} className="ml-4 shrink-0">
                                                    {category.produits_count} {category.produits_count <= 1 ? 'produit' : 'produits'}
                                                </Badge>
                                            </div>
                                            {category.description ? (
                                                <CardDescription className="line-clamp-2 mt-1 dark:text-zinc-400">
                                                    {category.description}
                                                </CardDescription>
                                            ) : (
                                                <CardDescription className="mt-1 italic opacity-40 dark:text-zinc-500 text-xs">
                                                    Pas de description
                                                </CardDescription>
                                            )}
                                        </CardHeader>
                                    </Card>
                                    <div className="flex gap-2 p-3 border border-t-0 rounded-b-lg bg-zinc-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 transition-colors duration-200">
                                        <Link href={CategoryController.show.url(category.id)} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                <EyeIcon className="size-4 mr-2" /> Voir
                                            </Button>
                                        </Link>
                                        {canManage && (
                                            <>
                                                <Link href={CategoryController.edit.url(category.id)} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <PencilIcon className="size-4 mr-2 text-emerald-500" /> Modif
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(category)}
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
                                links={categories.links}
                                meta={{
                                    current_page: categories.current_page,
                                    from: (categories as any).from,
                                    last_page: categories.last_page,
                                    per_page: categories.per_page,
                                    to: (categories as any).to,
                                    total: categories.total
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Dialog de suppression */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer la catégorie</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer la catégorie **"{categoryToDelete?.nom}"** ? Cette action est irréversible.
                                <br />
                                <span className="text-red-600 font-semibold mt-2 block">
                                    Tous les {categoryToDelete?.produits_count} produits associés seront également supprimés.
                                </span>
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