import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Pencil,
    Trash2,
    MapPin,
    Clock,
    User,
    Phone,
    FileText,
    Banknote,
    Truck,
    Package,
    CheckCircle2,
    XCircle,
    Building2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Client { id: number; nom: string; telephone: string | null; email: string | null; }
interface LigneCommande {
    id: number;
    nom: string;
    quantite: number;
    prix: number | string;
    total: number | string;
}
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
    lignes_commande?: LigneCommande[];
}

export default function CommandesShow({ commande }: { commande: Commande }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tableau de bord', href: '/dashboard' },
        { title: 'Commandes', href: '/commandes' },
        { title: `Détails #${commande.numero}`, href: `/commandes/${commande.id}` },
    ];

    const handleDelete = () => {
        router.delete(`/commandes/${commande.id}`, {
            onSuccess: () => setDeleteDialogOpen(false)
        });
    };

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case 'en_attente':
                return <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/20 px-3 py-1 text-sm"><Clock className="mr-2 h-4 w-4" /> En attente</Badge>;
            case 'en_cours':
                return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/20 px-3 py-1 text-sm"><Truck className="mr-2 h-4 w-4" /> En cours</Badge>;
            case 'livrée':
                return <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 text-sm"><CheckCircle2 className="mr-2 h-4 w-4" /> Livrée</Badge>;
            case 'annulée':
                return <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-950/20 px-3 py-1 text-sm"><XCircle className="mr-2 h-4 w-4" /> Annulée</Badge>;
            default:
                return <Badge variant="secondary" className="px-3 py-1 text-sm">{statut}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Commande ${commande.numero}`} />

            <div className="max-w-6xl space-y-8 py-4 px-4 md:px-0 pb-24">
                {/* EN-TÊTE ACTION */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/commandes">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Commande #{commande.numero}</h1>
                            <div className="mt-1 flex items-center gap-3">
                                {getStatutBadge(commande.statut)}
                                <span className="text-sm text-muted-foreground">Créée le {new Date(commande.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/commandes/${commande.id}/edit`}>
                            <Button variant="outline">
                                <Pencil className="mr-2 h-4 w-4" /> Modifier
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                        </Button>
                    </div>
                </div>

                <Separator />

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* INFOS PRINCIPALES */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>Articles de la Commande</CardTitle>
                                </div>
                                <Badge variant="outline" className="font-mono">
                                    {commande.lignes_commande?.length || 0} article(s)
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-4 rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50 text-left">
                                                <th className="p-3 font-medium">Description</th>
                                                <th className="p-3 font-medium text-center">Quantité</th>
                                                <th className="p-3 font-medium text-right">Prix Unitaire</th>
                                                <th className="p-3 font-medium text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {commande.lignes_commande && commande.lignes_commande.length > 0 ? (
                                                commande.lignes_commande.map((line) => (
                                                    <tr key={line.id} className="border-b">
                                                        <td className="p-3 font-medium">{line.nom}</td>
                                                        <td className="p-3 text-center">{line.quantite}</td>
                                                        <td className="p-3 text-right">{Number(line.prix).toLocaleString('fr-FR')} FCFA</td>
                                                        <td className="p-3 text-right font-bold text-primary">{Number(line.total).toLocaleString('fr-FR')} FCFA</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                                                        Aucun article enregistré pour cette commande.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {commande.lignes_commande && commande.lignes_commande.length > 0 && (
                                            <tfoot>
                                                <tr className="bg-muted/30">
                                                    <td colSpan={3} className="p-3 text-right font-bold uppercase tracking-wider text-xs">Total Général</td>
                                                    <td className="p-3 text-right font-black text-lg text-primary">{Number(commande.montant_total).toLocaleString('fr-FR')} FCFA</td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-t-4 border-t-primary">
                            <CardHeader className="bg-muted/30">
                                <div className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-primary" />
                                    <CardTitle>Suivi du Parcours</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-8 pb-8 relative">
                                <div className="absolute left-12 top-12 bottom-12 w-0.5 bg-dashed border-l border-muted-foreground/30 hidden md:block"></div>

                                <div className="flex flex-col gap-12">
                                    <div className="flex gap-6 relative z-10">
                                        <div className="h-12 w-12 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                                            <Package className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Point d'Origine (Départ)</p>
                                            <p className="text-xl font-semibold mt-1">{commande.adresse_origine}</p>
                                            <p className="text-sm text-muted-foreground mt-1 italic">Le colis est collecté à cette adresse.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6 relative z-10">
                                        <div className="h-12 w-12 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                                            <MapPin className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Point de Destination (Arrivée)</p>
                                            <p className="text-xl font-semibold mt-1">{commande.adresse_destination}</p>
                                            <p className="text-sm text-muted-foreground mt-1 italic">Le client recevra son colis à cette adresse.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>Observations & Notes</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 bg-muted/20 rounded-lg min-h-[100px]">
                                    {commande.observations ? (
                                        <p className="whitespace-pre-wrap">{commande.observations}</p>
                                    ) : (
                                        <p className="text-muted-foreground italic text-sm">Aucune note particulière pour cette commande.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* INFOS CLIENT & FINANCES */}
                    <div className="space-y-6">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg">Détails du Client</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{commande.client?.nom || commande.nom_client || 'Client Non Enregistré'}</p>
                                        {commande.client && (
                                            <Badge variant="secondary" className="mt-1">Client Fidèle</Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{commande.telephone_client || 'Non renseigné'}</span>
                                    </div>
                                    {commande.client?.email && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <span>{commande.client.email}</span>
                                        </div>
                                    )}
                                </div>

                                {commande.client && (
                                    <Link href={`/clients/${commande.client.id}`} className="block">
                                        <Button variant="outline" size="sm" className="w-full">Voir fiche client complète</Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 border-0 overflow-hidden relative">
                            <div className="absolute right-0 top-0 p-8 text-white/5 dark:text-zinc-900/5 -mr-4 -mt-4">
                                <Banknote className="h-24 w-24 rotate-12" />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-lg opacity-80">Règlement Commerçant</CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-widest opacity-60">Montant Total à Percevoir</p>
                                    <p className="text-3xl font-black">{Number(commande.montant_total).toLocaleString('fr-FR')} <span className="text-sm font-normal opacity-70">FCFA</span></p>
                                </div>

                                <div className="mt-6 p-3 bg-white/10 dark:bg-zinc-900/10 rounded-lg flex items-center gap-3">
                                    <div className={`h-2 w-2 rounded-full ${commande.statut === 'livrée' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></div>
                                    <p className="text-xs">{commande.statut === 'livrée' ? 'Transaction finalisée.' : 'Règlement en attente de livraison.'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer cette commande ?</DialogTitle>
                            <DialogDescription>
                                Vous êtes sur le point de supprimer définitivement la commande <strong>{commande.numero}</strong>.
                                Cette action entraînera la perte de l'historique de suivi.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
                            <Button variant="destructive" onClick={handleDelete}>Confirmer la suppression</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
