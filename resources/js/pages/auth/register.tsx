import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head, Link } from '@inertiajs/react';
import { User, Phone, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
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

// Tu peux retirer AuthLayout si tu veux que cette page prenne tout l'écran
// ou l'adapter. Ici, je construis une page pleine page autonome.

export default function Register() {
    // Détecter le rôle depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    const roleValue = (roleParam === 'admin' || roleParam === 'employé') ? roleParam : 'customer';

    const isAppAccount = roleValue === 'admin' || roleValue === 'employé';
    const roleTitle = roleValue === 'admin' ? 'Administrateur' : roleValue === 'employé' ? 'Employé' : 'Client';

    return (
        <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden">
            <Head title="Inscription - Gest Anaizan Master" />

            {/* COLONNE GAUCHE : IMAGE & BRANDING (Visible uniquement sur grand écran) */}
            <div className="hidden lg:flex relative h-full flex-col justify-center items-center p-12 bg-primary dark:bg-gray-900 border-r border-primary/50">

                {/* Logo/Titre */}
                <Link href="/" className="absolute top-8 left-8 flex items-center gap-3 text-lg font-bold text-primary-foreground animate-in fade-in slide-in-from-left-5 duration-700 hover:opacity-80 transition-opacity">
                    <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                        <img src="/storage/anaizan.png" alt="Logo" className="h-6 w-6 object-contain brightness-0 invert" />
                    </div>
                    <div className="flex flex-col -space-y-1">
                        <span className="text-xl tracking-tighter uppercase font-black">GEST ANAIZAN</span>
                        <span className="text-[8px] uppercase tracking-[0.3em] opacity-70">Management</span>
                    </div>
                </Link>

                {/* Illustration ou Image Centrée */}
                <div className="relative group max-w-sm w-full">
                    <div className="absolute -inset-1 bg-white/20 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-500" />
                    <div className="relative p-8 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
                        <img
                            src="/storage/anaizan.png"
                            alt="Gest Anaizan Branding"
                            className="w-full h-auto object-contain drop-shadow-2xl scale-110 group-hover:scale-125 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                    </div>
                </div>

                <div className="mt-12 text-center max-w-sm">
                    <h3 className="text-2xl font-bold text-primary-foreground mb-4">Rejoignez l'Élite.</h3>
                    <p className="text-sm text-primary-foreground/70 leading-relaxed font-medium">
                        Propulsez votre gestion vers de nouveaux sommets avec notre interface intelligente et sécurisée.
                    </p>
                </div>
            </div>

            {/* COLONNE DROITE : FORMULAIRE DANS UNE CARD */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative">
                {/* Petits orbes de fond */}
                <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-[20%] left-[10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

                <Card className="w-full max-w-md border-0 shadow-none sm:border-2 sm:border-border/50 sm:shadow-2xl sm:rounded-[2.5rem] bg-card overflow-hidden">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-3xl font-black tracking-tight text-foreground">
                            Inscription {roleTitle}
                        </CardTitle>
                        <CardDescription>
                            {isAppAccount
                                ? "Créez votre compte master pour gérer l'écosystème Anaizan"
                                : "Entrez vos informations pour accéder au Master Dashboard"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            {...store.form()}
                            resetOnSuccess={['password', 'password_confirmation']}
                            disableWhileProcessing
                            className="space-y-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <input type="hidden" name="role" value={roleValue} />
                                    {/* Grid pour Nom et Numéro */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nom</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="name"
                                                    className="pl-9"
                                                    placeholder="Jean"
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    name="name"
                                                />
                                            </div>
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="numero">Numéro</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="numero"
                                                    className="pl-9"
                                                    placeholder="Tél"
                                                    type="text"
                                                    required
                                                    name="numero"
                                                />
                                            </div>
                                            <InputError message={errors.numero} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                className="pl-9"
                                                placeholder="admin@anaizan.com"
                                                type="email"
                                                required
                                                name="email"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Mot de passe</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                className="pl-9"
                                                type="password"
                                                required
                                                name="password"
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirmation</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password_confirmation"
                                                className="pl-9"
                                                type="password"
                                                required
                                                name="password_confirmation"
                                            />
                                        </div>
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-primary hover:bg-primary/90"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                S'inscrire <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>

                                    <div className="text-center text-sm text-muted-foreground mt-4 pt-6 border-t border-border/50">
                                        Déjà membre ?{' '}
                                        <TextLink
                                            href={roleParam ? `${login()}?role=${roleParam}` : login()}
                                            className="font-bold text-primary underline-offset-4 hover:underline"
                                        >
                                            Se connecter
                                        </TextLink>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}