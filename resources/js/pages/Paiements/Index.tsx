import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    Search,
    Banknote,
    CreditCard,
    Wallet,
    Smartphone,
    FileCheck,
    MoreHorizontal,
    Trash2,
    Eye,
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
    { title: 'Gestion des paiements', href: '/paiements' },
];

interface Paiement {
    id: number;
    montant: number | string;
    mode_paiement: string;
    reference: string | null;
    date_paiement: string;
    commentaire: string | null;
    vente?: { id: number; numero: string; } | null;
    commande?: { id: number; numero: string; } | null;
    user?: { id: number; name: string; } | null;
    boutique?: { id: number; nom: string; } | null;
}

const modeIcons: Record<string, typeof Banknote> = {
    'espèces': Banknote,
    'carte': CreditCard,
    'virement': FileCheck,
    'mobile_money': Smartphone,
    'chèque': Wallet,
};

const modeLabels: Record<string, string> = {
    'espèces': 'Espèces',
    'carte': 'Carte',
    'virement': 'Virement',
    'mobile_money': 'Mobile Money',
    'chèque': 'Chèque',
};

export default function PaiementsIndex({ paiements, filters }: {
    paiements: { data: Paiement[]; current_page: number; last_page: number; per_page: number; total: number; links: any[]; };
    filters: { search?: string; mode?: string; };
}) {
    const { auth } = usePage().props as unknown as { auth: { user: { role: string; permissions: string[] } } };
    const canManage = auth.user.permissions.includes('manage sales');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [modeFilter, setModeFilter] = useState(filters.mode || 'all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [paiementToDelete, setPaiementToDelete] = useState<Paiement | null>(null);

    const handleSearch = (search: string) => {
        setSearchTerm(search);
        router.get('/paiements', { ...filters, search, page: 1 }, { preserveState: true, replace: true });
    };

    const handleModeFilter = (mode: string) => {
        setModeFilter(mode);
        router.get('/paiements', { ...filters, mode: mode === 'all' ? undefined : mode, page: 1 }, { preserveState: true, replace: true });
    };

    const handleDeleteClick = (paiement: Paiement) => {
        setPaiementToDelete(paiement);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (paiementToDelete) {
            router.delete(`/paiements/${paiementToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setPaiementToDelete(null);
                },
            });
        }
    };

    const getModeBadge = (mode: string) => {
        const Icon = modeIcons[mode] || Banknote;
        const label = modeLabels[mode] || mode;
        const colors: Record<string, string> = {
            'espèces': 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20',
            'carte': 'border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/20',
            'virement': 'border-purple-200 text-purple-700 bg-purple-50 dark:bg-purple-950/20',
            'mobile_money': 'border-orange-200 text-orange-700 bg-orange-50 dark:bg-orange-950/20',
            'chèque': 'border-gray-200 text-gray-700 bg-gray-50 dark:bg-gray-950/20',
        };
        return (
            <Badge variant="outline" className={colors[mode] || ''}>
                <Icon className="mr-1 h-3 w-3" /> {label}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Paiements" />

            <div className="space-y-6 p-4 md:p-6 pb-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Paiements</h1>
                        <p className="text-muted-foreground mt-1">Suivez et gérez tous les paiements enregistrés.</p>
                    </div>
                    {canManage && (
                        <Link href="/paiements/create">
                            <Button className="shadow-lg shadow-primary/20">
                                <Plus className="h-4 w-4 mr-2" /> Nouveau Paiement
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
                    <div className="flex flex-1 w-full gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par référence, vente, commande..."
                                className="pl-9 bg-muted/30"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <Select value={modeFilter} onValueChange={handleModeFilter}>
                            <SelectTrigger className="w-[180px] bg-muted/30">
                                <SelectValue placeholder="Mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les modes</SelectItem>
                                <SelectItem value="espèces">Espèces</SelectItem>
                                <SelectItem value="carte">Carte</SelectItem>
                                <SelectItem value="virement">Virement</SelectItem>
                                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                <SelectItem value="chèque">Chèque</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {paiements.data.length === 0 ? (
                    <div className="text-center py-20 rounded-xl border-2 border-dashed bg-muted/10">
                        <Banknote className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">Aucun paiement trouvé</h3>
                        <p className="text-muted-foreground">Enregistrez un paiement pour commencer le suivi.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {paiements.data.map((paiement) => {
                            const Icon = modeIcons[paiement.mode_paiement] || Banknote;
                            return (
                                <Card key={paiement.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-t-4 border-t-primary/20">
                                    <CardHeader className="pb-3 border-b bg-muted/5 group-hover:bg-muted/10 transition-colors">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                        {paiement.reference || `PAY-${paiement.id}`}
                                                    </span>
                                                    {paiement.boutique && (
                                                        <Badge variant="secondary" className="text-[8px] h-3.5 py-0 px-1.5 bg-indigo-50 text-indigo-600 border-indigo-100 uppercase font-black w-fit">
                                                            {paiement.boutique.nom}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="shrink-0">
                                                    {getModeBadge(paiement.mode_paiement)}
                                                </div>
                                            </div>
                                            <CardTitle className="text-base font-bold leading-tight">
                                                {paiement.vente ? `Vente #${paiement.vente.numero}` :
                                                 paiement.commande ? `Commande #${paiement.commande.numero}` :
                                                 'Paiement'}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase text-muted-foreground font-semibold">Date</p>
                                                <p className="font-medium">{new Date(paiement.date_paiement).toLocaleDateString('fr-FR')}</p>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <div className="flex justify-between items-end border-t pt-3">
                                                <div>
                                                    <p className="text-[10px] uppercase text-muted-foreground font-semibold">Montant</p>
                                                    <p className="text-lg font-black text-primary">{Number(paiement.montant).toLocaleString('fr-FR')} <span className="text-[10px]">FCFA</span></p>
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
                                                            <Link href={`/paiements/${paiement.id}`} className="cursor-pointer">
                                                                <Eye className="mr-2 h-4 w-4" /> Détails
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {canManage && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => handleDeleteClick(paiement)} className="text-red-600 focus:text-red-600 cursor-pointer">
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer le paiement</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer le paiement <strong>{paiementToDelete?.reference || `PAY-${paiementToDelete?.id}`}</strong> ?
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
