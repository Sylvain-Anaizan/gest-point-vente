import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: '/dashboard' },
    { title: 'Paiements', href: '/paiements' },
    { title: 'Nouveau paiement', href: '/paiements/create' },
];

interface SimpleRef { id: number; numero: string; montant_total: number | string; client_id: number | null; }

export default function PaiementsCreate({ ventes, commandes, boutiques, preselectedVenteId, preselectedCommandeId }: {
    ventes: SimpleRef[];
    commandes: SimpleRef[];
    boutiques: { id: number; nom: string; }[];
    preselectedVenteId?: string | null;
    preselectedCommandeId?: string | null;
}) {
    const today = new Date().toISOString().slice(0, 16);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouveau Paiement" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href="/paiements">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Nouveau Paiement</h1>
                        <p className="text-muted-foreground mt-1">Enregistrez un paiement pour une vente ou commande.</p>
                    </div>
                </div>

                <Form action="/paiements" method="post">
                    {({ errors, processing }) => (
                        <div className="grid gap-6 max-w-2xl">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Document associé</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="vente_id">Vente</Label>
                                        <select
                                            id="vente_id"
                                            name="vente_id"
                                            defaultValue={preselectedVenteId || ''}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="">-- Aucune vente --</option>
                                            {ventes.map((v) => (
                                                <option key={v.id} value={v.id}>
                                                    #{v.numero} — {Number(v.montant_total).toLocaleString('fr-FR')} FCFA
                                                </option>
                                            ))}
                                        </select>
                                        {errors.vente_id && <p className="text-sm text-red-600">{errors.vente_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="commande_id">Commande</Label>
                                        <select
                                            id="commande_id"
                                            name="commande_id"
                                            defaultValue={preselectedCommandeId || ''}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="">-- Aucune commande --</option>
                                            {commandes.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    #{c.numero} — {Number(c.montant_total).toLocaleString('fr-FR')} FCFA
                                                </option>
                                            ))}
                                        </select>
                                        {errors.commande_id && <p className="text-sm text-red-600">{errors.commande_id}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Détails du paiement</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="montant">Montant (FCFA) *</Label>
                                            <Input id="montant" name="montant" type="number" step="0.01" min="0.01" required />
                                            {errors.montant && <p className="text-sm text-red-600">{errors.montant}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mode_paiement">Mode de paiement *</Label>
                                            <select
                                                id="mode_paiement"
                                                name="mode_paiement"
                                                required
                                                defaultValue=""
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            >
                                                <option value="" disabled>Choisir...</option>
                                                <option value="espèces">Espèces</option>
                                                <option value="carte">Carte</option>
                                                <option value="virement">Virement</option>
                                                <option value="mobile_money">Mobile Money</option>
                                                <option value="chèque">Chèque</option>
                                            </select>
                                            {errors.mode_paiement && <p className="text-sm text-red-600">{errors.mode_paiement}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="reference">Référence</Label>
                                            <Input id="reference" name="reference" placeholder="ex: REF-1234-AB" />
                                            {errors.reference && <p className="text-sm text-red-600">{errors.reference}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="date_paiement">Date du paiement *</Label>
                                            <Input id="date_paiement" name="date_paiement" type="datetime-local" defaultValue={today} required />
                                            {errors.date_paiement && <p className="text-sm text-red-600">{errors.date_paiement}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="commentaire">Commentaire</Label>
                                        <Textarea id="commentaire" name="commentaire" placeholder="Notes supplémentaires..." rows={3} />
                                        {errors.commentaire && <p className="text-sm text-red-600">{errors.commentaire}</p>}
                                    </div>
                                    {boutiques.length > 0 && (
                                        <div className="space-y-2">
                                            <Label htmlFor="boutique_id">Boutique</Label>
                                            <select
                                                id="boutique_id"
                                                name="boutique_id"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            >
                                                <option value="">-- Auto-détection --</option>
                                                {boutiques.map((b) => (
                                                    <option key={b.id} value={b.id}>{b.nom}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex gap-4 justify-end">
                                <Link href="/paiements">
                                    <Button variant="outline">Annuler</Button>
                                </Link>
                                <Button type="submit" disabled={processing} className="shadow-lg shadow-primary/20">
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'Enregistrement...' : 'Enregistrer le paiement'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
