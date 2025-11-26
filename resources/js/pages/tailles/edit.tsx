import TailleController from '@/actions/App/Http/Controllers/TailleController';
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
        title: 'Tailles',
        href: TailleController.index.url(),
    },
    {
        title: 'Modifier la taille',
        href: '#',
    },
];

interface Taille {
    id: number;
    nom: string;
    description: string | null;
}

export default function TaillesEdit({ taille }: { taille: Taille }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modifier la taille" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={TailleController.index.url()}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeftIcon className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Modifier la taille
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Modifiez les informations de la taille
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informations de la taille</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...TailleController.update.form(taille.id)}
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
                                            defaultValue={taille.nom}
                                            placeholder="Ex: S, M, L, XL"
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
                                            defaultValue={taille.description || ''}
                                            className="border-input flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Description de la taille (optionnel)"
                                        />
                                        <InputError message={errors.description} />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Mise ? jour...'
                                                : 'Mettre ? jour'}
                                        </Button>
                                        <Link href={TailleController.index.url()}>
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
