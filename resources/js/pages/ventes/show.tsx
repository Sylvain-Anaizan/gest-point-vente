import VenteController from '@/actions/App/Http/Controllers/VenteController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    FileText,
    User,
    CreditCard,
    Calendar,
    Package,
    DollarSign,
    Receipt,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Truck,
    Smartphone,
    Banknote,
    Printer,
    StoreIcon,
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: '/dashboard' },
    { title: 'Ventes', href: VenteController.index.url() },
    { title: 'Détails', href: '#' },
];

// ... (Interfaces restent identiques)
interface Client { id: number; nom: string; prenom: string; telephone: string; }
interface User { id: number; name: string; email: string; }
interface Boutique { id: number; nom: string; }
interface Produit { id: number; nom: string; }
interface LigneCommande { id: number; nom: string; quantite: number; prix: number; }
interface Commande { id: number; numero: string; lignes_commande?: LigneCommande[]; }
interface LigneVente { id: number; produit_id: number; quantite: number; prix_unitaire: number; sous_total: number; produit: Produit; designation_originale?: string; }
interface Vente { id: number; numero: string; client_id: number | null; commande_id: number | null; user_id: number; boutique_id: number | null; montant_total: number | string; statut: 'complétée' | 'annulée'; mode_paiement: 'espèces' | 'carte' | 'virement' | 'mobile_money'; created_at: string; updated_at: string; client?: Client; user: User; boutique?: Boutique; lignes: LigneVente[]; commande?: Commande; }

export default function VentesShow({ vente }: { vente: Vente }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDeleteClick = () => setDeleteDialogOpen(true);
    const handleDeleteConfirm = () => router.delete(VenteController.destroy.url(vente.id));

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case 'complétée':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1"><CheckCircle2 className="h-3 w-3" /> Complétée</Badge>;
            case 'annulée':
                return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Annulée</Badge>;
            default:
                return <Badge variant="secondary">{statut}</Badge>;
        }
    };

    const getModePaiementIcon = (mode: string) => {
        switch (mode) {
            case 'espèces': return <Banknote className="h-4 w-4" />;
            case 'carte': return <CreditCard className="h-4 w-4" />;
            case 'virement': return <Receipt className="h-4 w-4" />;
            case 'mobile_money': return <Smartphone className="h-4 w-4" />;
            default: return <DollarSign className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    };

    // Fonction pour formater les montants : pas de décimales, espaces pour les milliers
    const formatMontant = (montant: number | string | null | undefined): string => {
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
            <Head title={`Vente ${vente.numero}`} />

            <div className="space-y-6 p-4">
                {/* HEADER RESPONSIVE */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                        <Link href={VenteController.index.url()}>
                            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                                <ArrowLeftIcon className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl sm:text-3xl font-bold tracking-tight">{vente.numero}</h1>
                                {getStatutBadge(vente.statut)}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(vente.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* ACTIONS: Desktop (Boutons) vs Mobile (Menu Dropdown) */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">

                        {/* Desktop View */}
                        <div className="hidden sm:flex items-center gap-2">
                            <Link href={VenteController.receipt.url(vente.id)} target="_blank">
                                <Button variant="default" size="sm">
                                    <Printer className="mr-2 h-4 w-4" /> Imprimer le reçu
                                </Button>
                            </Link>
                            <Link href={VenteController.edit.url(vente.id)}>
                                <Button variant="outline" size="sm">
                                    <PencilIcon className="mr-2 h-4 w-4" /> Modifier
                                </Button>
                            </Link>
                            <Button variant="destructive" size="sm" onClick={handleDeleteClick}>
                                <TrashIcon className="mr-2 h-4 w-4" /> Supprimer
                            </Button>
                        </div>

                        {/* Mobile View */}
                        <div className="sm:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={VenteController.receipt.url(vente.id)} target="_blank" className="flex items-center w-full">
                                            <Printer className="mr-2 h-4 w-4" /> Imprimer le reçu
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={VenteController.edit.url(vente.id)} className="flex items-center w-full">
                                            <PencilIcon className="mr-2 h-4 w-4" /> Modifier
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:text-destructive">
                                        <TrashIcon className="mr-2 h-4 w-4" /> Supprimer
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">

                    {/* COLONNE GAUCHE (Order 2 on Mobile usually, but here Order 1 is fine as Meta Data) */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* PAIEMENT - Mis en premier car c'est important */}
                        <Card className="border-l-4 border-l-primary shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    Total & Paiement
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-2">
                                <div>
                                    <p className="text-3xl font-bold text-primary">
                                        {formatMontant(vente.montant_total)} <span className="text-sm font-normal text-muted-foreground">FCFA</span>
                                    </p>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Mode</span>
                                    <div className="flex items-center gap-2 font-medium capitalize">
                                        {getModePaiementIcon(vente.mode_paiement)}
                                        {vente.mode_paiement.replace('_', ' ')}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Vendeur</span>
                                    <div className="flex items-center gap-2 font-medium">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        {vente.user.name}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Boutique</span>
                                    <div className="flex items-center gap-2 font-medium">
                                        <StoreIcon className="h-4 w-4 text-muted-foreground" />
                                        {vente.boutique ? vente.boutique.nom : <span className="text-muted-foreground italic text-sm">Stock général</span>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* CLIENT */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    Client
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {vente.client ? (
                                    <div className="space-y-1">
                                        <p className="font-semibold text-lg">{vente.client.nom} {vente.client.prenom}</p>
                                        <a href={`tel:${vente.client.telephone}`} className="text-sm text-blue-600 hover:underline flex items-center gap-2">
                                            <Smartphone className="h-3 w-3" /> {vente.client.telephone}
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">Client de passage (Anonyme)</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* ORIGINE COMMANDE */}
                        {vente.commande && (
                            <Card className="border-l-4 border-l-amber-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Truck className="h-4 w-4 text-amber-500" />
                                        Origine de la vente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Commande</span>
                                        <Link
                                            href={`/commandes/${vente.commande.id}`}
                                            className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                                        >
                                            #{vente.commande.numero}
                                        </Link>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Articles commandés à l'origine</p>
                                        <div className="space-y-1.5 text-xs">
                                            {vente.commande.lignes_commande?.map((l, i) => (
                                                <div key={i} className="flex justify-between items-start gap-2">
                                                    <span className="text-muted-foreground line-clamp-1">{l.nom}</span>
                                                    <span className="font-medium shrink-0">x{l.quantite}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* INFOS TECHNIQUES */}
                        <Card className="bg-muted/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    Métadonnées
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">ID Interne</span>
                                    <span className="font-mono">#{vente.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Créé le</span>
                                    <span>{new Date(vente.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Mis à jour</span>
                                    <span>{new Date(vente.updated_at).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* COLONNE DROITE - PRODUITS (Prend 2 colonnes sur Desktop) */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-muted/20 border-b pb-4">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        <span>Détail de la commande</span>
                                    </div>
                                    <Badge variant="secondary">{vente.lignes.length} articles</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {vente.lignes.map((ligne) => (
                                        <div key={ligne.id} className="p-4 hover:bg-muted/10 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-base mb-1">
                                                        {ligne.designation_originale || ligne.produit.nom}
                                                        {ligne.designation_originale &&
                                                            ligne.designation_originale !== ligne.produit.nom &&
                                                            ligne.produit.nom !== 'Produit Commandé' && (
                                                                <span className="ml-2 text-xs font-normal text-muted-foreground italic">
                                                                    ({ligne.produit.nom})
                                                                </span>
                                                            )}
                                                    </h4>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                        <Badge variant="outline" className="font-normal">
                                                            x{ligne.quantite}
                                                        </Badge>
                                                        <span>à {ligne.prix_unitaire.toLocaleString('fr-FR')} F/u</span>
                                                    </div>
                                                </div>

                                                {/* Sous-Total */}
                                                <div className="text-right">
                                                    <span className="block font-bold text-lg">
                                                        {ligne.sous_total.toLocaleString('fr-FR')} <span className="text-xs font-normal text-muted-foreground">F</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* FOOTER TOTAL */}
                                <div className="bg-muted/20 p-6 border-t">
                                    <div className="flex flex-col gap-2 sm:w-1/2 sm:ml-auto">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Sous-total</span>
                                            <span>{formatMontant(vente.montant_total)} F</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">TVA (0%)</span>
                                            <span>0 F</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-lg">Net à payer</span>
                                            <span className="font-bold text-2xl text-primary">{formatMontant(vente.montant_total)} F</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* DIALOG DE CONFIRMATION */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="sm:max-w-md w-[95vw]">
                        <DialogHeader>
                            <DialogTitle>Supprimer la vente</DialogTitle>
                            <DialogDescription>
                                Action irréversible pour la vente <strong>{vente.numero}</strong>.
                                {vente.statut === 'complétée' && (
                                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md text-orange-800 text-sm font-medium">
                                        ⚠️ Attention : Le stock des produits sera automatiquement restauré.
                                    </div>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                Annuler
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>
                                Confirmer la suppression
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}