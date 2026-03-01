import BoutiqueController from '@/actions/App/Http/Controllers/BoutiqueController';
import ProduitController from '@/actions/App/Http/Controllers/ProduitController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, MapPinIcon, PhoneIcon, PackageIcon, EyeIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';

interface Produit {
    id: number;
    nom: string;
    prix_vente: number;
    quantite: number;
    category: string;
    imageUrl: string;
}

interface Boutique {
    id: number;
    nom: string;
    adresse: string | null;
    telephone: string | null;
    produits: Produit[];
}

export default function BoutiquesShow({ boutique }: { boutique: Boutique }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Boutiques',
            href: BoutiqueController.index.url(),
        },
        {
            title: boutique.nom,
            href: BoutiqueController.show.url(boutique.id),
        },
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Inventaire : ${boutique.nom}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={BoutiqueController.index.url()}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeftIcon className="size-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {boutique.nom}
                        </h1>
                        <div className="flex flex-wrap gap-4 mt-2">
                            {boutique.adresse && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPinIcon className="size-4 mr-1" />
                                    {boutique.adresse}
                                </div>
                            )}
                            {boutique.telephone && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <PhoneIcon className="size-4 mr-1" />
                                    {boutique.telephone}
                                </div>
                            )}
                            <Badge variant="secondary">
                                {boutique.produits.length} {boutique.produits.length <= 1 ? 'type de produit' : 'types de produits'}
                            </Badge>
                        </div>
                    </div>
                    <Link href={BoutiqueController.edit.url(boutique.id)}>
                        <Button variant="outline">
                            Modifier la boutique
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PackageIcon className="size-5 text-primary" />
                                Inventaire de la boutique
                            </CardTitle>
                            <CardDescription>
                                Liste des produits actuellement stockés dans ce point de vente.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {boutique.produits.length === 0 ? (
                                <div className="text-center py-12 border border-dashed rounded-lg">
                                    <p className="text-muted-foreground">Aucun produit dans cet inventaire.</p>
                                    <Link href={ProduitController.create.url()} className="mt-4 inline-block">
                                        <Button>
                                            <ArrowLeftIcon className="size-4 mr-2 rotate-180" />
                                            Ajouter des produits
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="px-4 py-3 text-left font-medium">Produit</th>
                                                <th className="px-4 py-3 text-left font-medium">Catégorie</th>
                                                <th className="px-4 py-3 text-right font-medium">Prix</th>
                                                <th className="px-4 py-3 text-right font-medium">Stock</th>
                                                <th className="px-4 py-3 text-right font-medium">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {boutique.produits.map((produit) => (
                                                <tr key={produit.id} className="border-b transition-colors hover:bg-muted/30">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-10 rounded bg-muted overflow-hidden flex-shrink-0">
                                                                <img
                                                                    src={produit.imageUrl}
                                                                    alt={produit.nom}
                                                                    className="object-cover h-full w-full"
                                                                />
                                                            </div>
                                                            <span className="font-medium">{produit.nom}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Badge variant="outline">{produit.category}</Badge>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        {formatPrice(produit.prix_vente)}
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <span className={produit.quantite < 10 ? "text-yellow-600 font-bold" : ""}>
                                                            {produit.quantite}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <Link href={ProduitController.show.url(produit.id)}>
                                                            <Button variant="ghost" size="sm">
                                                                <EyeIcon className="size-4" />
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
