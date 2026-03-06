import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Plus,
    Search,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
    MapPin,
    Calendar,

} from 'lucide-react';

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: '/dashboard' },
    { title: 'Gestion des commandes', href: '/commandes' },
];

interface Client { id: number; nom: string; telephone: string; }
interface Commande {
    id: number;
    numero: string;
    client_id: number | null;
    nom_client: string | null;
    telephone_client: string | null;
    adresse_origine: string;
    adresse_destination: string;
    statut: 'en_attente' | 'en_cours' | 'livrée' | 'annulée';
    montant_total: number | string;
    date_commande: string;
    observations: string | null;
    created_at: string;
    client?: Client;
    boutique?: { id: number; nom: string; };
    boutique_id: number;
}

export default function CommandesIndex({ auth, commandes, filters }: {
    auth: { user: { id: number; name: string; role: string; boutique_id: number | null; } };
    commandes: { data: Commande[]; current_page: number; last_page: number; per_page: number; total: number; links: any[]; };
    filters: { search?: string; statut?: string; };
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statutFilter, setStatutFilter] = useState(filters.statut || 'all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [commandeToDelete, setCommandeToDelete] = useState<Commande | null>(null);

    const handleSearch = (search: string) => {
        setSearchTerm(search);
        router.get('/commandes', { ...filters, search, page: 1 }, { preserveState: true, replace: true });
    };

    const handleStatutFilter = (statut: string) => {
        setStatutFilter(statut);
        router.get('/commandes', { ...filters, statut: statut === 'all' ? undefined : statut, page: 1 }, { preserveState: true, replace: true });
    };

    const handleDeleteClick = (commande: Commande) => {
        setCommandeToDelete(commande);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (commandeToDelete) {
            router.delete(`/commandes/${commandeToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setCommandeToDelete(null);
                },
            });
        }
    };

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case 'en_attente':
                return <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/20"><Clock className="mr-1 h-3 w-3" /> En attente</Badge>;
            case 'en_cours':
                return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/20"><Truck className="mr-1 h-3 w-3" /> En cours</Badge>;
            case 'livrée':
                return <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20"><CheckCircle2 className="mr-1 h-3 w-3" /> Livrée</Badge>;
            case 'annulée':
                return <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-950/20"><XCircle className="mr-1 h-3 w-3" /> Annulée</Badge>;
            default:
                return <Badge variant="secondary">{statut}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Commandes" />

            <div className="space-y-6 p-4 md:p-6 pb-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
                        <p className="text-muted-foreground mt-1">Gérez le suivi et l'acheminement de vos commandes clients.</p>
                    </div>
                    <Link href="/commandes/create">
                        <Button className="shadow-lg shadow-primary/20">
                            <Plus className="h-4 w-4 mr-2" /> Nouvelle Commande
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
                    <div className="flex flex-1 w-full gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par N°, client, destination..."
                                className="pl-9 bg-muted/30"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <Select value={statutFilter} onValueChange={handleStatutFilter}>
                            <SelectTrigger className="w-[180px] bg-muted/30">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="en_attente">En attente</SelectItem>
                                <SelectItem value="en_cours">En cours</SelectItem>
                                <SelectItem value="livrée">Livrée</SelectItem>
                                <SelectItem value="annulée">Annulée</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {commandes.data.length === 0 ? (
                    <div className="text-center py-20 rounded-xl border-2 border-dashed bg-muted/10">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">Aucune commande trouvée</h3>
                        <p className="text-muted-foreground">Commencez par créer votre première commande pour suivre vos livraisons.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {commandes.data.map((commande) => (
                            <Card key={commande.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-t-4 border-t-primary/20">
                                <CardHeader className="pb-3 border-b bg-muted/5 group-hover:bg-muted/10 transition-colors">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">N° {commande.numero}</span>
                                                {auth.user.role === 'admin' && commande.boutique && (
                                                    <div className="flex">
                                                        <Badge variant="secondary" className="text-[8px] h-3.5 py-0 px-1.5 bg-indigo-50 text-indigo-600 border-indigo-100 uppercase font-black">
                                                            {commande.boutique.nom}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="shrink-0">
                                                {getStatutBadge(commande.statut)}
                                            </div>
                                        </div>
                                        <CardTitle className="text-base font-bold leading-tight">
                                            {commande.client?.nom || commande.nom_client || 'Client Inconnu'}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] uppercase text-muted-foreground font-semibold">Destination</p>
                                            <p className="truncate font-medium">{commande.adresse_destination}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase text-muted-foreground font-semibold">Date</p>
                                            <p className="font-medium">{new Date(commande.date_commande).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex justify-between items-end border-t pt-3">
                                            <div>
                                                <p className="text-[10px] uppercase text-muted-foreground font-semibold">Montant</p>
                                                <p className="text-lg font-black text-primary">{Number(commande.montant_total).toLocaleString('fr-FR')} <span className="text-[10px]">FCFA</span></p>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/commandes/${commande.id}`} className="cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" /> Détails
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/commandes/${commande.id}/edit`} className="cursor-pointer">
                                                            <Pencil className="mr-2 h-4 w-4" /> Modifier
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDeleteClick(commande)} className="text-red-600 focus:text-red-600 cursor-pointer">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer la commande</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer la commande <strong>{commandeToDelete?.numero}</strong> ?
                                Cette action est irréversible.
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
