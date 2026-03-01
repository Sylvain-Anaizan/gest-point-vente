import UniteController from '@/actions/App/Http/Controllers/UniteController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, RulerIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
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
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

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

export default function UnitesIndex({ unites }: { unites: Unite[] }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [uniteToDelete, setUniteToDelete] = useState<Unite | null>(null);

    const handleDeleteClick = (unite: Unite) => {
        setUniteToDelete(unite);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (uniteToDelete) {
            router.delete(
                route('unites.destroy', uniteToDelete.id),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setDeleteDialogOpen(false);
                        setUniteToDelete(null);
                    },
                },
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Unités de mesure" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Unités de mesure
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Gérez les unités de mesure de vos produits (Kg, Pièce, Litre, etc.)
                        </p>
                    </div>
                    <Link href={UniteController.create.url()}>
                        <Button className="bg-primary hover:bg-primary/90">
                            <PlusIcon className="mr-2 size-4" />
                            Nouvelle unité
                        </Button>
                    </Link>
                </div>

                {unites.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <RulerIcon className="size-12 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground text-center max-w-sm">
                                Aucune unité de mesure configurée. Les unités permettent de définir comment vos produits sont quantifiés.
                            </p>
                            <Link
                                href={UniteController.create.url()}
                                className="mt-6"
                            >
                                <Button variant="outline">
                                    <PlusIcon className="mr-2 size-4" />
                                    Créer votre première unité
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {unites.map((unite) => (
                            <Card
                                key={unite.id}
                                className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-primary/10"
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                            {unite.nom}
                                        </CardTitle>
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            <RulerIcon className="size-5 text-primary" />
                                        </div>
                                    </div>
                                    {unite.description && (
                                        <CardDescription className="line-clamp-2 mt-2">
                                            {unite.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className="font-bold text-primary">
                                            {unite.produits_count}
                                        </span>
                                        <span>
                                            {unite.produits_count <= 1
                                                ? 'produit associé'
                                                : 'produits associés'}
                                        </span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex gap-2 pt-4 border-t bg-muted/30">
                                    <Link
                                        href={UniteController.show.url(unite.id)}
                                        className="flex-1"
                                    >
                                        <Button variant="ghost" size="sm" className="w-full hover:bg-background">
                                            <EyeIcon className="mr-2 size-4" />
                                            Détails
                                        </Button>
                                    </Link>
                                    <Link
                                        href={UniteController.edit.url(unite.id)}
                                        className="flex-1"
                                    >
                                        <Button variant="ghost" size="sm" className="w-full hover:bg-background">
                                            <PencilIcon className="mr-2 size-4" />
                                            Modifier
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteClick(unite)}
                                        className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                    >
                                        <TrashIcon className="mr-2 size-4" />
                                        Supprimer
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                <Dialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer l'unité de mesure</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer l'unité de mesure
                                <span className="font-bold text-foreground mx-1">"{uniteToDelete?.nom}"</span> ?
                                Cette action est irréversible.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setUniteToDelete(null);
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                            >
                                Confirmer la suppression
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
