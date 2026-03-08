import UniteController from '@/actions/App/Http/Controllers/UniteController';
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
        title: 'Unités de mesure',
        href: UniteController.index.url(),
    },
];

interface Unite {
    id: number;
    nom: string;
    description: string | null;
    produits_count: number;
}

type FilterStatus = 'all' | 'with_products' | 'empty';

export default function UnitesIndex({ unites }: { unites: Unite[] }) {
    const { auth } = usePage().props as unknown as { auth: { user: { permissions: string[] } } };
    const canManage = auth.user.permissions.includes('manage units');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [uniteToDelete, setUniteToDelete] = useState<Unite | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

    const filteredUnites = useMemo(() => {
        let results = unites;

        if (filterStatus === 'with_products') {
            results = results.filter((u) => u.produits_count > 0);
        } else if (filterStatus === 'empty') {
            results = results.filter((u) => u.produits_count === 0);
        }

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            results = results.filter(
                (u) =>
                    u.nom.toLowerCase().includes(lower) ||
                    (u.description && u.description.toLowerCase().includes(lower)),
            );
        }
        return results;
    }, [unites, searchTerm, filterStatus]);

    const handleDeleteClick = (unite: Unite) => {
        setUniteToDelete(unite);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (uniteToDelete) {
            router.delete(UniteController.destroy.url(uniteToDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setUniteToDelete(null);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Unités de mesure" />

            <div className="space-y-6 px-4 md:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Unités de mesure
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Gérez les unités de mesure de vos produits (Kg, Pièce, Litre, etc.)
                        </p>
                    </div>
                    {canManage && (
                        <Link href={UniteController.create.url()}>
                            <Button>
                                <PlusIcon className="size-4 mr-2" />
                                Nouvelle unité
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Barre de recherche et filtres */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom ou description..."
                            className="w-full pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Select
                        value={filterStatus}
                        onValueChange={(value: FilterStatus) => setFilterStatus(value)}
                    >
                        <SelectTrigger className="w-full md:w-[200px] flex-shrink-0">
                            <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les unités</SelectItem>
                            <SelectItem value="with_products">Avec produits</SelectItem>
                            <SelectItem value="empty">Vides (0 produit)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {filteredUnites.length === 0 ? (
                    <Card className="shadow-none border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground text-center text-lg">
                                {searchTerm || filterStatus !== 'all'
                                    ? 'Aucun résultat ne correspond à votre recherche ou filtre.'
                                    : 'Aucune unité de mesure pour le moment.'}
                            </p>
                            {(searchTerm || filterStatus !== 'all') && (
                                <Button
                                    variant="link"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterStatus('all');
                                    }}
                                    className="mt-2"
                                >
                                    Réinitialiser les filtres
                                </Button>
                            )}
                            {unites.length === 0 && !searchTerm && canManage && (
                                <Link href={UniteController.create.url()} className="mt-4">
                                    <Button>
                                        <PlusIcon className="size-4 mr-2" />
                                        Créer votre première unité
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredUnites.map((unite) => (
                            <div key={unite.id} className="group flex flex-col transition-all duration-200 hover:shadow-lg hover:[&>div:first-child]:border-primary/50 hover:[&>div:last-child]:border-primary/50">
                                <Card className="rounded-b-none border-b-0 transition-colors duration-200">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-xl">
                                                {unite.nom}
                                            </CardTitle>
                                            <Badge
                                                variant={unite.produits_count > 0 ? 'default' : 'secondary'}
                                                className="ml-4"
                                            >
                                                {unite.produits_count}{' '}
                                                {unite.produits_count <= 1 ? 'produit' : 'produits'}
                                            </Badge>
                                        </div>
                                        {unite.description && (
                                            <CardDescription className="line-clamp-2 mt-1">
                                                {unite.description}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                </Card>
                                <div className="flex gap-2 p-2 border border-t-0 rounded-b-lg bg-white transition-colors duration-200">
                                    <Link
                                        href={UniteController.show.url(unite.id)}
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
                                                href={UniteController.edit.url(unite.id)}
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
                                                onClick={() => handleDeleteClick(unite)}
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

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer l'unité de mesure</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer l'unité{' '}
                                <strong>"{uniteToDelete?.nom}"</strong> ? Cette action est
                                irréversible.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setUniteToDelete(null);
                                }}
                            >
                                Annuler
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>
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
