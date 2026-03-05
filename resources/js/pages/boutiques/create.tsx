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

            <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-indigo-50">
                    <Link href={BoutiqueController.index.url()}>
                        <Button variant="secondary" size="icon" className="size-12 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shrink-0">
                            <ArrowLeftIcon className="size-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-indigo-950">
                            Nouvelle point de vente
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Étendez votre réseau en ajoutant une nouvelle boutique physique.
                        </p>
                    </div>
                </div>

                <Card className="border-0 shadow-xl shadow-indigo-500/5 ring-1 ring-indigo-100 bg-white/70 backdrop-blur-xl">
                    <CardHeader className="pb-8 border-b border-indigo-50/50 mb-8">
                        <CardTitle className="text-2xl font-black text-indigo-950 flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                                <StoreIcon className="size-6" />
                            </div>
                            Configuration Boutique
                        </CardTitle>
                        <CardDescription className="font-medium text-slate-500">
                            Saisissez les informations opérationnelles nécessaires.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...BoutiqueController.store.form()}
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-8 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <Label htmlFor="nom" className="text-xs font-black uppercase tracking-widest text-slate-400">
                                                Nom de l'enseigne <span className="text-rose-500 font-bold">*</span>
                                            </Label>
                                            <Input
                                                id="nom"
                                                name="nom"
                                                required
                                                placeholder="Ex: Boutique Centre-Ville"
                                                className="h-12 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                                            />
                                            <InputError message={errors.nom} />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="telephone" className="text-xs font-black uppercase tracking-widest text-slate-400">
                                                Contact Téléphonique
                                            </Label>
                                            <Input
                                                id="telephone"
                                                name="telephone"
                                                placeholder="Ex: +225 07 00 00 00 00"
                                                className="h-12 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                                            />
                                            <InputError message={errors.telephone} />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4">
                                        <Label htmlFor="adresse" className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Adresse de localisation
                                        </Label>
                                        <Input
                                            id="adresse"
                                            name="adresse"
                                            placeholder="Ex: 123 Rue de la République, Abidjan"
                                            className="h-12 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                                        />
                                        <InputError message={errors.adresse} />
                                    </div>

                                    <div className="flex gap-4 pt-10">
                                        <Button
                                            type="submit"
                                            className="h-14 px-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 border-0 font-black uppercase tracking-widest text-xs transition-all flex-1"
                                            disabled={processing}
                                        >
                                            {processing ? 'TRAITEMENT...' : 'CRÉER LA BOUTIQUE'}
                                        </Button>
                                        <Link href={BoutiqueController.index.url()} className="flex-1">
                                            <Button variant="outline" type="button" className="h-14 w-full rounded-xl border-slate-200 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">
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
