import BoutiqueController from '@/actions/App/Http/Controllers/BoutiqueController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, SearchIcon, MapPinIcon, PhoneIcon } from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Boutiques',
        href: BoutiqueController.index.url(),
    },
];

interface Boutique {
    id: number;
    nom: string;
    adresse: string | null;
    telephone: string | null;
    produits_count: number;
}

export default function BoutiquesIndex({
    boutiques,
}: {
    boutiques: Boutique[];
}) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [boutiqueToDelete, setBoutiqueToDelete] = useState<Boutique | null>(
        null,
    );
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBoutiques = useMemo(() => {
        if (!searchTerm) return boutiques;

        const lowercasedSearch = searchTerm.toLowerCase();
        return boutiques.filter((b) =>
            b.nom.toLowerCase().includes(lowercasedSearch) ||
            (b.adresse && b.adresse.toLowerCase().includes(lowercasedSearch)) ||
            (b.telephone && b.telephone.toLowerCase().includes(lowercasedSearch))
        );
    }, [boutiques, searchTerm]);

    const handleDeleteClick = (boutique: Boutique) => {
        setBoutiqueToDelete(boutique);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (boutiqueToDelete) {
            router.delete(
                BoutiqueController.destroy.url(boutiqueToDelete.id),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setDeleteDialogOpen(false);
                        setBoutiqueToDelete(null);
                    },
                },
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Boutiques" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Boutiques
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Gérez vos points de vente et suivez leur inventaire.
                        </p>
                    </div>
                    <Link href={BoutiqueController.create.url()}>
                        <Button>
                            <PlusIcon className="size-4 mr-2" />
                            Nouvelle boutique
                        </Button>
                    </Link>
                </div>

                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par nom, adresse ou téléphone..."
                        className="w-full pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {filteredBoutiques.length === 0 ? (
                    <Card className="shadow-none border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground text-center text-lg">
                                {searchTerm
                                    ? `Aucun résultat pour "${searchTerm}".`
                                    : `Aucune boutique enregistrée.`}
                            </p>
                            {boutiques.length === 0 && !searchTerm && (
                                <Link
                                    href={BoutiqueController.create.url()}
                                    className="mt-4"
                                >
                                    <Button>
                                        <PlusIcon className="size-4 mr-2" />
                                        Créer votre première boutique
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredBoutiques.map((boutique) => (
                            <Card
                                key={boutique.id}
                                className="transition-all duration-200 hover:shadow-lg hover:border-primary/50"
                            >
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl">
                                            {boutique.nom}
                                        </CardTitle>
                                        <Badge variant="default">
                                            {boutique.produits_count} {boutique.produits_count <= 1 ? 'produit' : 'produits'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 mt-2">
                                        {boutique.adresse && (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <MapPinIcon className="size-3.5 mr-2" />
                                                {boutique.adresse}
                                            </div>
                                        )}
                                        {boutique.telephone && (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <PhoneIcon className="size-3.5 mr-2" />
                                                {boutique.telephone}
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardFooter className="flex gap-2 pt-4 border-t">
                                    <Link
                                        href={BoutiqueController.show.url(
                                            boutique.id,
                                        )}
                                        className="flex-1"
                                    >
                                        <Button variant="outline" size="sm" className="w-full">
                                            <EyeIcon className="size-4 mr-2" />
                                            Inventaire
                                        </Button>
                                    </Link>
                                    <Link
                                        href={BoutiqueController.edit.url(
                                            boutique.id,
                                        )}
                                        className="flex-shrink-0"
                                    >
                                        <Button variant="outline" size="sm">
                                            <PencilIcon className="size-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            handleDeleteClick(boutique)
                                        }
                                        className="flex-shrink-0"
                                    >
                                        <TrashIcon className="size-4" />
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
                            <DialogTitle>Supprimer la boutique</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer la boutique
                                **"{boutiqueToDelete?.nom}"** ?
                                <br />
                                <span className="text-red-600 font-semibold mt-2 block">
                                    Les produits associés ne seront pas supprimés, mais ne seront plus liés à cette boutique.
                                </span>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setBoutiqueToDelete(null);
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                            >
                                <TrashIcon className="size-4 mr-2" />
                                Supprimer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
