import TailleController from '@/actions/App/Http/Controllers/TailleController';
import ProduitController from '@/actions/App/Http/Controllers/ProduitController'; // Ajouté (hypothétique)
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, PackageIcon, BoxIcon, StoreIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Ajouté pour le style
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter, // Ajouté pour le bouton
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Separator } from '@/components/ui/separator';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tailles',
        href: TailleController.index.url(),
    },
    {
        title: 'Détails',
        href: '#',
    },
];

interface Produit {
    id: number;
    nom: string;
    prix_vente: number;
    quantite: number;
    category: string;
    imageUrl: string;
}

interface Taille {
    id: number;
    nom: string;
    description: string | null;
    produits: Produit[];
}

export default function TaillesShow({ taille }: { taille: Taille }) {

    // Fonction pour formater le prix en FCFA
    const formatPrice = (price: number) => {
        return price.toLocaleString('fr-FR', {
            style: 'currency',
            currency: 'XOF', // Code ISO pour le FCFA
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).replace('XOF', 'FCFA');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={taille.nom} />

            <div className="space-y-8">
                {/* Section d'en-tête et d'actions (Amélioration visuelle) */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <Link href={TailleController.index.url()} className="shrink-0">
                            <Button variant="outline" size="icon">
                                <ArrowLeftIcon className="size-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">
                                {taille.nom}
                            </h1>
                            {taille.description && (
                                <p className="text-muted-foreground mt-1 max-w-xl">
                                    {taille.description}
                                </p>
                            )}
                            {!taille.description && (
                                <p className="text-muted-foreground mt-1 max-w-xl">
                                    Détails de la taille
                                </p>
                            )}
                        </div>
                    </div>
                    <Link href={TailleController.edit.url(taille.id)} className="w-full sm:w-auto shrink-0">
                        <Button className="w-full sm:w-auto">Modifier la Taille</Button>
                    </Link>
                </header>

                {/* Section des produits */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <PackageIcon className="size-5 text-primary" />
                            Produits Associés
                        </CardTitle>
                        <CardDescription>
                            Liste des {taille.produits.length} produits utilisant cette taille.
                        </CardDescription>
                        <Separator className="mt-2" />
                    </CardHeader>

                    <CardContent>
                        {taille.produits.length === 0 ? (
                            <div className="text-muted-foreground text-center py-10 border rounded-lg bg-secondary/5">
                                <BoxIcon className="size-8 mx-auto mb-3 text-secondary-foreground/50" />
                                <p className="font-medium">
                                    Aucun produit n'est associé à cette taille.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {taille.produits.map((produit) => (
                                    <Card
                                        key={produit.id}
                                        className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50"
                                    >
                                        {/* Image du produit */}
                                        <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 border-b">
                                            {produit.imageUrl ? (
                                                <img
                                                    src={produit.imageUrl}
                                                    alt={`Image de ${produit.nom}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-muted-foreground/50">
                                                    <BoxIcon className="size-12" />
                                                </div>
                                            )}
                                        </div>

                                        <CardHeader className="p-4 pb-2">
                                            <CardTitle className="text-base font-semibold truncate hover:text-primary transition-colors">
                                                <Link href={ProduitController.show.url(produit.id)}>
                                                    {produit.nom}
                                                </Link>
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="space-y-2 p-4 pt-2">

                                            {/* Prix et Catégorie */}
                                            <div className="flex items-center justify-between text-sm">
                                                <Badge variant="secondary" className="font-semibold text-primary">
                                                    {produit.category}
                                                </Badge>
                                                <span className="text-lg font-bold text-gray-800">
                                                    {formatPrice(produit.prix_vente)}
                                                </span>
                                            </div>

                                            {/* Quantité en stock */}
                                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <StoreIcon className="size-3.5" /> Stock:
                                                </span>
                                                <span className={`font-semibold ${produit.quantite < 10 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {produit.quantite} Unités
                                                </span>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="p-4 pt-0">
                                            <Link href={ProduitController.show.url(produit.id)} className="w-full">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    Voir les détails
                                                </Button>
                                            </Link>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}