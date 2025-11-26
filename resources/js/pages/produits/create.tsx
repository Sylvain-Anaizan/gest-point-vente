import ProduitController from '@/actions/App/Http/Controllers/ProduitController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    TagIcon,
    DollarSign,
    Package,
    CloudUpload,
    Image as ImageIcon, // Icône pour l'affichage de l'aperçu
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

interface Taille {
    id: number;
    nom: string;
}

export default function ProduitsCreate({
    categories,
    tailles,
}: {
    categories: Category[];
    tailles: Taille[];
}) {
    const { data, setData, post, processing, errors } = useForm({
        nom: '',
        prix_vente: 0,
        quantite: 0,
        categorie_id: 0,
        taille_id: null as number | null,
        description: '',
        image: null as File | null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Mettre à jour l'aperçu de l'image lorsque le fichier change
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Inertia POST pour l'envoi de fichiers (multipart/form-data)
        post(ProduitController.store.url());
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
                                            Quantité initiale en stock{' '}
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