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
import { Form, Head, Link } from '@inertiajs/react';
import { Command, Mail, Lock, Loader2, LogIn, Sparkles, ShieldCheck } from 'lucide-react';

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
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const roleParam = urlParams.get('role');
    const isAppAccount = roleParam === 'admin' || roleParam === 'employé';
    const roleTitle = roleParam === 'admin' ? 'Administrateur' : roleParam === 'employé' ? 'Vendeur' : '';

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2 overflow-hidden relative">
            <Head title="Connexion - Gest Anaizan Master" />

            {/* Fond animé avec dégradé */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-primary/10 dark:via-background dark:to-primary/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
            </div>

            {/* COLONNE GAUCHE : IMAGE & BRANDING */}
            <div className="hidden lg:flex relative h-full flex-col justify-center items-center p-8 bg-gradient-to-br from-primary via-primary/95 to-primary/90 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

                {/* Effet de grille en arrière-plan */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

                {/* Orbes lumineux flottants */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl animate-pulse delay-1000" />

                {/* Logo/Titre avec animation */}
                <Link href="/" className="absolute top-8 left-8 flex items-center gap-3 text-lg font-bold text-primary-foreground animate-in fade-in slide-in-from-left-5 duration-700 hover:opacity-80 transition-opacity">
                    <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                        <img src="/storage/anaizan.png" alt="Logo" className="h-6 w-6 object-contain brightness-0 invert" />
                    </div>
                    <div className="flex flex-col -space-y-1">
                        <span className="text-xl tracking-tighter">GEST ANAIZAN</span>
                        <span className="text-[8px] uppercase tracking-[0.3em] opacity-70">Management</span>
                    </div>
                </Link>

                {/* Contenu central */}
                <div className="relative z-10 max-w-lg w-full space-y-8 animate-in fade-in zoom-in-95 duration-1000">
                    {/* Image avec effet glassmorphism */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-foreground/20 to-primary-foreground/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                        <div className="relative p-6 bg-white/95 dark:bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
                            <img
                                src="/anaizan.png"
                                alt="Gest Anaizan"
                                className="w-full object-contain drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>

                    {/* Texte descriptif */}
                    <div className="text-center space-y-4 px-4">
                        <h2 className="text-4xl font-black text-primary-foreground tracking-tight">
                            {roleTitle ? `Portail ${roleTitle}` : 'Bienvenue sur Gest Anaizan'}
                        </h2>
                        <p className="text-lg text-primary-foreground/80 leading-relaxed font-medium">
                            {isAppAccount
                                ? "Accédez à vos outils de gestion et pilotez vos opérations en temps réel."
                                : "Gérez vos stocks et vos ventes avec efficacité grâce à notre interface moderne."}
                        </p>

                        {/* Features badges */}
                        <div className="flex flex-wrap gap-3 justify-center pt-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full border border-primary-foreground/20">
                                <ShieldCheck className="h-4 w-4 text-primary-foreground" />
                                <span className="text-sm text-primary-foreground font-medium">Sécurisé</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full border border-primary-foreground/20">
                                <Sparkles className="h-4 w-4 text-primary-foreground" />
                                <span className="text-sm text-primary-foreground font-medium">Moderne</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-8 left-0 right-0 text-center">
                    <p className="text-xs text-primary-foreground/60">
                        © 2026 Gest Anaizan. Tous droits réservés.
                    </p>
                </div>
            </div>

            {/* COLONNE DROITE : FORMULAIRE */}
            <div className="flex items-center justify-center p-4 sm:p-6 lg:p-12 min-h-screen">
                <div className="w-full max-w-md animate-in fade-in slide-in-from-right-5 duration-700">
                    <Card className="border-none shadow-none sm:border sm:shadow-xl sm:bg-card/50 sm:backdrop-blur-sm">

                        <CardHeader className="space-y-3 text-center p-6 sm:p-8">
                            {/* Logo mobile avec animation */}
                            <div className="flex lg:hidden justify-center mb-2">
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <Command className="h-10 w-10 text-primary" />
                                </div>
                            </div>

                            <CardTitle className="text-3xl font-black tracking-tight text-foreground">
                                {roleTitle ? `Connexion ${roleTitle}` : 'Bon retour !'}
                            </CardTitle>
                            <CardDescription className="text-base">
                                Connectez-vous pour accéder à votre espace
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 sm:p-8 pt-0">
                            {status && (
                                <div className="mb-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 p-4 text-sm font-medium text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 text-center shadow-sm">
                                    {status}
                                </div>
                            )}

                            <Form
                                {...store.form()}
                                resetOnSuccess={['password']}
                                className="space-y-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        {/* Champ Email */}
                                        <div className="space-y-2 group">
                                            <Label htmlFor="email" className="text-sm font-semibold">
                                                Adresse email
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    id="email"
                                                    className="pl-11 h-12 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                                        <div className="space-y-2 group">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password" className="text-sm font-semibold">
                                                    Mot de passe
                                                </Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                                                        tabIndex={5}
                                                    >
                                                        Mot de passe oublié ?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    id="password"
                                                    className="pl-11 h-12 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                                className="h-5 w-5 border-2"
                                            />
                                            <label
                                                htmlFor="remember"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none cursor-pointer"
                                            >
                                                Se souvenir de moi
                                            </label>
                                        </div>

                                        {/* Bouton de Connexion */}
                                        <Button
                                            type="submit"
                                            className="w-full font-semibold h-12 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                            size="lg"
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Connexion en cours...
                                                </>
                                            ) : (
                                                <>
                                                    Se connecter
                                                    <LogIn className="ml-2 h-5 w-5" />
                                                </>
                                            )}
                                        </Button>

                                        {/* Lien d'inscription */}
                                        {canRegister && (
                                            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                                                <p className="mt-4">
                                                    Pas encore de compte ?{' '}
                                                    <TextLink
                                                        href={roleParam ? `${register()}?role=${roleParam}` : register()}
                                                        tabIndex={6}
                                                        className="font-bold text-primary underline-offset-4 hover:underline transition-colors"
                                                    >
                                                        Créer un compte
                                                    </TextLink>
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}