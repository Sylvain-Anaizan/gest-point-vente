import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Trash2,
    Banknote,
    CreditCard,
    Wallet,
    Smartphone,
    FileCheck,
    Calendar,
    User,
    Building2,
    FileText,
    Hash,
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

interface Client { id: number; nom: string; telephone: string | null; }
interface Paiement {
    id: number;
    montant: number | string;
    mode_paiement: string;
    reference: string | null;
    date_paiement: string;
    commentaire: string | null;
    vente?: { id: number; numero: string; montant_total: number | string; client?: Client | null; } | null;
    commande?: { id: number; numero: string; montant_total: number | string; client?: Client | null; } | null;
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
    'carte': 'Carte bancaire',
    'virement': 'Virement bancaire',
    'mobile_money': 'Mobile Money',
    'chèque': 'Chèque',
};

export default function PaiementsShow({ paiement }: { paiement: Paiement }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tableau de bord', href: '/dashboard' },
        { title: 'Paiements', href: '/paiements' },
        { title: `Détails #${paiement.reference || paiement.id}`, href: `/paiements/${paiement.id}` },
    ];

    const handleDelete = () => {
        router.delete(`/paiements/${paiement.id}`, {
            onSuccess: () => setDeleteDialogOpen(false)
        });
    };

    const ModeIcon = modeIcons[paiement.mode_paiement] || Banknote;
    const modeLabel = modeLabels[paiement.mode_paiement] || paiement.mode_paiement;

    const linkedDoc = paiement.vente
        ? { type: 'Vente', numero: paiement.vente.numero, id: paiement.vente.id, href: `/ventes/${paiement.vente.id}`, montant: paiement.vente.montant_total, client: paiement.vente.client }
        : paiement.commande
            ? { type: 'Commande', numero: paiement.commande.numero, id: paiement.commande.id, href: `/commandes/${paiement.commande.id}`, montant: paiement.commande.montant_total, client: paiement.commande.client }
            : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Paiement #${paiement.reference || paiement.id}`} />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/paiements">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Paiement {paiement.reference || `#${paiement.id}`}
                            </h1>
                            <p className="text-muted-foreground mt-1">Détails du paiement enregistré.</p>
                        </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Montant & Mode */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ModeIcon className="h-5 w-5 text-primary" /> Paiement
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center py-4 bg-primary/5 rounded-xl">
                                <p className="text-sm text-muted-foreground mb-1">Montant payé</p>
                                <p className="text-4xl font-black text-primary">{Number(paiement.montant).toLocaleString('fr-FR')}</p>
                                <p className="text-sm text-muted-foreground">FCFA</p>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <ModeIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground font-semibold">Mode</p>
                                        <p className="font-medium">{modeLabel}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Hash className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground font-semibold">Référence</p>
                                        <p className="font-medium">{paiement.reference || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground font-semibold">Date</p>
                                        <p className="font-medium">{new Date(paiement.date_paiement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground font-semibold">Enregistré par</p>
                                        <p className="font-medium">{paiement.user?.name || '—'}</p>
                                    </div>
                                </div>
                            </div>
                            {paiement.boutique && (
                                <>
                                    <Separator />
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs uppercase text-muted-foreground font-semibold">Boutique</p>
                                            <p className="font-medium">{paiement.boutique.nom}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                            {paiement.commentaire && (
                                <>
                                    <Separator />
                                    <div className="flex items-start gap-3">
                                        <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs uppercase text-muted-foreground font-semibold">Commentaire</p>
                                            <p className="text-sm">{paiement.commentaire}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Document lié */}
                    {linkedDoc && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" /> {linkedDoc.type} associée
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground font-semibold">{linkedDoc.type}</p>
                                        <p className="text-lg font-bold">#{linkedDoc.numero}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs uppercase text-muted-foreground font-semibold">Montant total</p>
                                        <p className="text-lg font-black text-primary">{Number(linkedDoc.montant).toLocaleString('fr-FR')} FCFA</p>
                                    </div>
                                </div>
                                {linkedDoc.client && (
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs uppercase text-muted-foreground font-semibold">Client</p>
                                            <p className="font-medium">{linkedDoc.client.nom}</p>
                                        </div>
                                    </div>
                                )}
                                <Link href={linkedDoc.href}>
                                    <Button variant="outline" className="w-full mt-2">
                                        Voir la {linkedDoc.type.toLowerCase()}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer le paiement</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer ce paiement de <strong>{Number(paiement.montant).toLocaleString('fr-FR')} FCFA</strong> ?
                                Cette action est irréversible.
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
