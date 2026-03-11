import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    MapPin,
    Clock,
    User,
    Phone,
    FileText,
    Banknote,
    Truck,
    CheckCircle2,
    XCircle,
    Plus,
    Trash2,
    Package,
    Store as StoreIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
interface LigneCommande {
    id?: number;
    nom: string;
    quantite: number;
    prix: number | string;
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
    observations: string | null;
    lignes_commande?: LigneCommande[];
}

interface Boutique { id: number; nom: string; }

export default function CommandesEdit({ commande, clients, boutiques = [] }: { commande: Commande, clients: Client[], boutiques?: Boutique[] }) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tableau de bord', href: '/dashboard' },
        { title: 'Commandes', href: '/commandes' },
        { title: `Modifier #${commande.numero}`, href: `/commandes/${commande.id}/edit` },
    ];

    const { data, setData, patch, processing, errors } = useForm({
        client_id: commande.client_id?.toString() || '',
        nom_client: commande.nom_client || '',
        telephone_client: commande.telephone_client || '',
        adresse_origine: commande.adresse_origine || '',
        adresse_destination: commande.adresse_destination || '',
        statut: commande.statut,
        montant_total: commande.montant_total,
        observations: commande.observations || '',
        boutique_id: (commande as unknown as { boutique_id?: number }).boutique_id?.toString() || '',
        lignes_commande: commande.lignes_commande || [{ nom: '', quantite: 1, prix: 0 }] as LigneCommande[],
    });

    const addLine = () => {
        setData('lignes_commande', [...data.lignes_commande, { nom: '', quantite: 1, prix: 0 }]);
    };

    const removeLine = (index: number) => {
        if (data.lignes_commande.length > 1) {
            const newLines = [...data.lignes_commande];
            newLines.splice(index, 1);
            setData('lignes_commande', newLines);
            updateTotal(newLines);
        }
    };

    const updateLine = (index: number, field: string, value: string | number) => {
        const newLines = [...data.lignes_commande];
        newLines[index] = { ...newLines[index], [field]: value };
        setData('lignes_commande', newLines);
        if (field === 'quantite' || field === 'prix') {
            updateTotal(newLines);
        }
    };

    const updateTotal = (lines: LigneCommande[]) => {
        const total = lines.reduce((acc, line) => acc + (Number(line.prix) * Number(line.quantite)), 0);
        setData(data => ({ ...data, montant_total: total }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.statut === 'livrée' && commande.statut !== 'livrée') {
            setShowConfirmDialog(true);
            return;
        }

        submitForm();
    };

    const submitForm = () => {
        patch(`/commandes/${commande.id}`, {
            onSuccess: () => setShowConfirmDialog(false),
        });
    };

    const handleClientChange = (clientId: string) => {
        const client = clients.find(c => c.id.toString() === clientId);
        setData(data => ({
            ...data,
            client_id: clientId,
            nom_client: client ? client.nom : '',
            telephone_client: client ? (client.telephone || '') : '',
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier Commande ${commande.numero}`} />

            <div className="max-w-6xl space-y-8 py-4 px-4 md:px-0 pb-24">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Modifier Commande</h1>
                        <p className="text-muted-foreground mt-1">Mise à jour des informations de la commande #{commande.numero}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/commandes/${commande.id}`}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Annuler
                            </Button>
                        </Link>
                    </div>
                </div>

                <Separator />

                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-t-4 border-t-blue-500 shadow-md">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                                        <Truck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle>Informations Client & Livraison</CardTitle>
                                        <CardDescription>Modifiez les détails de destination</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="client_id">Client existant</Label>
                                        <Select value={data.client_id} onValueChange={handleClientChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un client" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Aucun (Saisie manuelle)</SelectItem>
                                                {clients.map(client => (
                                                    <SelectItem key={client.id} value={client.id.toString()}>{client.nom}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nom_client">Nom du client <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="nom_client"
                                                className="pl-9"
                                                value={data.nom_client}
                                                onChange={e => setData('nom_client', e.target.value)}
                                                required
                                            />
                                        </div>
                                        {errors.nom_client && <p className="text-xs text-red-500">{errors.nom_client}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="telephone_client">Téléphone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="telephone_client"
                                                className="pl-9"
                                                value={data.telephone_client}
                                                onChange={e => setData('telephone_client', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="montant_total">Montant Total (FCFA) <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Banknote className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="montant_total"
                                                type="number"
                                                className="pl-9 bg-muted/50 font-bold"
                                                value={data.montant_total}
                                                readOnly
                                                required
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic">Calculé automatiquement selon les articles.</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
                                                <Package className="h-4 w-4" />
                                            </div>
                                            <Label className="text-base font-bold">Articles de la commande</Label>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={addLine} className="h-8 gap-2">
                                            <Plus className="h-4 w-4" /> Ajouter un article
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {data.lignes_commande.map((line: LigneCommande, index: number) => (
                                            <div key={index} className="flex flex-col md:flex-row gap-3 p-4 bg-muted/30 rounded-lg border group relative">
                                                <div className="flex-1 space-y-2">
                                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Description de l'article</Label>
                                                    <Input
                                                        value={line.nom}
                                                        onChange={e => updateLine(index, 'nom', e.target.value)}
                                                        placeholder="Ex: Basket Nike Air Max"
                                                        required
                                                    />
                                                </div>
                                                <div className="w-full md:w-24 space-y-2">
                                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Qté</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={line.quantite}
                                                        onChange={e => updateLine(index, 'quantite', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="w-full md:w-40 space-y-2">
                                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Prix (FCFA)</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={line.prix}
                                                        onChange={e => updateLine(index, 'prix', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="w-full md:w-32 space-y-2">
                                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground text-right block">Total</Label>
                                                    <div className="h-10 flex items-center justify-end font-bold text-sm">
                                                        {(Number(line.prix) * line.quantite).toLocaleString('fr-FR')}
                                                    </div>
                                                </div>
                                                {data.lignes_commande.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="md:mt-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                                        onClick={() => removeLine(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {errors.lignes_commande && <p className="text-xs text-red-500 text-center">{errors.lignes_commande}</p>}
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="adresse_origine">Adresse d'Origine <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-amber-500" />
                                            <Input
                                                id="adresse_origine"
                                                className="pl-9"
                                                value={data.adresse_origine}
                                                onChange={e => setData('adresse_origine', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="adresse_destination">Adresse de Destination <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-emerald-500" />
                                            <Input
                                                id="adresse_destination"
                                                className="pl-9"
                                                value={data.adresse_destination}
                                                onChange={e => setData('adresse_destination', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>Observations</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    className="min-h-[100px]"
                                    value={data.observations}
                                    onChange={e => setData('observations', e.target.value)}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {boutiques.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <StoreIcon className="h-4 w-4" /> Boutique
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Select value={data.boutique_id} onValueChange={value => setData('boutique_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choisir une boutique" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {boutiques.map(boutique => (
                                                <SelectItem key={boutique.id} value={boutique.id.toString()}>{boutique.nom}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.boutique_id && <p className="text-xs text-red-500">{errors.boutique_id}</p>}
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Statut de la Commande</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Button
                                        type="button"
                                        variant={data.statut === 'en_attente' ? 'default' : 'outline'}
                                        className="justify-start gap-2 h-12"
                                        onClick={() => setData('statut', 'en_attente')}
                                    >
                                        <Clock className="h-4 w-4 text-amber-500" />
                                        <span>En attente</span>
                                        {data.statut === 'en_attente' && <CheckCircle2 className="ml-auto h-4 w-4" />}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={data.statut === 'en_cours' ? 'default' : 'outline'}
                                        className="justify-start gap-2 h-12"
                                        onClick={() => setData('statut', 'en_cours')}
                                    >
                                        <Truck className="h-4 w-4 text-blue-500" />
                                        <span>En cours</span>
                                        {data.statut === 'en_cours' && <CheckCircle2 className="ml-auto h-4 w-4" />}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={data.statut === 'livrée' ? 'default' : 'outline'}
                                        className="justify-start gap-2 h-12"
                                        onClick={() => setData('statut', 'livrée')}
                                    >
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        <span>Livrée</span>
                                        {data.statut === 'livrée' && <CheckCircle2 className="ml-auto h-4 w-4" />}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={data.statut === 'annulée' ? 'default' : 'outline'}
                                        className="justify-start gap-2 h-12"
                                        onClick={() => setData('statut', 'annulée')}
                                    >
                                        <XCircle className="h-4 w-4 text-rose-500" />
                                        <span>Annulée</span>
                                        {data.statut === 'annulée' && <CheckCircle2 className="ml-auto h-4 w-4" />}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="sticky top-6">
                            <Card className="bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 border-0 shadow-lg">
                                <CardContent className="pt-6">
                                    <Button
                                        type="submit"
                                        className="w-full font-bold"
                                        size="lg"
                                        variant="secondary"
                                        disabled={processing}
                                    >
                                        {processing ? 'Mise à jour...' : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>

                <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle2 className="h-5 w-5" />
                                Confirmer la livraison
                            </DialogTitle>
                            <DialogDescription>
                                Cette action va marquer la commande comme <strong>Livrée</strong> et créer automatiquement une <strong>Vente</strong> pour comptabiliser les revenus.
                                Veuillez vérifier les articles ci-dessous avant de valider.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 space-y-4">
                            <div className="rounded-lg border bg-muted/30 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left font-medium">Article</th>
                                            <th className="p-3 text-center font-medium">Qté</th>
                                            <th className="p-3 text-right font-medium">Prix</th>
                                            <th className="p-3 text-right font-medium">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.lignes_commande.map((line, idx) => (
                                            <tr key={idx} className="border-b">
                                                <td className="p-3">{line.nom || <span className="italic text-muted-foreground">Sans nom</span>}</td>
                                                <td className="p-3 text-center">{line.quantite}</td>
                                                <td className="p-3 text-right">{Number(line.prix).toLocaleString('fr-FR')}</td>
                                                <td className="p-3 text-right font-semibold">{(Number(line.prix) * line.quantite).toLocaleString('fr-FR')} FCFA</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-muted/50 font-black">
                                            <td colSpan={3} className="p-3 text-right uppercase text-xs tracking-wider">Total à encaisser</td>
                                            <td className="p-3 text-right text-emerald-600">{Number(data.montant_total).toLocaleString('fr-FR')} FCFA</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={processing}>
                                Annuler
                            </Button>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={submitForm}
                                disabled={processing}
                            >
                                {processing ? 'Enregistrement...' : 'Confirmer & Enregistrer la Vente'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
