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
    TrashIcon,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
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
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Produits',
        href: ProduitController.index.url(),
    },
    {
        title: 'Nouveau produit',
        href: ProduitController.create.url(),
    },
];

interface Category {
    id: number;
    nom: string;
}

interface SousCategorie {
    id: number;
    nom: string;
    categorie_id: number;
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

export default function ProduitsCreate({
    categories,
    sousCategories,
    tailles,
    boutiques,
    unites,
}: {
    categories: Category[];
    sousCategories: SousCategorie[];
    tailles: Taille[];
    boutiques: Boutique[];
    unites: Unite[];
}) {
    const { data, setData, post, processing, errors } = useForm({
        nom: '',
        categorie_id: 0,
        sous_categorie_id: null as number | null,
        boutique_id: null as number | null,
        unite_id: null as number | null,
        description: '',
        image: null as File | null,
        variantes: [
            { taille_id: null as number | null, prix_vente: 0, quantite: 0 }
        ] as { taille_id: number | null; prix_vente: number; quantite: number }[],
    });

    // Sous-catégories filtrées par catégorie sélectionnée
    const filteredSousCategories = sousCategories.filter(
        (sc) => sc.categorie_id === data.categorie_id
    );

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // --- Gestion des Variantes ---
    const addVariante = () => {
        setData('variantes', [
            ...data.variantes,
            { taille_id: null, prix_vente: 0, quantite: 0 }
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(ProduitController.store.url());
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
            setImagePreview(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouveau produit" />

            <div className="space-y-8 p-6">
                {/* --- HEADER --- */}
                <div className="flex items-center gap-4">
                    <Link href={ProduitController.index.url()}>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                            <ArrowLeftIcon className="size-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Création de Produit
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Ajoutez un nouveau produit à votre catalogue et définissez ses propriétés.
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
                                        Téléchargez l'image principale du produit.
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
                                            />
                                        ) : (
                                            <div className="text-center text-muted-foreground">
                                                <ImageIcon className="size-8 mx-auto mb-2" />
                                                <p className="text-sm">Aucun aperçu disponible</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Champ de fichier */}
                                    <div className="space-y-2">
                                        <Label htmlFor="image">
                                            Sélectionner l'image (JPG, PNG)
                                        </Label>
                                        <Input
                                            id="image"
                                            name="image"
                                            type="file"
                                            //accept="image/png, image/jpeg"
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
                                                onValueChange={(value) => {
                                                    setData((prev) => ({
                                                        ...prev,
                                                        categorie_id: parseInt(value) || 0,
                                                        sous_categorie_id: null,
                                                    }));
                                                }}
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
                                            <Label htmlFor="sous_categorie_id">
                                                Sous-catégorie
                                            </Label>
                                            <Select
                                                name="sous_categorie_id"
                                                value={data.sous_categorie_id?.toString() ?? "none"}
                                                onValueChange={(value) => {
                                                    setData('sous_categorie_id', value === "none" ? null : parseInt(value));
                                                }}
                                                disabled={!data.categorie_id || filteredSousCategories.length === 0}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner une sous-catégorie" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Aucune</SelectItem>
                                                    {filteredSousCategories.map((sc) => (
                                                        <SelectItem
                                                            key={sc.id}
                                                            value={sc.id.toString()}
                                                        >
                                                            {sc.nom}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.sous_categorie_id} />
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
                                                        Selectionner votre boutique
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
                                    Définissez les différentes tailles disponibles, leurs prix et stocks respectifs.
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
                                            <Label>Stock initial</Label>
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
                    <div className="flex gap-4 p-0">
                        <Button
                            type="submit"
                            disabled={processing || data.categorie_id === 0} // Désactiver si la catégorie n'est pas sélectionnée
                        >
                            {processing
                                ? 'Création en cours...'
                                : 'Créer le produit'}
                        </Button>
                        <Link href={ProduitController.index.url()}>
                            <Button variant="outline" type="button">
                                Annuler
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}