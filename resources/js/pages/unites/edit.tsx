import UniteController from '@/actions/App/Http/Controllers/UniteController';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

interface Unite {
    id: number;
    nom: string;
    description: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Unités de mesure',
        href: UniteController.index.url(),
    },
    {
        title: 'Modifier l\'unité',
        href: '#',
    },
];

export default function UnitesEdit({ unite }: { unite: Unite }) {
    const { data, setData, put, processing, errors } = useForm({
        nom: unite.nom,
        description: unite.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(UniteController.update.url(unite.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier l'unité: ${unite.nom}`} />

            <div className="max-w-2xl mx-auto space-y-6 pt-4">
                <div className="flex items-center gap-4">
                    <Link href={UniteController.index.url()}>
                        <Button variant="outline" size="icon" className="hover:bg-primary/5 transition-colors">
                            <ArrowLeftIcon className="size-5" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Modifier l'unité</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="border-primary/20 shadow-lg">
                        <CardHeader className="bg-primary/5 border-b mb-6">
                            <CardTitle>Détails de l'unité</CardTitle>
                            <CardDescription>
                                Modifiez les informations de l'unité de mesure <span className="font-bold text-foreground mx-1">"{unite.nom}"</span>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="nom" className="font-semibold text-foreground italic">
                                    Nom de l'unité
                                </Label>
                                <Input
                                    id="nom"
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value)}
                                    placeholder="Nom de l'unité..."
                                    className={`border-primary/20 focus-visible:ring-primary ${errors.nom ? 'border-destructive' : ''}`}
                                    required
                                />
                                {errors.nom && (
                                    <p className="text-sm font-medium text-destructive mt-1">
                                        {errors.nom}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="font-semibold text-foreground italic">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Détails descriptifs..."
                                    className="min-h-[120px] border-primary/20 focus-visible:ring-primary resize-none"
                                />
                                {errors.description && (
                                    <p className="text-sm font-medium text-destructive mt-1">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex items-center justify-end gap-3 pt-6 border-t bg-muted/30">
                            <Link href={UniteController.index.url()}>
                                <Button variant="ghost" type="button" className="hover:bg-background">
                                    Annuler
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing} className="px-8 bg-primary hover:bg-primary/90 transition-all font-bold">
                                <SaveIcon className="mr-2 size-4" />
                                {processing ? 'Mise à jour...' : 'Sauvegarder'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
