import ProduitController from '@/actions/App/Http/Controllers/ProduitController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    Package,
    TagIcon,
    RulerIcon,
    PencilIcon,
    DollarSign,
    AlertTriangle,
    Image as ImageIcon // Icône pour l'image
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Produits',
        href: ProduitController.index.url(),
    },
    {
        title: 'Détails',
        href: '#',
    },
];

interface Category {
    id: number;
    nom: string;
}

interface Unite {
    id: number;
    nom: string;
}

interface Variante {
    id: number;
    taille: string;
    prix: number;
    stock: number;
}

interface Produit {
    id: number;
    nom: string;
    prixMin: number;
    prixMax: number;
    totalStock: number;
    description: string | null;
    imageUrl: string | null;
    category: Category;
    unite: Unite | null;
    variantes: Variante[];
}

// Fonction pour formater les montants : pas de décimales, espaces pour les milliers
const formatMontant = (montant: string | number | null | undefined): string => {
    let numericValue: number;
    if (typeof montant === 'string') {
        const cleaned = montant.replace(/[^\d.,-]/g, '').replace(',', '.');
        numericValue = parseFloat(cleaned);
    } else if (typeof montant === 'number') {
        numericValue = montant;
    } else if (montant === null || montant === undefined) {
        return '0';
    } else {
        numericValue = Number(montant);
    }
    if (isNaN(numericValue)) {
        return '0';
    }
    return Math.round(numericValue).toLocaleString('fr-FR');
};

export default function ProduitsShow({ produit }: { produit: Produit }) {
    // Déterminer la classe de couleur pour le stock
    const stockClass =
        produit.totalStock === 0
            ? 'text-destructive font-bold'
            : produit.totalStock < 10
                ? 'text-orange-500 font-bold'
                : 'text-green-600 font-bold';

    // URL de l'image de placeholder générique
    const placeholderUrl = 'https://placehold.co/600x600/eeeeee/333333?text=PRODUIT+IMAGE';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={produit.nom} />

            <div className="space-y-6 m-6">

                {/* --- HEADER: TITRE & ACTION --- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                        <Link href={ProduitController.index.url()}>
                            <Button variant="ghost" size="icon" className="flex-shrink-0">
                                <ArrowLeftIcon className="size-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">
                                {produit.nom}
                            </h1>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary">{produit.category.nom}</Badge>
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <RulerIcon className="size-3" />
                                    {produit.variantes.length} Variantes
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <Link href={ProduitController.edit.url(produit.id)}>
                        <Button className="w-full sm:w-auto">
                            <PencilIcon className="mr-2 size-4" />
                            Modifier le produit
                        </Button>
                    </Link>
                </div>

                {/* --- GRID DE DÉTAILS (3 Colonnes : 1 pour l'image/KPIs, 2 pour la description/metadata) --- */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Colonne 1: Image & Prix/Stock */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Carte Image du Produit (Nouveau Bloc) */}
                        <Card className="overflow-hidden">
                            <CardHeader className="p-0 border-b">
                                <div className="relative aspect-square bg-muted flex items-center justify-center">
                                    <img
                                        src={produit.imageUrl || placeholderUrl}
                                        alt={`Image de ${produit.nom}`}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = placeholderUrl;
                                        }}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
                                <ImageIcon className="size-4" />
                                Image principale du produit
                            </CardContent>
                        </Card>

                        {/* Carte Prix */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <DollarSign className="size-4 text-primary" />
                                    Prix de Vente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-primary">
                                    {produit.prixMin === produit.prixMax ? (
                                        `${formatMontant(produit.prixMin)} FCFA`
                                    ) : (
                                        `${formatMontant(produit.prixMin)} - ${formatMontant(produit.prixMax)} FCFA`
                                    )}
                                </div>
                                <CardDescription className="text-sm mt-1">
                                    {produit.prixMin === produit.prixMax ? 'Prix unique' : 'Gamme de prix'}
                                </CardDescription>
                            </CardContent>
                        </Card>

                        {/* Carte Stock */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Package className="size-4 text-primary" />
                                    Stock Total
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-4xl font-extrabold flex items-center gap-2 ${stockClass}`}>
                                    {produit.totalStock === 0 && <AlertTriangle className="size-6" />}
                                    {produit.totalStock}
                                </div>
                                <CardDescription className="text-sm mt-1">
                                    {produit.totalStock > 1 ? 'unités disponibles' : 'unité disponible'}{' '}
                                    {produit.unite ? `(${produit.unite.nom})` : '(Pièce)'} au total
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Colonnes 2 & 3: Description et Autres Informations */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Carte 1: Description */}
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle>Description du Produit</CardTitle>
                                <CardDescription>
                                    Détails complets du produit
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                {produit.description ? (
                                    <p className="text-muted-foreground whitespace-pre-line">
                                        {produit.description}
                                    </p>
                                ) : (
                                    <p className="text-muted-foreground italic">
                                        Aucune description détaillée n'a été fournie pour ce produit.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Carte 2: Variantes */}
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <RulerIcon className="size-5" />
                                    Variantes et Stocks par Taille
                                </CardTitle>
                                <CardDescription>
                                    Détails de l'inventaire par déclinaison.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b">
                                            <tr>
                                                <th className="px-6 py-3 font-semibold">Taille</th>
                                                <th className="px-6 py-3 font-semibold">Prix</th>
                                                <th className="px-6 py-3 font-semibold text-right">Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {produit.variantes.map((v) => (
                                                <tr key={v.id} className="border-b hover:bg-muted/10 transition-colors">
                                                    <td className="px-6 py-4 font-medium">{v.taille}</td>
                                                    <td className="px-6 py-4">{formatMontant(v.prix)} FCFA</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Badge variant={v.stock === 0 ? "destructive" : v.stock < 10 ? "secondary" : "outline"} className="h-6">
                                                            {v.stock} en stock
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Carte 3: Classification */}
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <TagIcon className="size-5" />
                                    Classification
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1 p-2 rounded-md bg-muted/50">
                                    <span className="text-xs font-semibold text-muted-foreground block">Nom interne</span>
                                    <span className="font-medium">{produit.nom}</span>
                                </div>
                                <div className="space-y-1 p-2 rounded-md bg-muted/50">
                                    <span className="text-xs font-semibold text-muted-foreground block">Catégorie</span>
                                    <Badge variant="default">{produit.category.nom}</Badge>
                                </div>
                                <div className="space-y-1 p-2 rounded-md bg-muted/50">
                                    <span className="text-xs font-semibold text-muted-foreground block">ID Produit</span>
                                    <span className="font-mono text-sm">{produit.id}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}