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
        title: 'Nouvelle sous-catégorie',
        href: SousCategorieController.create.url(),
    },
];

interface Categorie {
    id: number;
    nom: string;
}

export default function SousCategoriesCreate({
    categories,
}: {
    categories: Categorie[];
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle sous-catégorie" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={SousCategorieController.index.url()}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeftIcon className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Nouvelle sous-catégorie
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Créez une nouvelle sous-catégorie de produits
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informations de la sous-catégorie</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...SousCategorieController.store.form()}
                            className="space-y-6"
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
                                            defaultValue=""
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
                                                ? 'Création...'
                                                : 'Créer la sous-catégorie'}
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
