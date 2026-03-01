import ProduitController from '@/actions/App/Http/Controllers/ProduitController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    PlusIcon,
    ArrowLeftIcon,
    TagIcon,
    Package,
    CloudUpload,
    Image as ImageIcon,
    SaveIcon,
    TrashIcon,
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

interface Boutique {
    id: number;
    nom: string;
}

interface Unite {
    id: number;
    nom: string;
}

interface Variante {
    id?: number;
    taille_id: number | null;
    prix_vente: number;
    quantite: number;
}

interface Produit {
    id: number;
    nom: string;
    description: string | null;
    imageUrl: string | null;
    categorie_id: number;
    boutique_id: number | null;
    unite_id: number | null;
    variantes: Variante[];
}

export default function ProduitsEdit({
    produit,
    categories,
    tailles,
    boutiques,
    unites,
}: {
    produit: Produit;
    categories: Category[];
    tailles: Taille[];
    boutiques: Boutique[];
    unites: Unite[];
}) {
    // Initialisation du formulaire avec les données du produit existant
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        _method: 'put',
        nom: produit.nom,
        categorie_id: produit.categorie_id,
        boutique_id: produit.boutique_id,
        unite_id: produit.unite_id,
        description: produit.description ?? '',
        image: null as File | null,
        variantes: produit.variantes.map(v => ({
            id: v.id,
            taille_id: v.taille_id,
            prix_vente: v.prix_vente,
            quantite: v.quantite,
        })) as Variante[],
    });

    // Aperçu de l'image : initialisé avec l'image existante ou null
    const [imagePreview, setImagePreview] = useState<string | null>(produit.imageUrl);

    // --- Gestion des Variantes ---
    const addVariante = () => {
        setData('variantes', [
            ...data.variantes,
            { taille_id: null, prix_vente: 0, quantite: 0 } as Variante
        ]);
    };

    const removeVariante = (index: number) => {
        if (data.variantes.length > 1) {
            const newVariantes = [...data.variantes];
            newVariantes.splice(index, 1);
            setData('variantes', newVariantes);
        }
    };

    const updateVariante = (index: number, field: string, value: any) => {
        const newVariantes = [...data.variantes];
        (newVariantes[index] as any)[field] = value;
        setData('variantes', newVariantes);
    };

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
                                            <Label htmlFor="unite_id">
                                                Unité de mesure
                                            </Label>
                                            <Select
                                                name="unite_id"
                                                value={data.unite_id?.toString() ?? "none"}
                                                onValueChange={(value) => {
                                                    if (value === "none") {
                                                        setData('unite_id', null);
                                                    } else {
                                                        setData('unite_id', parseInt(value));
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner une unité" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Par défaut (Pièce)</SelectItem>
                                                    {unites.map((unite) => (
                                                        <SelectItem
                                                            key={unite.id}
                                                            value={unite.id.toString()}
                                                        >
                                                            {unite.nom}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.unite_id} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="boutique_id">
                                                Boutique (optionnel)
                                            </Label>
                                            <Select
                                                name="boutique_id"
                                                value={data.boutique_id?.toString() ?? "none"}
                                                onValueChange={(value) => {
                                                    if (value === "none") {
                                                        setData('boutique_id', null);
                                                    } else {
                                                        setData('boutique_id', parseInt(value));
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner une boutique" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">
                                                        Stock général
                                                    </SelectItem>
                                                    {boutiques.map((boutique) => (
                                                        <SelectItem
                                                            key={boutique.id}
                                                            value={boutique.id.toString()}
                                                        >
                                                            {boutique.nom}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.boutique_id} />
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

                    {/* Carte Variantes (Tailles, Prix, Stock) - En pleine largeur pour un meilleur confort de saisie */}
                    <Card>
                        <CardHeader className="border-b flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-3">
                                    <Package className="h-5 w-5 text-primary" />
                                    Variantes (Tailles, Prix & Stock)
                                </CardTitle>
                                <CardDescription>
                                    Modifiez les tailles existantes ou ajoutez-en de nouvelles.
                                </CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addVariante}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Ajouter une taille
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {data.variantes.map((variante, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/30 relative group">
                                        <div className="space-y-2">
                                            <Label>Taille</Label>
                                            <Select
                                                value={variante.taille_id?.toString() ?? "none"}
                                                onValueChange={(val) => updateVariante(index, 'taille_id', val === "none" ? null : parseInt(val))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Taille" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">N/A</SelectItem>
                                                    {tailles.map(t => (
                                                        <SelectItem key={t.id} value={t.id.toString()}>{t.nom}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={(errors as any)[`variantes.${index}.taille_id`]} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Prix de vente (FCFA)</Label>
                                            <Input
                                                type="number"
                                                value={variante.prix_vente || ''}
                                                onChange={(e) => updateVariante(index, 'prix_vente', parseFloat(e.target.value) || 0)}
                                                placeholder="0"
                                            />
                                            <InputError message={(errors as any)[`variantes.${index}.prix_vente`]} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Stock actuel</Label>
                                            <Input
                                                type="number"
                                                value={variante.quantite || ''}
                                                onChange={(e) => updateVariante(index, 'quantite', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                            />
                                            <InputError message={(errors as any)[`variantes.${index}.quantite`]} />
                                        </div>

                                        <div className="flex items-end justify-end">
                                            {data.variantes.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeVariante(index)}
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <InputError message={errors.variantes} className="mt-4" />
                        </CardContent>
                    </Card>

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
            </div >
        </AppLayout >
    );
}