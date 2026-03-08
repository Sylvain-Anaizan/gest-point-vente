import ClientController from '@/actions/App/Http/Controllers/ClientController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    Search,
    Phone,
    Mail,
    MapPin,
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
    Power,
    User,
    Users
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: '/dashboard' },
    { title: 'Clients', href: ClientController.index.url() },
];

// ... (Interfaces et Types restent identiques) ...
interface Client { id: number; nom: string; email: string; telephone: string | null; adresse: string | null; ville: string | null; code_postal: string | null; pays: string; date_naissance: string | null; notes: string | null; actif: boolean; created_at: string; updated_at: string; nom_complet: string; adresse_complete: string; }
type FilterStatus = 'all' | 'actifs' | 'inactifs';

export default function ClientsIndex({ clients, filters }: { clients: { data: Client[]; current_page: number; last_page: number; per_page: number; total: number; links: any[]; }; filters: { search?: string; actif?: string; sort?: string; direction?: string; }; }) {
    const { auth } = usePage().props as unknown as { auth: { user: { permissions: string[] } } };
    const canManage = auth.user.permissions.includes('manage sales');

    // ... (Logique d'état identique) ...
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>(filters.actif as FilterStatus || 'all');

    // ... (Fonctions de gestion identiques: handleDeleteClick, handleToggleStatus, etc.) ...
    const handleDeleteClick = (client: Client) => { setClientToDelete(client); setDeleteDialogOpen(true); };
    const handleDeleteConfirm = () => { if (clientToDelete) { router.delete(ClientController.destroy.url(clientToDelete.id), { preserveScroll: true, onSuccess: () => { setDeleteDialogOpen(false); setClientToDelete(null); }, }); } };
    const handleToggleStatus = (client: Client) => { router.patch(ClientController.toggleStatus.url(client.id), {}, { preserveScroll: true }); };
    const handleFilterChange = (newFilters: any) => { router.get(ClientController.index.url(), { ...filters, ...newFilters, page: 1 }, { preserveState: true, replace: true }); };
    const handleSearch = (search: string) => { setSearchTerm(search); handleFilterChange({ search }); };
    const handleStatusFilter = (status: FilterStatus) => { setFilterStatus(status); handleFilterChange({ actif: status === 'all' ? undefined : status }); };

    // Helper pour les initiales
    const getInitials = (nom: string, prenom?: string | null) => {
        const full = prenom ? `${prenom} ${nom}` : nom;
        return full.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Liste des Clients" />

            <div className="space-y-8 p-4 md:p-8">

                {/* EN-TÊTE AVEC KPI */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Portefeuille Clients</h1>
                        <p className="text-muted-foreground mt-1">
                            Gérez vos relations commerciales et coordonnées.
                        </p>
                    </div>

                    {/* Petites stats rapides en ligne */}
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border">
                            <Users className="h-4 w-4 text-primary" />
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-medium uppercase">Total</span>
                                <span className="text-lg font-bold leading-none">{clients.total}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900 rounded-lg">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-xs text-green-700 dark:text-green-400 font-medium uppercase">Actifs</span>
                                <span className="text-lg font-bold leading-none text-green-700 dark:text-green-400">
                                    {clients.data.filter(c => c.actif).length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* BARRE D'OUTILS */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
                    <div className="flex flex-1 w-full gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un client..."
                                className="pl-9 bg-muted/30 border-muted-foreground/20"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <Select
                            value={filterStatus}
                            onValueChange={(value: FilterStatus) => handleStatusFilter(value)}
                        >
                            <SelectTrigger className="w-[180px] bg-muted/30 border-muted-foreground/20">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tout voir</SelectItem>
                                <SelectItem value="actifs">Actifs seulement</SelectItem>
                                <SelectItem value="inactifs">Inactifs seulement</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {canManage && (
                        <Link href={ClientController.create.url()}>
                            <Button className="shadow-lg shadow-primary/20">
                                <Plus className="h-4 w-4 mr-2" /> Nouveau Client
                            </Button>
                        </Link>
                    )}
                </div>

                {/* GRILLE DES CLIENTS */}
                {clients.data.length === 0 ? (
                    <div className="text-center py-20 rounded-xl border-2 border-dashed bg-muted/10">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">Aucun client trouvé</h3>
                        <p className="text-muted-foreground">Essaie de modifier tes filtres ou ajoute un nouveau client.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {clients.data.map((client) => (
                            <Card
                                key={client.id}
                                className={`group hover:shadow-xl transition-all duration-300 border-l-4 ${client.actif ? 'border-l-green-500' : 'border-l-gray-300 dark:border-l-gray-700'
                                    }`}
                            >
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div className="flex gap-4">
                                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.nom}`} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {getInitials(client.nom)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-base font-bold line-clamp-1" title={client.nom_complet}>
                                                {client.nom}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                Ajouté le {new Date(client.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* MENU ACTIONS (3 points) */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={ClientController.show.url(client.id)} className="cursor-pointer">
                                                    <Eye className="mr-2 h-4 w-4" /> Voir détails
                                                </Link>
                                            </DropdownMenuItem>
                                            {canManage && (
                                                <>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={ClientController.edit.url(client.id)} className="cursor-pointer">
                                                            <Pencil className="mr-2 h-4 w-4" /> Modifier
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(client)} className="cursor-pointer">
                                                        <Power className="mr-2 h-4 w-4" />
                                                        {client.actif ? 'Désactiver' : 'Activer'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteClick(client)} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>

                                <CardContent className="space-y-3 pb-2 text-sm">
                                    <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                                        <div className="p-2 bg-muted rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                                        <div className="p-2 bg-muted rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <span className="truncate">{client.telephone || 'Non renseigné'}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                                        <div className="p-2 bg-muted rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <MapPin className="h-4 w-4 mt-0.5" />
                                        </div>
                                        <span className="line-clamp-2 leading-relaxed">
                                            {client.adresse_complete || 'Adresse non renseignée'}
                                        </span>
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-4 pb-4">
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        {client.telephone ? (
                                            <Button variant="outline" size="sm" className="w-full" asChild>
                                                <a href={`tel:${client.telephone}`}>
                                                    <Phone className="mr-2 h-3 w-3" /> Appeler
                                                </a>
                                            </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" className="w-full" disabled>
                                                <Phone className="mr-2 h-3 w-3" /> Appeler
                                            </Button>
                                        )}

                                        <Button variant="secondary" size="sm" className="w-full" asChild>
                                            <a href={`mailto:${client.email}`}>
                                                <Mail className="mr-2 h-3 w-3" /> Email
                                            </a>
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {/* DIALOGUE DE SUPPRESSION (Reste inchangé mais stylisé) */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer le client</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer <strong>{clientToDelete?.nom_complet}</strong> ?
                                <br />Cette action supprimera également l'historique associé.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>Confirmer la suppression</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}