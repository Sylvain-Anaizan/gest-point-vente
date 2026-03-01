import VenteController from '@/actions/App/Http/Controllers/VenteController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    PlusIcon,
    MinusIcon,
    TrashIcon,
    SaveIcon,
    User,
    Package,
    DollarSign,
    ShoppingCart,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tableau de bord',
        href: '/dashboard',
    },
    {
        title: 'Gestion des ventes',
        href: VenteController.index.url(),
    },
    {
        title: 'Modifier la vente',
        href: '#',
    },
];

interface Client {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
}

interface Variante { id: number; taille: string; prix_vente: number; quantite: number; }
interface Produit { id: number; nom: string; boutique_id: number | null; variantes: Variante[]; }
interface LigneVente { id: number; produit_id: number; variante_id: number; produit: Produit; variante: Variante; quantite: number; prix_unitaire: number; sous_total: number; }

interface Vente {
    id: number;
    numero: string;
    client_id: number | null;
    user_id: number;
    montant_total: number;
    statut: 'complétée' | 'annulée';
    mode_paiement: 'espèces' | 'carte' | 'virement' | 'mobile_money';
    created_at: string;
    updated_at: string;
    client?: Client;
    boutique?: Boutique;
    lignes: LigneVente[];
    boutique_id: number | null;
}

interface Boutique {
    id: number;
    nom: string;
}

export default function VentesEdit({
    vente,
    clients,
    produits,
    boutiques,
}: {
    vente: Vente;
    clients: Client[];
    produits: Produit[];
    boutiques: Boutique[];
}) {
    const { auth } = usePage().props as any;
    const userRole = auth.user?.role;

    const [selectedClientId, setSelectedClientId] = useState<string>(vente.client_id?.toString() || '');
    const [selectedBoutiqueId, setSelectedBoutiqueId] = useState<string>(vente.boutique_id?.toString() || '');
    const [selectedVarianteId, setSelectedVarianteId] = useState<string>('');
    const [modePaiement, setModePaiement] = useState<string>(vente.mode_paiement);
    const [statut, setStatut] = useState<string>(vente.statut);
    const [lignes, setLignes] = useState<LigneVente[]>(vente.lignes);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calcul du total
    const total = useMemo(() => {
        return lignes.reduce((acc, ligne) => acc + ligne.sous_total, 0);
    }, [lignes]);

    // Fonction pour formater les montants : pas de décimales, espaces pour les milliers
    const formatMontant = (montant: string | number | null | undefined): string => {
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

    const addProduit = () => {
        if (!selectedVarianteId) return;

        // Trouver la variante et son produit parent
        let foundProduit: Produit | undefined;
        let foundVariante: Variante | undefined;

        for (const p of produits) {
            const v = p.variantes.find(v => v.id === parseInt(selectedVarianteId));
            if (v) {
                foundProduit = p;
                foundVariante = v;
                break;
            }
        }

        if (!foundProduit || !foundVariante) return;

        // Vérifier si la variante est déjà dans la liste
        const existingIndex = lignes.findIndex(l => l.variante_id === foundVariante?.id);

        if (existingIndex >= 0) {
            // Augmenter la quantité
            updateQuantite(existingIndex, lignes[existingIndex].quantite + 1);
        } else {
            // Ajouter nouveau produit
            const nouvelleLigne: LigneVente = {
                id: 0, // ID temporaire pour les nouvelles lignes
                produit_id: foundProduit.id,
                variante_id: foundVariante.id,
                produit: foundProduit,
                variante: foundVariante,
                quantite: 1,
                prix_unitaire: foundVariante.prix_vente,
                sous_total: foundVariante.prix_vente,
            };
            setLignes([...lignes, nouvelleLigne]);
        }

        setSelectedVarianteId('');
    };

    const updateQuantite = (index: number, nouvelleQuantite: number) => {
        if (nouvelleQuantite <= 0) {
            removeLigne(index);
            return;
        }

        const ligne = lignes[index];
        // Pour les modifications, on doit considérer le stock actuel + la quantité déjà vendue
        const stockDisponible = ligne.variante.quantite + (vente.statut === 'complétée' ? ligne.quantite : 0);

        if (nouvelleQuantite > stockDisponible) {
            alert(`Stock insuffisant. Disponible: ${stockDisponible}`);
            return;
        }

        const updatedLignes = [...lignes];
        updatedLignes[index] = {
            ...ligne,
            quantite: nouvelleQuantite,
            sous_total: nouvelleQuantite * ligne.prix_unitaire,
        };
        setLignes(updatedLignes);
    };

    const removeLigne = (index: number) => {
        setLignes(lignes.filter((_, i) => i !== index));
    };

    const updatePrixUnitaire = (index: number, nouveauPrix: number) => {
        const updatedLignes = [...lignes];
        const ligne = updatedLignes[index];
        updatedLignes[index] = {
            ...ligne,
            prix_unitaire: nouveauPrix,
            sous_total: ligne.quantite * nouveauPrix,
        };
        setLignes(updatedLignes);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (lignes.length === 0) {
            alert('Veuillez ajouter au moins un produit');
            return;
        }

        setIsSubmitting(true);

        try {
            await router.put(VenteController.update.url(vente.id), {
                client_id: selectedClientId || null,
                boutique_id: selectedBoutiqueId || null,
                lignes: lignes.map(l => ({
                    produit_id: l.produit_id,
                    variante_id: l.variante_id,
                    quantite: l.quantite,
                    prix_unitaire: l.prix_unitaire,
                })),
                mode_paiement: modePaiement,
                statut: statut,
            });
        } catch (error) {
            console.log(error);
            setIsSubmitting(false);
        }
    };

    const variantesFiltrees = useMemo(() => {
        const idsVariantesDejaSelectionnees = lignes.map(l => l.variante_id);

        // On récupère toutes les variantes avec leurs infos de produit parent
        const allVariantes = produits.flatMap(p =>
            p.variantes.map(v => ({
                ...v,
                produit_nom: p.nom,
                boutique_id: p.boutique_id
            }))
        );

        return allVariantes.filter(v => {
            // Filtrage par boutique
            const matchBoutique = selectedBoutiqueId === 'none'
                ? v.boutique_id === null
                : v.boutique_id?.toString() === selectedBoutiqueId;

            // On affiche même les variantes déjà sélectionnées dans l'edit pour permettre de changer le prix/qté
            // mais l'UI d'ajout bloquera normalement
            return matchBoutique && !idsVariantesDejaSelectionnees.includes(v.id);
        });
    }, [produits, lignes, selectedBoutiqueId]);

    const getStatutBadge = (statutValue: string) => {
        switch (statutValue) {
            case 'complétée':
                return <Badge variant="default" className="bg-green-100 text-green-800">Complétée</Badge>;
            case 'annulée':
                return <Badge variant="destructive">Annulée</Badge>;
            default:
                return <Badge variant="secondary">{statutValue}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier la vente ${vente.numero}`} />

            <div className="space-y-6 p-6">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={VenteController.show.url(vente.id)}>
                            <Button variant="outline" size="sm">
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Retour
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Modifier la vente {vente.numero}</h1>
                            <p className="text-muted-foreground">
                                Modifier les détails de la vente - {getStatutBadge(vente.statut)}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* COLONNE GAUCHE - INFORMATIONS CLIENT ET PAIEMENT */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <User className="h-5 w-5" />
                                        <span>Client</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="client">Client (optionnel)</Label>
                                            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner un client" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Aucun client</SelectItem>
                                                    {clients.map((client) => (
                                                        <SelectItem key={client.id} value={client.id.toString()}>
                                                            {client.nom} {client.prenom} - {client.telephone}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="boutique">Boutique (optionnel)</Label>
                                            <Select
                                                value={selectedBoutiqueId || 'none'}
                                                onValueChange={setSelectedBoutiqueId}
                                                disabled={userRole !== 'admin' && boutiques.length === 1}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Stock Général" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {userRole === 'admin' && <SelectItem value="none">Stock Général</SelectItem>}
                                                    {boutiques.map((boutique) => (
                                                        <SelectItem key={boutique.id} value={boutique.id.toString()}>
                                                            {boutique.nom}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <DollarSign className="h-5 w-5" />
                                        <span>Paiement</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="mode_paiement">Mode de paiement</Label>
                                            <Select value={modePaiement} onValueChange={setModePaiement}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="espèces">Espèces</SelectItem>
                                                    <SelectItem value="carte">Carte bancaire</SelectItem>
                                                    <SelectItem value="virement">Virement</SelectItem>
                                                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="statut">Statut</Label>
                                            <Select value={statut} onValueChange={setStatut}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="complétée">Complétée</SelectItem>
                                                    <SelectItem value="annulée">Annulée</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {statut !== vente.statut && (
                                                <p className="text-sm text-orange-600 mt-1">
                                                    ⚠️ Changer le statut affectera le stock des produits
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Résumé</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Nombre d'articles:</span>
                                            <span className="font-semibold">{lignes.reduce((acc, l) => acc + l.quantite, 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Produits différents:</span>
                                            <span className="font-semibold">{lignes.length}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total:</span>
                                            <span>{formatMontant(total)} FCFA</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* COLONNE DROITE - PRODUITS */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* AJOUT DE PRODUIT */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Package className="h-5 w-5" />
                                        <span>Ajouter un produit</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <Select value={selectedVarianteId} onValueChange={setSelectedVarianteId} disabled={!selectedBoutiqueId && userRole === 'admin'}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={!selectedBoutiqueId && userRole === 'admin' ? "Sélectionnez d'abord une boutique..." : "Sélectionner un produit"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {variantesFiltrees.map((v) => (
                                                        <SelectItem key={v.id} value={v.id.toString()}>
                                                            {v.produit_nom} {v.taille !== 'N/A' ? `(${v.taille})` : ''} - {formatMontant(v.prix_vente)} FCFA (Stock: {v.quantite})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={addProduit}
                                            disabled={!selectedVarianteId}
                                        >
                                            <PlusIcon className="mr-2 h-4 w-4" />
                                            Ajouter
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* LISTE DES PRODUITS SÉLECTIONNÉS */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <ShoppingCart className="h-5 w-5" />
                                        <span>Produits sélectionnés</span>
                                        <Badge variant="secondary">{lignes.length}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {lignes.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Aucun produit sélectionné
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {lignes.map((ligne, index) => (
                                                <Card key={`${ligne.produit_id}-${ligne.variante_id}`} className="border">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold">{ligne.produit.nom} {ligne.variante?.taille !== 'N/A' ? `(${ligne.variante?.taille})` : ''}</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Stock disponible: {ligne.variante?.quantite || 0}
                                                                    {vente.statut === 'complétée' && (
                                                                        <span className="ml-2 text-orange-600">
                                                                            (+{ligne.quantite} déjà vendus)
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center space-x-4">
                                                                {/* QUANTITÉ */}
                                                                <div className="flex items-center space-x-2">
                                                                    <Label className="text-sm">Qté:</Label>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => updateQuantite(index, ligne.quantite - 1)}
                                                                    >
                                                                        <MinusIcon className="h-3 w-3" />
                                                                    </Button>
                                                                    <Input
                                                                        type="number"
                                                                        value={ligne.quantite}
                                                                        onChange={(e) => updateQuantite(index, parseInt(e.target.value) || 0)}
                                                                        className="w-16 text-center"
                                                                        min="1"
                                                                        max={(ligne.variante?.quantite || 0) + (vente.statut === 'complétée' ? ligne.quantite : 0)}
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => updateQuantite(index, ligne.quantite + 1)}
                                                                    >
                                                                        <PlusIcon className="h-3 w-3" />
                                                                    </Button>
                                                                </div>

                                                                {/* PRIX UNITAIRE */}
                                                                <div className="flex items-center space-x-2">
                                                                    <Label className="text-sm">Prix:</Label>
                                                                    <Input
                                                                        type="number"
                                                                        value={ligne.prix_unitaire}
                                                                        onChange={(e) => updatePrixUnitaire(index, parseFloat(e.target.value) || 0)}
                                                                        className="w-24"
                                                                        min="0"
                                                                        step="0.01"
                                                                    />
                                                                    <span className="text-sm">FCFA</span>
                                                                </div>

                                                                {/* SOUS-TOTAL */}
                                                                <div className="text-right min-w-[100px]">
                                                                    <span className="font-semibold">
                                                                        {formatMontant(ligne.sous_total)} FCFA
                                                                    </span>
                                                                </div>

                                                                {/* SUPPRIMER */}
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => removeLigne(index)}
                                                                >
                                                                    <TrashIcon className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* BOUTON DE SOUMISSION */}
                            <div className="flex justify-end space-x-4">
                                <Link href={VenteController.show.url(vente.id)}>
                                    <Button type="button" variant="outline">
                                        Annuler
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || lignes.length === 0}
                                    className="min-w-[120px]"
                                >
                                    {isSubmitting ? (
                                        'Modification...'
                                    ) : (
                                        <>
                                            <SaveIcon className="mr-2 h-4 w-4" />
                                            Modifier la vente
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}