import EmployeController from '@/actions/App/Http/Controllers/EmployeController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    UserPlusIcon,
    ShieldIcon,
    StoreIcon,
    LockIcon,
    MailIcon,
    PhoneIcon,
    UserIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestion des Employés',
        href: EmployeController.index.url(),
    },
    {
        title: 'Nouveau membre',
        href: EmployeController.create.url(),
    },
];

interface Boutique {
    id: number;
    nom: string;
}

export default function EmployesCreate({
    boutiques,
}: {
    boutiques: Boutique[];
}) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        numero: '',
        password: '',
        password_confirmation: '',
        role: 'employé' as 'admin' | 'employé',
        boutique_id: null as number | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(EmployeController.store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouveau membre du personnel" />

            <div className="space-y-8 p-6">
                <div className="flex items-center gap-4">
                    <Link href={EmployeController.index.url()}>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                            <ArrowLeftIcon className="size-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Ajouter un Membre
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Créez un nouveau compte utilisateur et définissez ses droits d'accès.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Informations de base */}
                        <Card className="md:col-span-2">
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-3">
                                    <UserIcon className="h-5 w-5 text-primary" />
                                    Informations personnelles
                                </CardTitle>
                                <CardDescription>
                                    Identité et coordonnées du membre du personnel.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nom complet <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Ex: Jean Dupont"
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="numero">Téléphone</Label>
                                        <div className="relative">
                                            <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="numero"
                                                name="numero"
                                                className="pl-9"
                                                value={data.numero}
                                                onChange={(e) => setData('numero', e.target.value)}
                                                placeholder="Ex: +221 ..."
                                            />
                                        </div>
                                        <InputError message={errors.numero} />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="email">Adresse Email <span className="text-destructive">*</span></Label>
                                        <div className="relative">
                                            <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                className="pl-9"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Ex: jean.dupont@exemple.com"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rôles et Affectation */}
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-3">
                                    <ShieldIcon className="h-5 w-5 text-primary" />
                                    Rôle & Boutique
                                </CardTitle>
                                <CardDescription>
                                    Définissez le niveau d'accès et le lieu de travail.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Rôle <span className="text-destructive">*</span></Label>
                                    <Select
                                        name="role"
                                        value={data.role}
                                        onValueChange={(value) => setData('role', value as 'admin' | 'employé')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un rôle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Administrateur (Accès total)</SelectItem>
                                            <SelectItem value="employé">Employé (Accès limité)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.role} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="boutique_id">Boutique d'affectation</Label>
                                    <Select
                                        name="boutique_id"
                                        value={data.boutique_id?.toString() ?? "none"}
                                        onValueChange={(value) => {
                                            setData('boutique_id', value === "none" ? null : parseInt(value));
                                        }}
                                    >
                                        <SelectTrigger>
                                            <StoreIcon className="size-4 mr-2 text-muted-foreground" />
                                            <SelectValue placeholder="Sélectionner une boutique" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Toutes les boutiques / Stock Central</SelectItem>
                                            {boutiques.map((boutique) => (
                                                <SelectItem key={boutique.id} value={boutique.id.toString()}>
                                                    {boutique.nom}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.boutique_id} />
                                    <p className="text-[11px] text-muted-foreground">
                                        Note: Un employé ne verra que les produits de sa boutique assignée. Les administrateurs voient tout.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sécurité */}
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-3">
                                    <LockIcon className="h-5 w-5 text-primary" />
                                    Sécurité
                                </CardTitle>
                                <CardDescription>
                                    Définissez le mot de passe de connexion.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Mot de passe <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirmer le mot de passe <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        required
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing} className="px-8">
                            <UserPlusIcon className="size-4 mr-2" />
                            {processing ? 'Ajout en cours...' : 'Ajouter le membre'}
                        </Button>
                        <Link href={EmployeController.index.url()}>
                            <Button variant="outline" type="button">
                                Annuler
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
