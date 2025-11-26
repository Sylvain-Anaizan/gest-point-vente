import TailleController from '@/actions/App/Http/Controllers/TailleController';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, router } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from 'lucide-react';

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
        title: 'Tailles',
        href: TailleController.index.url(),
    },
];

interface Taille {
    id: number;
    nom: string;
    description: string | null;
    produits_count: number;
}

export default function TaillesIndex({ tailles }: { tailles: Taille[] }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tailleToDelete, setTailleToDelete] = useState<Taille | null>(null);

    const handleDeleteClick = (taille: Taille) => {
        setTailleToDelete(taille);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (tailleToDelete) {
            router.delete(
                TailleController.destroy.url(tailleToDelete.id),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setDeleteDialogOpen(false);
                        setTailleToDelete(null);
                    },
                },
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tailles" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Tailles
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            G?rez les tailles de vos produits
                        </p>
                    </div>
                    <Link href={TailleController.create.url()}>
                        <Button>
                            <PlusIcon className="size-4" />
                            Nouvelle taille
                        </Button>
                    </Link>
                </div>

                {tailles.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground text-center">
                                Aucune taille pour le moment.
                            </p>
                            <Link
                                href={TailleController.create.url()}
                                className="mt-4"
                            >
                                <Button variant="outline">
                                    <PlusIcon className="size-4" />
                                    Cr?er votre premi?re taille
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {tailles.map((taille) => (
                            <Card
                                key={taille.id}
                                className="transition-shadow hover:shadow-md"
                            >
                                <CardHeader>
                                    <CardTitle className="text-xl">
                                        {taille.nom}
                                    </CardTitle>
                                    {taille.description && (
                                        <CardDescription className="line-clamp-2">
                                            {taille.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className="font-medium">
                                            {taille.produits_count}
                                        </span>
                                        <span>
                                            {taille.produits_count === 1
                                                ? 'produit'
                                                : 'produits'}
                                        </span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex gap-2">
                                    <Link
                                        href={TailleController.show.url(
                                            taille.id,
                                        )}
                                        className="flex-1"
                                    >
                                        <Button variant="outline" className="w-full">
                                            <EyeIcon className="size-4" />
                                            Voir
                                        </Button>
                                    </Link>
                                    <Link
                                        href={TailleController.edit.url(
                                            taille.id,
                                        )}
                                        className="flex-1"
                                    >
                                        <Button variant="outline" className="w-full">
                                            <PencilIcon className="size-4" />
                                            Modifier
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleDeleteClick(taille)}
                                        className="flex-1"
                                    >
                                        <TrashIcon className="size-4" />
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
                            <DialogTitle>Supprimer la taille</DialogTitle>
                            <DialogDescription>
                                ?tes-vous s?r de vouloir supprimer la taille
                                "{tailleToDelete?.nom}" ? Cette action est
                                irr?versible et supprimera ?galement tous les
                                produits associ?s.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setTailleToDelete(null);
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
