import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { User, Mail, Save, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

import DeleteUser from '@/components/delete-user'; // On suppose que ce composant gère la modale
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
import { Separator } from "@/components/ui/separator";
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';

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
                    <Card className="shadow-sm border-muted">
                        <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b bg-muted/20">
                            <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                                <AvatarImage src="" alt={auth.user.name} />
                                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <CardTitle>Informations personnelles</CardTitle>
                                <CardDescription>
                                    Mettez à jour vos informations d'identification et votre adresse email.
                                </CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                            <Form
                                {...ProfileController.update.form()}
                                options={{
                                    preserveScroll: true,
                                }}
                                className="space-y-6"
                            >
                                {({ processing, recentlySuccessful, errors }) => (
                                    <>
                                        <div className="grid gap-6 md:grid-cols-2">
                                            {/* NOM */}
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Nom complet</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="name"
                                                        className="pl-9"
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
                                                <Label htmlFor="email">Adresse Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        className="pl-9"
                                                        defaultValue={auth.user.email}
                                                        name="email"
                                                        required
                                                        autoComplete="username"
                                                        placeholder="email@exemple.com"
                                                    />
                                                </div>
                                                <InputError message={errors.email} />
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

                                        <div className="flex items-center gap-4 pt-2">
                                            <Button
                                                disabled={processing}
                                                data-test="update-profile-button"
                                                className="min-w-[140px]"
                                            >
                                                {processing ? (
                                                    "Sauvegarde..."
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" /> Enregistrer
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
                                                <p className="flex items-center text-sm font-medium text-green-600 dark:text-green-500">
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

                    {/* ZONE DE DANGER (SUPPRESSION) */}
                    <Card className="border-destructive/30 shadow-none bg-red-50/30 dark:bg-red-900/10">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-destructive">
                                <ShieldAlert className="h-5 w-5" />
                                <CardTitle className="text-lg">Zone de danger</CardTitle>
                            </div>
                            <CardDescription>
                                La suppression de votre compte est irréversible. Toutes vos données seront effacées.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* On passe le composant DeleteUser existant, mais encadré proprement */}
                            <div className="flex justify-end">
                                <DeleteUser />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}