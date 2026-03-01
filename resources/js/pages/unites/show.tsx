import UniteController from '@/actions/App/Http/Controllers/UniteController';
import ProduitController from '@/actions/App/Http/Controllers/ProduitController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, PackageIcon, BoxIcon, RulerIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Separator } from '@/components/ui/separator';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Unités de mesure',
        href: UniteController.index.url(),
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

interface Unite {
    id: number;
    nom: string;
    description: string | null;
    produits: Produit[];
}

export default function UnitesShow({ unite }: { unite: Unite }) {
    const formatPrice = (price: number) => {
        return price.toLocaleString('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).replace('XOF', 'FCFA');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Unité: ${unite.nom}`} />

            <div className="space-y-8">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
                    <div className="flex items-start gap-4">
                        <Link href={UniteController.index.url()}>
                            <Button variant="outline" size="icon" className="shrink-0 hover:bg-primary/5">
                                <ArrowLeftIcon className="size-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                                    {unite.nom}
                                </h1>
                                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-3 py-1 text-sm font-bold">
                                    Unité de mesure
                                </Badge>
                            </div>
                            {unite.description ? (
                                <p className="text-muted-foreground mt-2 max-w-2xl text-lg leading-relaxed">
                                    {unite.description}
                                </p>
                            ) : (
                                <p className="text-muted-foreground mt-2 italic">
                                    Aucune description fournie pour cette unité.
                                </p>
                            )}
                        </div>
                    </div>
                    <Link href={UniteController.edit.url(unite.id)} className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all font-bold">
                            Modifier l'Unité
                        </Button>
                    </Link>
                </header>

                <Card className="border-primary/10 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
                            <PackageIcon className="size-6 text-primary" />
                            Produits Quantifiés en {unite.nom}
                        </CardTitle>
                        <CardDescription className="text-base">
                            Il y a {unite.produits.length} produits associés à cette unité.
                        </CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent className="p-6">
                        {unite.produits.length === 0 ? (
                            <div className="text-muted-foreground text-center py-16 border-2 border-dashed rounded-xl bg-secondary/5">
                                <BoxIcon className="size-16 mx-auto mb-4 text-muted-foreground/20" />
                                <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
                                <p className="max-w-xs mx-auto text-sm">
                                    Cette unité n'est pas encore assignée à des produits de votre inventaire.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {unite.produits.map((produit) => (
                                    <Card
                                        key={produit.id}
                                        className="overflow-hidden h-full group transition-all duration-300 hover:shadow-xl hover:border-primary/30 flex flex-col"
                                    >
                                        <div className="aspect-[16/10] w-full overflow-hidden bg-muted relative">
                                            {produit.imageUrl ? (
                                                <img
                                                    src={produit.imageUrl}
                                                    alt={produit.nom}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <BoxIcon className="size-12 text-muted-foreground/30" />
                                                </div>
                                            )}
                                        </div>

                                        <CardHeader className="p-4 pb-2 grow">
                                            <Badge variant="secondary" className="w-fit mb-2 text-[10px] uppercase tracking-wider font-bold">
                                                {produit.category}
                                            </Badge>
                                            <CardTitle className="text-lg font-bold truncate group-hover:text-primary transition-colors">
                                                {produit.nom}
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="p-4 pt-0 space-y-4">
                                            <div className="flex items-end justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Prix Min</span>
                                                    <span className="text-xl font-black text-foreground antialiased tracking-tight">
                                                        {formatPrice(produit.prix_vente)}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Stock</span>
                                                    <span className={`text-lg font-bold ${produit.quantite < 10 ? 'text-destructive animate-pulse' : 'text-green-600'}`}>
                                                        {produit.quantite} <span className="text-xs font-normal text-muted-foreground italic">({unite.nom}s)</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="p-4 pt-0 border-t bg-muted/20">
                                            <Link href={ProduitController.show.url(produit.id)} className="w-full pt-4">
                                                <Button variant="secondary" size="sm" className="w-full font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                                                    Consulter
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
