import SousCategorieController from '@/actions/App/Http/Controllers/SousCategorieController';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sous-catégories',
        href: SousCategorieController.index.url(),
    },
    {
        title: 'Modifier la sous-catégorie',
        href: '#',
    },
];

interface Categorie {
    id: number;
    nom: string;
}

interface SousCategorie {
    id: number;
    nom: string;
    categorie_id: number;
}

export default function SousCategoriesEdit({
    sousCategorie,
    categories,
}: {
    sousCategorie: SousCategorie;
    categories: Categorie[];
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modifier la sous-catégorie" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={SousCategorieController.index.url()}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeftIcon className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Modifier la sous-catégorie
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Modifiez les informations de la sous-catégorie
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informations de la sous-catégorie</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...SousCategorieController.update.form(sousCategorie.id)}
                            className="space-y-6"
                            options={{
                                preserveScroll: true,
                            }}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="nom">
                                            Nom <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="nom"
                                            name="nom"
                                            required
                                            defaultValue={sousCategorie.nom}
                                            placeholder="Ex: T-shirts"
                                        />
                                        <InputError message={errors.nom} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="categorie_id">
                                            Catégorie parente <span className="text-destructive">*</span>
                                        </Label>
                                        <select
                                            id="categorie_id"
                                            name="categorie_id"
                                            required
                                            className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                                            defaultValue={sousCategorie.categorie_id}
                                        >
                                            <option value="" disabled>
                                                Sélectionner une catégorie
                                            </option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.nom}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.categorie_id} />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Mise à jour...'
                                                : 'Mettre à jour'}
                                        </Button>
                                        <Link href={SousCategorieController.index.url()}>
                                            <Button variant="outline" type="button">
                                                Annuler
                                            </Button>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
