import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { User, Mail, Save, CheckCircle2, AlertTriangle, ShieldCheck, Phone, Calendar, BadgeCheck } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Paramètres',
        href: '/settings',
    },
    {
        title: 'Mon Profil',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    // Helper pour les initiales
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mon Profil" />

            <SettingsLayout>
                <div className="space-y-8 max-w-3xl">

                    {/* CARTE D'INFORMATION PROFIL */}
                    <Card className="shadow-sm border-muted overflow-hidden">
                        <CardHeader className="flex flex-row items-center gap-4 pb-6 border-b bg-muted/20 relative">
                            <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                                <AvatarImage src="" alt={auth.user.name} />
                                <AvatarFallback className="text-xl bg-primary text-primary-foreground font-black">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1.5 pt-2">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-2xl">{auth.user.name}</CardTitle>
                                    <Badge variant="secondary" className="px-2 py-0 h-6 capitalize bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                                        {auth.user.role}
                                    </Badge>
                                </div>
                                <CardDescription className="text-sm">
                                    Gérez vos informations personnelles et vos préférences de contact.
                                </CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-8">
                            <Form
                                {...ProfileController.update.form()}
                                options={{
                                    preserveScroll: true,
                                }}
                                className="space-y-8"
                            >
                                {({ processing, recentlySuccessful, errors }) => (
                                    <>
                                        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                                            {/* NOM */}
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nom complet</Label>
                                                <div className="relative group">
                                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="name"
                                                        className="pl-9 h-11 bg-muted/10 group-hover:bg-muted/20 transition-colors"
                                                        defaultValue={auth.user.name}
                                                        name="name"
                                                        required
                                                        autoComplete="name"
                                                        placeholder="Votre nom"
                                                    />
                                                </div>
                                                <InputError message={errors.name} />
                                            </div>

                                            {/* EMAIL */}
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Adresse Email</Label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        className="pl-9 h-11 bg-muted/10 group-hover:bg-muted/20 transition-colors"
                                                        defaultValue={auth.user.email}
                                                        name="email"
                                                        required
                                                        autoComplete="username"
                                                        placeholder="email@exemple.com"
                                                    />
                                                </div>
                                                <InputError message={errors.email} />
                                            </div>

                                            {/* NUMERO (NOUVEAU) */}
                                            <div className="space-y-2">
                                                <Label htmlFor="numero" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Numéro de téléphone</Label>
                                                <div className="relative group">
                                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="numero"
                                                        className="pl-9 h-11 bg-muted/10 group-hover:bg-muted/20 transition-colors"
                                                        defaultValue={auth.user.numero as string || ''}
                                                        name="numero"
                                                        placeholder="Ex: 00000000"
                                                    />
                                                </div>
                                                <InputError message={errors.numero} />
                                            </div>
                                        </div>

                                        {/* ALERT VERIFICATION EMAIL */}
                                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                                            <Alert variant="destructive" className="bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200">
                                                <AlertTriangle className="h-4 w-4 !text-orange-600 dark:!text-orange-400" />
                                                <AlertTitle className="ml-2">Attention requise</AlertTitle>
                                                <AlertDescription className="ml-2 mt-1">
                                                    Votre adresse email n'est pas vérifiée.
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="ml-1 font-medium underline underline-offset-4 hover:text-orange-900 dark:hover:text-orange-100"
                                                    >
                                                        Cliquez ici pour renvoyer le lien.
                                                    </Link>
                                                    {status === 'verification-link-sent' && (
                                                        <div className="mt-2 font-medium text-green-600 dark:text-green-400 flex items-center">
                                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                                            Un nouveau lien de vérification a été envoyé.
                                                        </div>
                                                    )}
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        <div className="flex items-center gap-4 pt-4">
                                            <Button
                                                disabled={processing}
                                                data-test="update-profile-button"
                                                className="min-w-[160px] h-11 shadow-md shadow-primary/20"
                                            >
                                                {processing ? (
                                                    "Sauvegarde..."
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
                                                    </>
                                                )}
                                            </Button>

                                            <Transition
                                                show={recentlySuccessful}
                                                enter="transition ease-in-out duration-300"
                                                enterFrom="opacity-0 translate-y-2"
                                                enterTo="opacity-100 translate-y-0"
                                                leave="transition ease-in-out duration-1000"
                                                leaveTo="opacity-0"
                                            >
                                                <p className="flex items-center text-sm font-semibold text-green-600 dark:text-green-500">
                                                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                                    Modifications enregistrées
                                                </p>
                                            </Transition>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>

                    {/* INFOS COMPLEMENTAIRES (REMPLACE SUPPRESSION) */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="bg-blue-50/30 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800/30">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                                        <BadgeCheck className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Rôle de l'utilisateur</h4>
                                        <p className="text-xs text-blue-700/70 dark:text-blue-400/60 leading-relaxed uppercase tracking-widest font-black">
                                            {auth.user.role}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-50 border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-800">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Date d'inscription</h4>
                                        <p className="text-xs text-zinc-500 leading-relaxed">
                                            {auth.user.created_at ? format(new Date(auth.user.created_at as string), "d MMMM yyyy", { locale: fr }) : "Non spécifiée"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}