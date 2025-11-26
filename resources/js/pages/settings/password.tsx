import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';
import { Lock, KeyRound, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { edit } from '@/routes/user-password';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Paramètres',
        href: '/settings', // Ajuste selon ta route
    },
    {
        title: 'Sécurité',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sécurité du compte" />

            <SettingsLayout>
                <div className="space-y-6 max-w-2xl">

                    {/* Zone d'information (Optionnelle mais recommandée) */}
                    <Alert className="bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100">
                        <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertTitle>Recommandations de sécurité</AlertTitle>
                        <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
                            Utilisez un mot de passe d'au moins 12 caractères, incluant des chiffres et des symboles pour protéger vos données Gest Anaizan.
                        </AlertDescription>
                    </Alert>

                    <Card className="shadow-sm">
                        <CardHeader className="border-b bg-muted/20 pb-4">
                            <CardTitle className="text-xl">Modifier le mot de passe</CardTitle>
                            <CardDescription>
                                Assurez-vous que votre compte utilise un mot de passe long et aléatoire pour rester sécurisé.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-6">
                            <Form
                                {...PasswordController.update.form()}
                                options={{
                                    preserveScroll: true,
                                }}
                                resetOnError={[
                                    'password',
                                    'password_confirmation',
                                    'current_password',
                                ]}
                                resetOnSuccess
                                onError={(errors) => {
                                    if (errors.password) {
                                        passwordInput.current?.focus();
                                    }

                                    if (errors.current_password) {
                                        currentPasswordInput.current?.focus();
                                    }
                                }}
                                className="space-y-6"
                            >
                                {({ errors, processing, recentlySuccessful }) => (
                                    <>
                                        {/* Mot de passe actuel */}
                                        <div className="space-y-2">
                                            <Label htmlFor="current_password">
                                                Mot de passe actuel
                                            </Label>
                                            <div className="relative">
                                                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="current_password"
                                                    ref={currentPasswordInput}
                                                    name="current_password"
                                                    type="password"
                                                    className="pl-9"
                                                    autoComplete="current-password"
                                                    placeholder="••••••••••••"
                                                />
                                            </div>
                                            <InputError
                                                message={errors.current_password}
                                            />
                                        </div>

                                        <div className="grid gap-6 md:grid-cols-2">
                                            {/* Nouveau mot de passe */}
                                            <div className="space-y-2">
                                                <Label htmlFor="password">
                                                    Nouveau mot de passe
                                                </Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="password"
                                                        ref={passwordInput}
                                                        name="password"
                                                        type="password"
                                                        className="pl-9"
                                                        autoComplete="new-password"
                                                        placeholder="Nouveau mot de passe"
                                                    />
                                                </div>
                                                <InputError message={errors.password} />
                                            </div>

                                            {/* Confirmation */}
                                            <div className="space-y-2">
                                                <Label htmlFor="password_confirmation">
                                                    Confirmer le mot de passe
                                                </Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="password_confirmation"
                                                        name="password_confirmation"
                                                        type="password"
                                                        className="pl-9"
                                                        autoComplete="new-password"
                                                        placeholder="Confirmer mot de passe"
                                                    />
                                                </div>
                                                <InputError
                                                    message={errors.password_confirmation}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 pt-2">
                                            <Button
                                                disabled={processing}
                                                data-test="update-password-button"
                                                className="w-full md:w-auto"
                                            >
                                                {processing ? 'Sauvegarde...' : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" /> Mettre à jour
                                                    </>
                                                )}
                                            </Button>

                                            <Transition
                                                show={recentlySuccessful}
                                                enter="transition ease-in-out duration-300"
                                                enterFrom="opacity-0 -translate-x-2"
                                                enterTo="opacity-100 translate-x-0"
                                                leave="transition ease-in-out duration-1000"
                                                leaveTo="opacity-0"
                                            >
                                                <div className="flex items-center text-sm font-medium text-green-600 dark:text-green-500">
                                                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                                    Sauvegardé avec succès
                                                </div>
                                            </Transition>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}