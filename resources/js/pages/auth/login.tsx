import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { Command, Mail, Lock, Loader2, LogIn } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        // Container principal: Responsive grid (1 colonne mobile, 2 colonnes desktop)
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2 overflow-hidden">
            <Head title="Connexion - Gest Anaizan Master" />

            {/* COLONNE GAUCHE : IMAGE & BRANDING (Visible uniquement sur les grands écrans) */}
            <div className="hidden lg:flex relative h-full flex-col justify-center items-center p-8 bg-primary dark:bg-gray-900 border-r border-primary/50">

                {/* Logo/Titre */}
                <div className="absolute top-8 left-8 flex items-center gap-2 text-lg font-bold text-primary-foreground">
                    <Command className="h-6 w-6" />
                    <span>Gest Anaizan</span>
                </div>

                {/* Illustration ou Image Centrée */}
                <div className="max-w-md w-full p-4 bg-white backdrop-blur-sm rounded-lg shadow-2xl">
                    <img
                        src="/anaizan.png"
                        alt="Gest Anaizan Meeting"
                        className="w-full object-contain drop-shadow-lg"
                    />
                </div>

                <p className="mt-6 text-sm text-primary-foreground/80 text-center">
                    Gestion interne de nos stocks et vos ventes avec efficacité.
                </p>
            </div>


            {/* COLONNE DROITE : FORMULAIRE */}
            <div className="flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-background min-h-screen">
                <Card className="w-full max-w-md border-none shadow-none sm:border sm:shadow-2xl">

                    <CardHeader className="space-y-1 text-center p-6 sm:p-8">
                        {/* Logo visible sur mobile uniquement */}
                        <div className="flex lg:hidden justify-center mb-4">
                            {/* Utilisez un vrai logo ou l'icône Command */}
                            <Command className="h-8 w-8 text-primary" />
                        </div>

                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Bon retour parmi nous
                        </CardTitle>
                        <CardDescription>
                            Entrez vos identifiants pour accéder à votre espace
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 sm:p-8 pt-0">
                        {status && (
                            <div className="mb-4 rounded-md bg-green-50 p-3 text-sm font-medium text-green-600 border border-green-200 text-center">
                                {status}
                            </div>
                        )}

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="space-y-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Champ Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                className="pl-9"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="nom@anaizan.com"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Champ Mot de passe */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Mot de passe</Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-xs font-medium text-primary hover:underline"
                                                    tabIndex={5}
                                                >
                                                    Mot de passe oublié ?
                                                </TextLink>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                className="pl-9"
                                                type="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Se souvenir de moi */}
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="h-4 w-4"
                                        />
                                        <label
                                            htmlFor="remember"
                                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none cursor-pointer"
                                        >
                                            Se souvenir de moi
                                        </label>
                                    </div>

                                    {/* Bouton de Connexion */}
                                    <Button
                                        type="submit"
                                        className="w-full font-semibold h-10"
                                        size="lg"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                Se connecter <LogIn className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>

                                    {/* Lien d'inscription */}
                                    {canRegister && (
                                        <div className="text-center text-sm text-muted-foreground pt-2">
                                            Pas encore de compte ?{' '}
                                            <TextLink
                                                href={register()}
                                                tabIndex={6}
                                                className="font-semibold text-primary underline-offset-4 hover:underline"
                                            >
                                                S'inscrire gratuitement
                                            </TextLink>
                                        </div>
                                    )}
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}