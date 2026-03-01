import EmployeController from '@/actions/App/Http/Controllers/EmployeController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon, ShieldIcon, StoreIcon, PhoneIcon, MailIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestion des Employés',
        href: EmployeController.index.url(),
    },
];

interface Boutique {
    id: number;
    nom: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    numero: string | null;
    role: 'admin' | 'employé';
    boutique_id: number | null;
    boutique?: Boutique | null;
}

export default function EmployesIndex({
    employes,
}: {
    employes: User[];
}) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [employeToDelete, setEmployeToDelete] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEmployes = useMemo(() => {
        if (!searchTerm) return employes;

        const lowercasedSearch = searchTerm.toLowerCase();
        return employes.filter((e) =>
            e.name.toLowerCase().includes(lowercasedSearch) ||
            e.email.toLowerCase().includes(lowercasedSearch) ||
            (e.numero && e.numero.toLowerCase().includes(lowercasedSearch)) ||
            (e.boutique && e.boutique.nom.toLowerCase().includes(lowercasedSearch))
        );
    }, [employes, searchTerm]);

    const handleDeleteClick = (employe: User) => {
        setEmployeToDelete(employe);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (employeToDelete) {
            router.delete(
                EmployeController.destroy.url(employeToDelete.id),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setDeleteDialogOpen(false);
                        setEmployeToDelete(null);
                    },
                },
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Employés" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Membres du personnel
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Gérez les accès et les affectations aux boutiques.
                        </p>
                    </div>
                    <Link href={EmployeController.create.url()}>
                        <Button>
                            <PlusIcon className="size-4 mr-2" />
                            Ajouter un membre
                        </Button>
                    </Link>
                </div>

                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par nom, email, téléphone ou boutique..."
                        className="w-full pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {filteredEmployes.length === 0 ? (
                    <Card className="shadow-none border-dashed border-2">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground text-center text-lg">
                                {searchTerm
                                    ? `Aucun résultat pour "${searchTerm}".`
                                    : `Aucun membre du personnel enregistré.`}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredEmployes.map((employe) => (
                            <Card
                                key={employe.id}
                                className="transition-all duration-200 hover:shadow-lg hover:border-primary/50 relative overflow-hidden"
                            >
                                <div className={`absolute top-0 left-0 w-1 h-full ${employe.role === 'admin' ? 'bg-primary' : 'bg-blue-400'}`} />
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl">
                                            {employe.name}
                                        </CardTitle>
                                        <Badge variant={employe.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                            <ShieldIcon className="size-3 mr-1" />
                                            {employe.role}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 mt-3">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <MailIcon className="size-3.5 mr-2" />
                                            {employe.email}
                                        </div>
                                        {employe.numero && (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <PhoneIcon className="size-3.5 mr-2" />
                                                {employe.numero}
                                            </div>
                                        )}
                                        <div className="flex items-center text-sm font-medium pt-2 text-primary">
                                            <StoreIcon className="size-3.5 mr-2" />
                                            {employe.boutique ? employe.boutique.nom : 'Stock Général / Toutes boutiques'}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex gap-2 pt-4 border-t bg-muted/20">
                                    <Link
                                        href={EmployeController.edit.url(employe.id)}
                                        className="flex-1"
                                    >
                                        <Button variant="outline" size="sm" className="w-full">
                                            <PencilIcon className="size-4 mr-2" />
                                            Modifier
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteClick(employe)}
                                    >
                                        <TrashIcon className="size-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Dialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer le membre</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer l'utilisateur
                                **"{employeToDelete?.name}"** ?
                                <br />
                                Cette action est irréversible.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setEmployeToDelete(null);
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                            >
                                <TrashIcon className="size-4 mr-2" />
                                Supprimer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
