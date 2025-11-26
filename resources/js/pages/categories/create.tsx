import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
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
        title: 'Cat?gories',
        href: CategoryController.index.url(),
    },
    {
        title: 'Nouvelle cat?gorie',
        href: CategoryController.create.url(),
    },
];

export default function CategoriesCreate() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle cat?gorie" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={CategoryController.index.url()}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeftIcon className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Nouvelle cat?gorie
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Cr?ez une nouvelle cat?gorie de produits
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informations de la cat?gorie</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...CategoryController.store.form()}
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
                                            placeholder="Ex: V?tements"
                                        />
                                        <InputError message={errors.nom} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={4}
                                            className="border-input flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Description de la cat?gorie (optionnel)"
                                        />
                                        <InputError message={errors.description} />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Cr?ation...'
                                                : 'Cr?er la cat?gorie'}
                                        </Button>
                                        <Link href={CategoryController.index.url()}>
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
