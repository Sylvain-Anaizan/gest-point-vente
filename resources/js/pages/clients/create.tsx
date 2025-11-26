import ClientController from '@/actions/App/Http/Controllers/ClientController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    MapPin,
    Building2,
    CheckCircle2,
    XCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch'; // J'utilise Switch au lieu de Checkbox, c'est plus moderne pour un statut
import { Separator } from '@/components/ui/separator';
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
        title: 'Nouveau client',
        href: ClientController.create.url(),
    },
];

export default function ClientsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nom: '',
        email: '',
        telephone: '',
        adresse: '',
        actif: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(ClientController.store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Création Client - Gest Anaizan" />

            <div className="mx-auto max-w-6xl space-y-8 py-4">
                {/* EN-TÊTE DE PAGE */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Nouveau Client
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Remplissez les informations ci-dessous pour ajouter un partenaire.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={ClientController.index.url()}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Annuler
                            </Button>
                        </Link>
                        {/* Bouton de sauvegarde visible sur mobile uniquement ici, sinon dans la sidebar */}
                        <Button onClick={handleSubmit} disabled={processing} className="md:hidden">
                            Sauvegarder
                        </Button>
                    </div>
                </div>

                <Separator />

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">

                        {/* COLONNE GAUCHE : INFO PRINCIPALES (prend 2/3 de l'espace) */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-t-4 border-t-primary shadow-md">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle>Identité & Contact</CardTitle>
                                            <CardDescription>Détails administratifs du client</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    {/* Nom */}
                                    <div className="space-y-2">
                                        <Label htmlFor="nom">Nom complet / Raison sociale <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="nom"
                                                className="pl-9 h-11 bg-muted/30 focus:bg-background transition-colors"
                                                value={data.nom}
                                                onChange={(e) => setData('nom', e.target.value)}
                                                placeholder="Ex: Entreprise Anaizan SARL"
                                                required
                                            />
                                        </div>
                                        {errors.nom && <p className="text-sm text-red-500 font-medium">{errors.nom}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Email */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Adresse Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    className="pl-9 h-11 bg-muted/30 focus:bg-background"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="contact@client.com"
                                                />
                                            </div>
                                            {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email}</p>}
                                        </div>

                                        {/* Téléphone */}
                                        <div className="space-y-2">
                                            <Label htmlFor="telephone">Téléphone <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="telephone"
                                                    className="pl-9 h-11 bg-muted/30 focus:bg-background"
                                                    value={data.telephone}
                                                    onChange={(e) => setData('telephone', e.target.value)}
                                                    placeholder="01 23 45 67 89"
                                                    required
                                                />
                                            </div>
                                            {errors.telephone && <p className="text-sm text-red-500 font-medium">{errors.telephone}</p>}
                                        </div>
                                    </div>

                                    {/* Adresse */}
                                    <div className="space-y-2">
                                        <Label htmlFor="adresse">Adresse postale <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Textarea
                                                id="adresse"
                                                className="pl-9 min-h-[100px] bg-muted/30 focus:bg-background resize-none"
                                                value={data.adresse}
                                                onChange={(e) => setData('adresse', e.target.value)}
                                                placeholder="Numéro, Rue, Code Postal, Ville..."
                                                required
                                            />
                                        </div>
                                        {errors.adresse && <p className="text-sm text-red-500 font-medium">{errors.adresse}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* COLONNE DROITE : STATUT & ACTIONS (prend 1/3 de l'espace) */}
                        <div className="space-y-6">

                            {/* Carte de Statut */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">État du compte</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">
                                                {data.actif ? 'Actif' : 'Inactif'}
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                {data.actif
                                                    ? 'Ce client est visible partout.'
                                                    : 'Ce client est archivé.'}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.actif}
                                            onCheckedChange={(checked) => setData('actif', checked)}
                                        />
                                    </div>
                                    {errors.actif && <p className="text-sm text-red-500 mt-2">{errors.actif}</p>}
                                </CardContent>
                            </Card>

                            {/* Carte de Résumé / Aide (Optionnel mais joli) */}
                            <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900 border-dashed">
                                <CardContent className="pt-6">
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 text-sm">Conseil Gest Anaizan</h4>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Assurez-vous que le numéro de téléphone est au format international si vous prévoyez d'envoyer des notifications SMS automatiques.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Actions Principales (Sticky Desktop) */}
                            <Card className="shadow-md border-0 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
                                <CardContent className="pt-6">
                                    <Button
                                        type="submit"
                                        className="w-full font-bold"
                                        size="lg"
                                        variant="secondary" // Contraste avec le fond noir de la card
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            'Sauvegarde...'
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" /> Enregistrer le client
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </form>
            </div>
        </AppLayout>
    );
}