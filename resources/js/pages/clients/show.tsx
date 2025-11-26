import ClientController from '@/actions/App/Http/Controllers/ClientController';
import VenteController from '@/actions/App/Http/Controllers/VenteController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    PencilIcon,
    MailIcon,
    PhoneIcon,
    MapPinIcon,
    UserCheckIcon,
    UserXIcon,
    ShoppingCart,
    DollarSign,
    Calendar,
    Receipt,
    Eye,
    Package,
    CreditCard,
    BarChart3,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

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
        title: 'Détails du client',
        href: '#',
    },
];

interface Client {
    id: number;
    nom: string;
    email: string | null;
    telephone: string;
    adresse: string;
    actif: boolean;
    created_at: string;
    updated_at: string;
}

interface User {
    id: number;
    name: string;
}

interface Produit {
    id: number;
    nom: string;
}

interface LigneVente {
    id: number;
    quantite: number;
    prix_unitaire: number | string;
    sous_total: number | string;
    produit: Produit;
}

interface Vente {
    id: number;
    numero: string;
    montant_total: number | string;
    statut: 'complétée' | 'annulée';
    mode_paiement: 'espèces' | 'carte' | 'virement' | 'mobile_money';
    created_at: string;
    user: User;
    lignes: LigneVente[];
}

interface Stats {
    total_ventes: number;
    total_montant: number | string;
    derniere_vente: string | null;
}

export default function ClientsShow({
    client,
    ventes,
    stats,
    filters
}: {
    client: Client;
    ventes: {
        data: Vente[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
    filters: { statut?: string };
}) {
    const [statutFilter, setStatutFilter] = useState(filters.statut || 'all');

    const handleToggleStatus = () => {
        router.patch(
            ClientController.toggleStatus.url(client.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const handleFilterChange = (value: string) => {
        const filterValue = value === 'all' ? '' : value;
        setStatutFilter(filterValue);
        router.get(
            ClientController.show.url(client.id),
            { statut: filterValue },
            { preserveState: true }
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Fonction pour formater les montants : pas de décimales, espaces pour les milliers
    const formatMontant = (montant: any): string => {
        // Vérifier et convertir en nombre si nécessaire
        let numericValue: number;

        if (typeof montant === 'string') {
            // Si c'est une chaîne, essayer de l'analyser
            const cleaned = montant.replace(/[^\d.,-]/g, '').replace(',', '.');
            numericValue = parseFloat(cleaned);
        } else if (typeof montant === 'number') {
            numericValue = montant;
        } else if (montant === null || montant === undefined) {
            return '0';
        } else {
            // Pour tout autre type, essayer de convertir
            numericValue = Number(montant);
        }

        // Vérifier si la conversion a réussi
        if (isNaN(numericValue)) {
            return '0';
        }

        // Arrondir et formater
        return Math.round(numericValue).toLocaleString('fr-FR');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={client.nom} />

            <div className="space-y-6 m-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {client.nom}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Détails du client et informations de contact.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={ClientController.edit.url(client.id)}>
                            <Button>
                                <PencilIcon className="size-4 mr-2" />
                                Modifier
                            </Button>
                        </Link>
                        <Link href={ClientController.index.url()}>
                            <Button variant="outline">
                                <ArrowLeftIcon className="size-4 mr-2" />
                                Retour à la liste
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Informations principales */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            Informations personnelles
                                            <Badge variant={client.actif ? "default" : "secondary"}>
                                                {client.actif ? 'Actif' : 'Inactif'}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>
                                            Informations de base du client
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant={client.actif ? "secondary" : "default"}
                                        size="sm"
                                        onClick={handleToggleStatus}
                                    >
                                        {client.actif ? (
                                            <>
                                                <UserXIcon className="size-4 mr-2" />
                                                Désactiver
                                            </>
                                        ) : (
                                            <>
                                                <UserCheckIcon className="size-4 mr-2" />
                                                Activer
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Nom complet</Label>
                                        <p className="text-lg font-medium">{client.nom}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                        <div className="flex items-center gap-2">
                                            <MailIcon className="size-4 text-muted-foreground" />
                                            {client.email ? (
                                                <a
                                                    href={`mailto:${client.email}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {client.email}
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground italic">Non renseigné</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Téléphone</Label>
                                        <div className="flex items-center gap-2">
                                            <PhoneIcon className="size-4 text-muted-foreground" />
                                            <a
                                                href={`tel:${client.telephone}`}
                                                className="hover:underline"
                                            >
                                                {client.telephone}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <Separator />
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Adresse</Label>
                                    <div className="flex items-start gap-2 mt-1">
                                        <MapPinIcon className="size-4 text-muted-foreground mt-0.5" />
                                        <span className="whitespace-pre-line">{client.adresse}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Statistiques des ventes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Statistiques des ventes
                                </CardTitle>
                                <CardDescription>
                                    Résumé des achats du client
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="text-center p-4 border rounded-lg">
                                        <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-primary" />
                                        <div className="text-2xl font-bold">{stats.total_ventes}</div>
                                        <div className="text-sm text-muted-foreground">Ventes totales</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                                        <div className="text-2xl font-bold">{formatMontant(stats.total_montant)}</div>
                                        <div className="text-sm text-muted-foreground">Montant total</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                        <div className="text-lg font-bold">
                                            {stats.derniere_vente ? formatDate(stats.derniere_vente) : 'Aucune'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Dernière vente</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Liste des ventes */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Receipt className="h-5 w-5" />
                                            Historique des ventes
                                        </CardTitle>
                                        <CardDescription>
                                            Toutes les ventes effectuées par ce client
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select value={statutFilter || 'all'} onValueChange={handleFilterChange}>
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue placeholder="Tous statuts" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tous statuts</SelectItem>
                                                <SelectItem value="complétée">Complétée</SelectItem>
                                                <SelectItem value="annulée">Annulée</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {ventes.data.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Aucune vente trouvée pour ce client</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {ventes.data.map((vente) => (
                                            <Card key={vente.id} className="border-l-4 border-l-primary/50">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex items-center space-x-2">
                                                                <Receipt className="h-5 w-5 text-muted-foreground" />
                                                                <div>
                                                                    <p className="font-semibold text-lg">{vente.numero}</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {formatDate(vente.created_at)} • {vente.user.name}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-4">
                                                            <div className="text-right">
                                                                <p className="font-bold text-lg">
                                                                    {formatMontant(vente.montant_total)} FCFA
                                                                </p>
                                                                <div className="flex items-center space-x-2">
                                                                    {vente.mode_paiement === 'espèces' && <DollarSign className="h-4 w-4" />}
                                                                    {vente.mode_paiement === 'carte' && <CreditCard className="h-4 w-4" />}
                                                                    <span className="text-sm text-muted-foreground capitalize">
                                                                        {vente.mode_paiement}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center space-x-2">
                                                                <Badge variant={vente.statut === 'complétée' ? 'default' : 'destructive'}>
                                                                    {vente.statut}
                                                                </Badge>
                                                                <Link href={VenteController.show.url(vente.id)}>
                                                                    <Button variant="outline" size="sm">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Détails des produits */}
                                                    <div className="mt-4 pt-4 border-t">
                                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                                                            <Package className="h-4 w-4" />
                                                            <span>{vente.lignes.length} produit{vente.lignes.length > 1 ? 's' : ''}</span>
                                                        </div>
                                                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                                            {vente.lignes.slice(0, 3).map((ligne) => (
                                                                <div key={ligne.id} className="flex justify-between text-sm bg-muted/50 p-2 rounded">
                                                                    <span className="truncate">{ligne.produit.nom}</span>
                                                                    <span className="font-medium">
                                                                        {ligne.quantite}x {formatMontant(ligne.prix_unitaire)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            {vente.lignes.length > 3 && (
                                                                <div className="text-sm text-muted-foreground text-center py-2">
                                                                    +{vente.lignes.length - 3} autres...
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                        {/* Pagination */}
                                        {ventes.last_page > 1 && (
                                            <div className="flex justify-center pt-4">
                                                <div className="flex flex-nowrap overflow-x-auto pb-2 gap-2 w-full justify-start md:justify-center px-2 scrollbar-hide">
                                                    {Array.from({ length: ventes.last_page }, (_, i) => i + 1).map((page) => (
                                                        <Link
                                                            key={page}
                                                            href={ClientController.show.url(client.id, { page, statut: statutFilter })}
                                                            preserveScroll
                                                            preserveState
                                                        >
                                                            <Button
                                                                variant={page === ventes.current_page ? "default" : "outline"}
                                                                size="sm"
                                                                className="w-9 h-9 p-0"
                                                            >
                                                                {page}
                                                            </Button>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Informations système */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations système</CardTitle>
                                <CardDescription>
                                    Métadonnées du client
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">ID Client</Label>
                                    <p className="font-mono text-sm">#{client.id.toString().padStart(4, '0')}</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Créé le</Label>
                                    <p className="text-sm">{formatDate(client.created_at)}</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Dernière modification</Label>
                                    <p className="text-sm">{formatDate(client.updated_at)}</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Statut</Label>
                                    <div className="mt-1">
                                        <Badge variant={client.actif ? "default" : "secondary"}>
                                            {client.actif ? 'Client actif' : 'Client inactif'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions rapides */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                                <CardDescription>
                                    Actions rapides pour ce client
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={ClientController.edit.url(client.id)} className="w-full">
                                    <Button className="w-full" variant="outline">
                                        <PencilIcon className="size-4 mr-2" />
                                        Modifier le client
                                    </Button>
                                </Link>

                                <Button
                                    className="w-full"
                                    variant={client.actif ? "secondary" : "default"}
                                    onClick={handleToggleStatus}
                                >
                                    {client.actif ? (
                                        <>
                                            <UserXIcon className="size-4 mr-2" />
                                            Désactiver le client
                                        </>
                                    ) : (
                                        <>
                                            <UserCheckIcon className="size-4 mr-2" />
                                            Activer le client
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// Helper component for labels (since it's used inline)
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`text-sm font-medium ${className || ''}`}>
            {children}
        </div>
    );
}
