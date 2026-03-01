import BoutiqueController from '@/actions/App/Http/Controllers/BoutiqueController';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, StoreIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Boutiques',
        href: BoutiqueController.index.url(),
    },
    {
        title: 'Nouvelle boutique',
        href: BoutiqueController.create.url(),
    },
];

export default function BoutiquesCreate() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle boutique" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={BoutiqueController.index.url()}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeftIcon className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Nouvelle boutique
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Enregistrez un nouveau point de vente.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <StoreIcon className="size-5 text-primary" />
                            Informations de la boutique
                        </CardTitle>
                        <CardDescription>
                            Saisissez les coordonnées de votre nouveau point de vente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...BoutiqueController.store.form()}
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
                                            placeholder="Ex: Boutique Centre-Ville"
                                        />
                                        <InputError message={errors.nom} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="adresse">
                                            Adresse
                                        </Label>
                                        <Input
                                            id="adresse"
                                            name="adresse"
                                            placeholder="Ex: 123 Rue de la République"
                                        />
                                        <InputError message={errors.adresse} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="telephone">
                                            Téléphone
                                        </Label>
                                        <Input
                                            id="telephone"
                                            name="telephone"
                                            placeholder="Ex: +225 07 00 00 00 00"
                                        />
                                        <InputError message={errors.telephone} />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Création...'
                                                : 'Créer la boutique'}
                                        </Button>
                                        <Link href={BoutiqueController.index.url()}>
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
