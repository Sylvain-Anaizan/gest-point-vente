import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, PackageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

// URL de remplacement pour les images manquantes
const PLACEHOLDER_IMAGE = "https://placehold.co/400x300/e5e7eb/6b7280?text=Image+Produit";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Catégories',
        href: CategoryController.index.url(),
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
    taille: string | null;
    imageUrl: string; // Ajouté et rendu obligatoire pour l'affichage
}

interface Category {
    id: number;
    nom: string;
    description: string | null;
    produits: Produit[];
}

export default function CategoriesShow({
    category,
}: {
    category: Category;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={category.nom} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={CategoryController.index.url()}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeftIcon className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {category.nom}
                            </h1>
                            {category.description && (
                                <p className="text-muted-foreground mt-2">
                                    {category.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <Link href={CategoryController.edit.url(category.id)}>
                        <Button>Modifier la catégorie</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PackageIcon className="size-5 text-primary" />
                            Produits ({category.produits.length})
                        </CardTitle>
                        <CardDescription>
                            Liste complète des produits appartenant à cette catégorie.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {category.produits.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg bg-gray-50">
                                <PackageIcon className="size-10 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground text-center">
                                    Aucun produit n'est actuellement associé à cette catégorie.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {category.produits.map((produit) => (
                                    <Card
                                        key={produit.id}
                                        className="overflow-hidden transition-all duration-300 hover:shadow-lg"
                                    >
                                        {/* Image du produit */}
                                        <div className="aspect-video w-full bg-gray-100 flex items-center justify-center">
                                            <img
                                                src={produit.imageUrl || PLACEHOLDER_IMAGE}
                                                alt={`Image de ${produit.nom}`}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                onError={(e) => {
                                                    // Remplace l'image par le placeholder en cas d'erreur de chargement
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = PLACEHOLDER_IMAGE;
                                                }}
                                            />
                                        </div>

                                        <CardContent className="space-y-3 p-4">
                                            <CardTitle className="text-lg line-clamp-2 min-h-[2.5em]">
                                                {produit.nom}
                                            </CardTitle>
                                            <div className="border-t pt-3 space-y-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">
                                                        Prix de vente:
                                                    </span>
                                                    <span className="font-semibold text-primary">
                                                        {produit.prix_vente.toFixed(2)} FCFA
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">
                                                        Stock disponible:
                                                    </span>
                                                    <span className="font-medium">
                                                        {produit.quantite} unités
                                                    </span>
                                                </div>
                                                {produit.taille && (
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-muted-foreground">
                                                            Taille/Format:
                                                        </span>
                                                        <span className="font-medium text-gray-700">
                                                            {produit.taille}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
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