import BoutiqueController from '@/actions/App/Http/Controllers/BoutiqueController';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, StoreIcon, SaveIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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

            <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-indigo-50 dark:border-zinc-800">
                    <Link href={BoutiqueController.index.url()}>
                        <Button variant="secondary" size="icon" className="size-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 shrink-0">
                            <ArrowLeftIcon className="size-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-indigo-950 dark:text-white">
                            Modifier la boutique
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                            Mise à jour des informations de <strong className="text-indigo-600 dark:text-indigo-400 font-black">{boutique.nom}</strong>.
                        </p>
                    </div>
                </div>

                <Card className="border-0 shadow-xl shadow-indigo-500/5 ring-1 ring-indigo-100 dark:ring-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl">
                    <CardHeader className="pb-8 border-b border-indigo-50/50 dark:border-zinc-800/50 mb-8">
                        <CardTitle className="text-2xl font-black text-indigo-950 dark:text-white flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                                <StoreIcon className="size-6" />
                            </div>
                            Paramètres Opérationnels
                        </CardTitle>
                        <CardDescription className="font-medium text-slate-500 dark:text-slate-400">
                            Ajustez les coordonnées et informations de contact.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...BoutiqueController.update.form(boutique.id)}
                            className="space-y-6"
                        >
                            {({ processing, errors, recentlySuccessful }) => (
                                <>
                                    <div className="grid gap-8 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <Label htmlFor="nom" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                Nom de l'enseigne <span className="text-rose-500 font-bold">*</span>
                                            </Label>
                                            <Input
                                                id="nom"
                                                name="nom"
                                                required
                                                defaultValue={boutique.nom}
                                                placeholder="Ex: Boutique Centre-Ville"
                                                className="h-12 border-slate-200 dark:border-zinc-800 dark:bg-zinc-950 focus-visible:ring-indigo-500 rounded-xl"
                                            />
                                            <InputError message={errors.nom} />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="telephone" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                Contact Téléphonique
                                            </Label>
                                            <Input
                                                id="telephone"
                                                name="telephone"
                                                defaultValue={boutique.telephone || ''}
                                                placeholder="Ex: +225 07 00 00 00 00"
                                                className="h-12 border-slate-200 dark:border-zinc-800 dark:bg-zinc-950 focus-visible:ring-indigo-500 rounded-xl"
                                            />
                                            <InputError message={errors.telephone} />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4">
                                        <Label htmlFor="adresse" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            Adresse de localisation
                                        </Label>
                                        <Input
                                            id="adresse"
                                            name="adresse"
                                            defaultValue={boutique.adresse || ''}
                                            placeholder="Ex: 123 Rue de la République, Abidjan"
                                            className="h-12 border-slate-200 dark:border-zinc-800 dark:bg-zinc-950 focus-visible:ring-indigo-500 rounded-xl"
                                        />
                                        <InputError message={errors.adresse} />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-10">
                                        <Button
                                            type="submit"
                                            className="h-14 px-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 border-0 font-black uppercase tracking-widest text-xs transition-all flex-1"
                                            disabled={processing}
                                        >
                                            <SaveIcon className="mr-2 size-4 stroke-[3px]" />
                                            {processing ? 'SAUVEGARDE...' : 'ENREGISTRER LES MODIFICATIONS'}
                                        </Button>
                                        <Link href={BoutiqueController.index.url()} className="flex-1">
                                            <Button variant="outline" type="button" className="h-14 w-full rounded-xl border-slate-200 dark:border-zinc-800 font-black uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">
                                                Annuler
                                            </Button>
                                        </Link>
                                    </div>

                                    {recentlySuccessful && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold py-3 px-6 rounded-xl w-full flex justify-center mt-4">
                                                Mise à jour effectuée avec succès !
                                            </Badge>
                                        </motion.div>
                                    )}
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
