import ProduitController from '@/actions/App/Http/Controllers/ProduitController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    TagIcon,
    DollarSign,
    Package,
    CloudUpload,
    Image as ImageIcon,
    SaveIcon // Icône pour Sauvegarder
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Textarea } from '@/components/ui/textarea';

// Définitions d'interfaces (identiques à la page Create/Show)
interface Category {
    id: number;
    nom: string;
}

interface Taille {
    id: number;
    nom: string;
}

interface Produit {
    id: number;
    nom: string;
    prix_vente: number;
    quantite: number;
    description: string | null;
    imageUrl: string | null; // URL de l'image existante
    categorie_id: number;
    taille_id: number | null;
}

export default function ProduitsEdit({
    produit,
    categories,
    tailles,
}: {
    produit: Produit;
    categories: Category[];
    tailles: Taille[];
}) {
    // Initialisation du formulaire avec les données du produit existant
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        _method: 'put', // Méthode pour simuler la requête PUT/PATCH via POST
        nom: produit.nom,
        prix_vente: produit.prix_vente,
        quantite: produit.quantite,
        categorie_id: produit.categorie_id,
        taille_id: produit.taille_id,
        description: produit.description ?? '',
        // L'image est null initialement, elle sera envoyée seulement si l'utilisateur la modifie
        image: null as File | null,
    });

    // Aperçu de l'image : initialisé avec l'image existante ou null
    const [imagePreview, setImagePreview] = useState<string | null>(produit.imageUrl);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setData('image', file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            // Si l'utilisateur annule la sélection, revenir à l'image existante
            setImagePreview(produit.imageUrl);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Envoi du formulaire en utilisant la méthode POST avec le champ _method='put'
        post(ProduitController.update.url(produit.id));
    };

    // Breadcrumbs dynamiques pour l'édition
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Produits',
            href: ProduitController.index.url(),
        },
        {
            title: produit.nom,
            href: ProduitController.show.url(produit.id),
        },
        {
            title: 'Modifier',
            href: ProduitController.edit.url(produit.id),
        },
    ];

    const placeholderUrl = 'https://placehold.co/600x600/eeeeee/333333?text=PRODUIT+IMAGE';


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier : ${produit.nom}`} />

            <div className="space-y-8 p-6">
                {/* --- HEADER --- */}
                <div className="flex items-center gap-4">
                    <Link href={ProduitController.show.url(produit.id)}>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                            <ArrowLeftIcon className="size-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Modification de Produit
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Mettez à jour les informations, le prix ou l'inventaire du produit **{produit.nom}**.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid lg:grid-cols-3 gap-6">

                        {/* COLONNE 1: Image & Prix/Stock */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Carte Média et Aperçu */}
                            <Card>
                                <CardHeader className="border-b">
                                    <CardTitle className="flex items-center gap-3">
                                        <CloudUpload className="h-5 w-5 text-primary" />
                                        Média
                                    </CardTitle>
                                    <CardDescription>
                                        Mettez à jour l'image du produit (l'ancienne sera remplacée).
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {/* Aperçu de l'image */}
                                    <div className="flex items-center justify-center h-48 w-full border border-dashed rounded-lg bg-muted/50 overflow-hidden">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Aperçu de l'image"
                                                className="object-cover h-full w-full"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.onerror = null;
                                                    target.src = placeholderUrl;
                                                }}
                                            />
                                        ) : (
                                            <div className="text-center text-muted-foreground">
                                                <ImageIcon className="size-8 mx-auto mb-2" />
                                                <p className="text-sm">Aucune image définie</p>
                                            </div>
                                        )}

                                        {produit.imageUrl && <img
                                            src={produit.imageUrl}
                                            alt="Aperçu de l'image"
                                            className="object-cover h-full w-full"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = placeholderUrl;
                                            }}
                                        />}
                                    </div>

                                    {/* Champ de fichier */}
                                    <div className="space-y-2">
                                        <Label htmlFor="image">
                                            Sélectionner une nouvelle image (Laisser vide pour garder l'ancienne)
                                        </Label>
                                        <Input
                                            id="image"
                                            name="image"
                                            type="file"
                                            accept="image/png, image/jpeg"
                                            onChange={handleImageChange}
                                        />
                                        <InputError message={errors.image} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Carte Prix et Inventaire (Condensed) */}
                            <Card>
                                <CardHeader className="border-b">
                                    <CardTitle className="flex items-center gap-3">
                                        <DollarSign className="h-5 w-5 text-primary" />
                                        Prix & Stock
                                    </CardTitle>
                                    <CardDescription>
                                        Informations financières et d'inventaire.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {/* Prix de vente */}
                                    <div className="space-y-2">
                                        <Label htmlFor="prix_vente">
                                            Prix de vente (FCFA){' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="prix_vente"
                                                name="prix_vente"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                required
                                                value={data.prix_vente || ''}
                                                onChange={(e) =>
                                                    setData(
                                                        'prix_vente',
                                                        parseFloat(e.target.value) || 0,
                                                    )
                                                }
                                                placeholder="0.00"
                                                className="pr-16"
                                            />
                                            <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                                FCFA
                                            </Badge>
                                        </div>
                                        <InputError message={errors.prix_vente} />
                                    </div>

                                    {/* Quantité en stock */}
                                    <div className="space-y-2">
                                        <Label htmlFor="quantite">
                                            Quantité actuelle en stock{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="quantite"
                                                name="quantite"
                                                type="number"
                                                min="0"
                                                required
                                                value={data.quantite || ''}
                                                onChange={(e) =>
                                                    setData(
                                                        'quantite',
                                                        parseInt(e.target.value) || 0,
                                                    )
                                                }
                                                placeholder="0"
                                                className="pl-8"
                                            />
                                            <Package className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <InputError message={errors.quantite} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* COLONNE 2 & 3: Informations de base et Description */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Carte 1: Informations de base (Nom, Catégorie, Taille, Description) */}
                            <Card>
                                <CardHeader className="border-b">
                                    <CardTitle className="flex items-center gap-3">
                                        <TagIcon className="h-5 w-5 text-primary" />
                                        Détails principaux
                                    </CardTitle>
                                    <CardDescription>
                                        Nom, classification et description du produit.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">

                                    {/* Nom du produit */}
                                    <div className="space-y-2">
                                        <Label htmlFor="nom">
                                            Nom du produit <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="nom"
                                            name="nom"
                                            required
                                            value={data.nom}
                                            onChange={(e) =>
                                                setData('nom', e.target.value)
                                            }
                                            placeholder="Ex: T-shirt en coton"
                                        />
                                        <InputError message={errors.nom} />
                                    </div>

                                    {/* Catégorie et Taille en grille 2 colonnes */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="categorie_id">
                                                Catégorie <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                name="categorie_id"
                                                // Assurez-vous que l'initialisation est correcte
                                                value={data.categorie_id ? data.categorie_id.toString() : undefined}
                                                onValueChange={(value) =>
                                                    setData(
                                                        'categorie_id',
                                                        parseInt(value) || 0,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner une catégorie" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem
                                                            key={category.id}
                                                            value={category.id.toString()}
                                                        >
                                                            {category.nom}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.categorie_id} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="taille_id">
                                                Taille (optionnel)
                                            </Label>
                                            <Select
                                                name="taille_id"
                                                // Utilise 'none' comme valeur si taille_id est null
                                                value={data.taille_id?.toString() ?? "none"}
                                                onValueChange={(value) => {
                                                    if (value === "none") {
                                                        setData('taille_id', null);
                                                    } else {
                                                        setData('taille_id', parseInt(value));
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner une taille" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">
                                                        Aucune taille (N/A)
                                                    </SelectItem>
                                                    {tailles.map((taille) => (
                                                        <SelectItem
                                                            key={taille.id}
                                                            value={taille.id.toString()}
                                                        >
                                                            {taille.nom}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.taille_id} />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            Description (Détails complets)
                                        </Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            rows={5}
                                            value={data.description}
                                            onChange={(e) =>
                                                setData('description', e.target.value)
                                            }
                                            placeholder="Description détaillée du produit (optionnel)"
                                        />
                                        <InputError message={errors.description} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Footer d'actions */}
                    <div className="flex gap-4 p-0 items-center">
                        <Button
                            type="submit"
                            disabled={processing || data.categorie_id === 0}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <SaveIcon className="mr-2 h-4 w-4" />
                            {processing
                                ? 'Sauvegarde...'
                                : 'Sauvegarder les modifications'}
                        </Button>
                        <Link href={ProduitController.show.url(produit.id)}>
                            <Button variant="outline" type="button">
                                Annuler
                            </Button>
                        </Link>
                        {recentlySuccessful && (
                            <Badge variant="secondary" className="text-green-600 border-green-600/30">
                                Modifications sauvegardées !
                            </Badge>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}