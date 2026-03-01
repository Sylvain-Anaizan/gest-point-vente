import BoutiqueController from '@/actions/App/Http/Controllers/BoutiqueController';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, StoreIcon, SaveIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';

interface Boutique {
    id: number;
    nom: string;
    adresse: string | null;
    telephone: string | null;
}

export default function BoutiquesEdit({ boutique }: { boutique: Boutique }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Boutiques',
            href: BoutiqueController.index.url(),
        },
        {
            title: boutique.nom,
            href: BoutiqueController.show.url(boutique.id),
        },
        {
            title: 'Modifier',
            href: BoutiqueController.edit.url(boutique.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier : ${boutique.nom}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={BoutiqueController.index.url()}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeftIcon className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Modifier la boutique
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Mettez à jour les informations de **{boutique.nom}**.
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
                            Modifiez les coordonnées de ce point de vente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...BoutiqueController.update.form(boutique.id)}
                            className="space-y-6"
                        >
                            {({ processing, errors, recentlySuccessful }) => (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="nom">
                                            Nom <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="nom"
                                            name="nom"
                                            required
                                            defaultValue={boutique.nom}
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
                                            defaultValue={boutique.adresse || ''}
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
                                            defaultValue={boutique.telephone || ''}
                                            placeholder="Ex: +225 07 00 00 00 00"
                                        />
                                        <InputError message={errors.telephone} />
                                    </div>

                                    <div className="flex gap-4 items-center">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            <SaveIcon className="mr-2 h-4 w-4" />
                                            {processing
                                                ? 'Sauvegarde...'
                                                : 'Sauvegarder les modifications'}
                                        </Button>
                                        <Link href={BoutiqueController.index.url()}>
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
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
