import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';
import { User, Phone, Mail, Lock, Loader2, ArrowRight, Command } from 'lucide-react';

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
    return (
        <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden">
            <Head title="Inscription - Gest Anaizan Master" />

            {/* COLONNE GAUCHE : IMAGE & BRANDING (Visible uniquement sur grand écran) */}
            <div className="hidden lg:flex relative h-full flex-col justify-center items-center p-12 bg-primary dark:bg-gray-900 border-r border-primary/50">

                {/* Logo/Titre */}
                <div className="absolute top-8 left-8 flex items-center gap-2 text-lg font-bold text-primary-foreground">
                    <Command className="h-6 w-6" />
                    <span>Gest Anaizan</span>
                </div>

                {/* Illustration ou Image Centrée */}
                <div className="max-w-md w-full p-4 bg-white backdrop-blur-sm rounded-lg shadow-2xl">
                    <img
                        src="/storage/anaizan.png" // Assurez-vous que le chemin est correct (souvent sans '/storage' si c'est dans le dossier public)
                        alt="Gest Anaizan Meeting"
                        className="w-full object-contain drop-shadow-lg"
                    />
                </div>

                <p className="mt-6 text-sm text-primary-foreground/80 text-center">
                    Gestion interne de nos stocks et vos ventes avec efficacité.
                </p>
            </div>

            {/* COLONNE DROITE : FORMULAIRE DANS UNE CARD */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
                <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Créer un compte
                        </CardTitle>
                        <CardDescription>
                            Entrez vos informations pour accéder au Master Dashboard
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

                                    <div className="text-center text-sm text-muted-foreground mt-4">
                                        Déjà membre ?{' '}
                                        <TextLink
                                            href={login()}
                                            className="underline underline-offset-4 hover:text-primary"
                                        >
                                            Connexion
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