import ClientController from '@/actions/App/Http/Controllers/ClientController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tableau de bord',
        href: '/dashboard',
    },
    {
        title: 'Clients',
        href: ClientController.index.url(),
    },
    {
        title: 'Modifier le client',
        href: '#',
    },
];

interface Client {
    id: number;
    nom: string;
    email: string | null;
    telephone: string;
    adresse: string;
    actif: boolean;
}

export default function ClientsEdit({ client }: { client: Client }) {
    const { data, setData, patch, processing, errors } = useForm({
        nom: client.nom,
        email: client.email || '',
        telephone: client.telephone,
        adresse: client.adresse,
        actif: client.actif,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(ClientController.update.url(client.id), {
            onSuccess: () => {
                // Redirect is handled by the controller
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${client.nom}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Modifier le client
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Modifiez les informations de {client.nom}.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={ClientController.show.url(client.id)}>
                            <Button variant="outline">
                                Voir le client
                            </Button>
                        </Link>
                        <Link href={ClientController.index.url()}>
                            <Button variant="outline">
                                <ArrowLeftIcon className="size-4 mr-2" />
                                Retour à la liste
                            </Button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations</CardTitle>
                                <CardDescription>
                                    Les informations de base du client.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nom">Nom *</Label>
                                    <Input
                                        id="nom"
                                        value={data.nom}
                                        onChange={(e) => setData('nom', e.target.value)}
                                        placeholder="Nom complet"
                                        required
                                    />
                                    {errors.nom && (
                                        <p className="text-sm text-red-600">{errors.nom}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="client@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="telephone">Téléphone *</Label>
                                    <Input
                                        id="telephone"
                                        value={data.telephone}
                                        onChange={(e) => setData('telephone', e.target.value)}
                                        placeholder="01 23 45 67 89"
                                        required
                                    />
                                    {errors.telephone && (
                                        <p className="text-sm text-red-600">{errors.telephone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="adresse">Adresse *</Label>
                                    <Textarea
                                        id="adresse"
                                        value={data.adresse}
                                        onChange={(e) => setData('adresse', e.target.value)}
                                        placeholder="Adresse complète"
                                        rows={3}
                                        required
                                    />
                                    {errors.adresse && (
                                        <p className="text-sm text-red-600">{errors.adresse}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id="actif"
                                        checked={data.actif}
                                        onCheckedChange={(checked) => setData('actif', !!checked)}
                                    />
                                    <Label htmlFor="actif">Client actif</Label>
                                </div>
                                {errors.actif && (
                                    <p className="text-sm text-red-600">{errors.actif}</p>
                                )}
                            </CardContent>
                            <div className="p-6 pt-0 flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    <SaveIcon className="size-4 mr-2" />
                                    {processing ? 'Modification...' : 'Modifier le client'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
