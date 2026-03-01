
import VenteController from '@/actions/App/Http/Controllers/VenteController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    PlusIcon,
    MinusIcon,
    TrashIcon,
    User,
    Package,
    DollarSign,
    ShoppingCart,
    CreditCard,
    Smartphone,
    Banknote,
    Calculator,
    Store,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { useState, useMemo } from 'react';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: '/dashboard' },
    { title: 'Ventes', href: VenteController.index.url() },
    { title: 'Nouvelle', href: '#' },
];

interface Client { id: number; nom: string; prenom: string; telephone: string; }
interface Variante { id: number; taille: string; prix_vente: number; quantite: number; }
interface Produit { id: number; nom: string; boutique_id: number | null; variantes: Variante[]; }
interface LigneVente { produit_id: number; variante_id: number; produit: Produit; variante: Variante; quantite: number; prix_unitaire: number; sous_total: number; }
interface Boutique { id: number; nom: string; }

export default function VentesCreate({ clients, produits, boutiques }: { clients: Client[]; produits: Produit[]; boutiques: Boutique[]; }) {
    const { auth } = usePage().props as any;
    const userRole = auth.user?.role;

    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [selectedBoutiqueId, setSelectedBoutiqueId] = useState<string>(
        (userRole !== 'admin' && boutiques.length === 1) ? boutiques[0].id.toString() : ''
    );
    const [selectedVarianteId, setSelectedVarianteId] = useState<string>('');
    const [modePaiement, setModePaiement] = useState<string>('espèces');
    const [lignes, setLignes] = useState<LigneVente[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const total = useMemo(() => lignes.reduce((acc, ligne) => acc + ligne.sous_total, 0), [lignes]);

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

        const existingIndex = lignes.findIndex(l => l.variante_id === foundVariante?.id);
        if (existingIndex >= 0) {
            updateQuantite(existingIndex, lignes[existingIndex].quantite + 1);
        } else {
            const nouvelleLigne: LigneVente = {
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
        if (nouvelleQuantite <= 0) { removeLigne(index); return; }
        const ligne = lignes[index];
        if (nouvelleQuantite > ligne.variante.quantite) { alert(`Stock insuffisant. Disponible: ${ligne.variante.quantite}`); return; }

        const updatedLignes = [...lignes];
        updatedLignes[index] = { ...ligne, quantite: nouvelleQuantite, sous_total: nouvelleQuantite * ligne.prix_unitaire };
        setLignes(updatedLignes);
    };

    const removeLigne = (index: number) => { setLignes(lignes.filter((_, i) => i !== index)); };

    const updatePrixUnitaire = (index: number, nouveauPrix: number) => {
        const updatedLignes = [...lignes];
        const ligne = updatedLignes[index];
        updatedLignes[index] = { ...ligne, prix_unitaire: nouveauPrix, sous_total: ligne.quantite * nouveauPrix };
        setLignes(updatedLignes);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (lignes.length === 0) { alert('Veuillez ajouter au moins un produit'); return; }
        setIsSubmitting(true);
        try {
            await router.post(VenteController.store.url(), {
                client_id: selectedClientId || null,
                boutique_id: selectedBoutiqueId || null,
                lignes: lignes.map(l => ({
                    produit_id: l.produit_id,
                    variante_id: l.variante_id,
                    quantite: l.quantite,
                    prix_unitaire: l.prix_unitaire
                })),
                mode_paiement: modePaiement,
            });
        } catch (error) { console.log(error); setIsSubmitting(false); }
    };

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

            return matchBoutique && !idsVariantesDejaSelectionnees.includes(v.id) && v.quantite > 0;
        });
    }, [produits, lignes, selectedBoutiqueId]);

    // Icon helper for Payment
    const getPaymentIcon = (mode: string) => {
        switch (mode) {
            case 'espèces': return <Banknote className="h-4 w-4 mr-2" />;
            case 'carte': return <CreditCard className="h-4 w-4 mr-2" />;
            case 'mobile_money': return <Smartphone className="h-4 w-4 mr-2" />;
            default: return <Calculator className="h-4 w-4 mr-2" />;
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle Vente" />

            {/* Container principal avec padding-bottom pour éviter que le contenu soit caché par la barre fixe mobile */}
            <div className="space-y-6 p-4 pb-32 lg:p-6 lg:pb-6">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <Link href={VenteController.index.url()}>
                            <Button variant="outline" size="icon" className="h-9 w-9">
                                <ArrowLeftIcon className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nouvelle Vente</h1>
                            <p className="text-sm text-muted-foreground">Saisissez les détails de la transaction</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* --- COLONNE DROITE (Desktop) / HAUT (Mobile - Ordre Logique) : PRODUITS --- */}
                        {/* On utilise order-2 sur mobile pour mettre les produits après le client, ou order-1 si on veut d'abord ajouter les produits */}
                        <div className="order-2 lg:order-2 lg:col-span-2 space-y-6">

                            {/* AJOUT PRODUIT */}
                            <Card className="border-primary/20 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center text-base sm:text-lg">
                                        <Package className="h-5 w-5 mr-2 text-primary" />
                                        Ajouter un produit
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1">
                                            <Select value={selectedVarianteId} onValueChange={setSelectedVarianteId} disabled={!selectedBoutiqueId && userRole === 'admin'}>
                                                <SelectTrigger className="h-11 sm:h-10">
                                                    <SelectValue placeholder={!selectedBoutiqueId && userRole === 'admin' ? "Sélectionnez d'abord une boutique..." : "Rechercher un produit..."} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {variantesFiltrees.map((v) => (
                                                        <SelectItem key={v.id} value={v.id.toString()}>
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                                                <span className="font-medium">{v.produit_nom} {v.taille !== 'N/A' ? `(${v.taille})` : ''}</span>
                                                                <span className="hidden sm:inline text-muted-foreground">-</span>
                                                                <span className="text-xs sm:text-sm text-muted-foreground">
                                                                    {formatMontant(v.prix_vente)} FCFA (Stock: {v.quantite})
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={addProduit}
                                            disabled={!selectedVarianteId}
                                            className="h-11 sm:h-10 w-full sm:w-auto"
                                        >
                                            <PlusIcon className="mr-2 h-4 w-4" /> Ajouter
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* BOUTIQUE CARD */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center text-base">
                                        <Store className="h-5 w-5 mr-2 text-muted-foreground" />
                                        Point de Vente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="boutique" className="text-xs uppercase text-muted-foreground font-semibold">Sélectionner la boutique</Label>
                                        <Select
                                            value={selectedBoutiqueId || 'none'}
                                            onValueChange={setSelectedBoutiqueId}
                                            disabled={userRole !== 'admin' && boutiques.length === 1}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Stock Général / Non spécifié" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {userRole === 'admin' && <SelectItem value="none">Stock Général</SelectItem>}
                                                {boutiques.map((boutique) => (
                                                    <SelectItem key={boutique.id} value={boutique.id?.toString()}>
                                                        {boutique.nom}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* LISTE PRODUITS */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="font-semibold flex items-center">
                                        <ShoppingCart className="h-4 w-4 mr-2" /> Panier ({lignes.length})
                                    </h3>
                                    {lignes.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setLignes([])}
                                            className="text-destructive hover:text-destructive h-8 px-2"
                                        >
                                            Tout vider
                                        </Button>
                                    )}
                                </div>

                                {lignes.length === 0 ? (
                                    <div className="border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground bg-muted/20">
                                        <Package className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        <p>Aucun produit dans le panier</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {lignes.map((ligne, index) => (
                                            <Card key={`${ligne.produit_id}-${ligne.variante_id}`} className="overflow-hidden transition-all hover:border-primary/50">
                                                <CardContent className="p-3 sm:p-4">
                                                    {/* Layout Mobile : Stacked / Desktop : Row */}
                                                    <div className="flex flex-col sm:flex-row gap-4">

                                                        {/* Info Produit */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-semibold text-base truncate pr-2">
                                                                        {ligne.produit.nom} {ligne.variante.taille !== 'N/A' ? `(${ligne.variante.taille})` : ''}
                                                                    </h4>
                                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                                        Dispo: {ligne.variante.quantite}
                                                                    </p>
                                                                </div>
                                                                {/* Bouton supprimer visible uniquement sur mobile ici pour gagner de la place */}
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive sm:hidden -mr-2 -mt-2"
                                                                    onClick={() => removeLigne(index)}
                                                                >
                                                                    <TrashIcon className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Contrôles (Qté, Prix, Total) */}
                                                        <div className="flex flex-row items-center justify-between sm:justify-end gap-3 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-dashed">

                                                            {/* Quantité */}
                                                            <div className="flex items-center border rounded-md bg-background shadow-sm">
                                                                <button
                                                                    type="button"
                                                                    className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-l-md active:bg-muted/80"
                                                                    onClick={() => updateQuantite(index, ligne.quantite - 1)}
                                                                >
                                                                    <MinusIcon className="h-3 w-3" />
                                                                </button>
                                                                <div className="w-10 text-center font-medium text-sm">
                                                                    {ligne.quantite}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-r-md active:bg-muted/80"
                                                                    onClick={() => updateQuantite(index, ligne.quantite + 1)}
                                                                >
                                                                    <PlusIcon className="h-3 w-3" />
                                                                </button>
                                                            </div>

                                                            {/* Prix Unitaire (Editable) */}
                                                            <div className="flex items-center w-24 sm:w-28 relative">
                                                                <Input
                                                                    type="number"
                                                                    value={ligne.prix_unitaire}
                                                                    onChange={(e) => updatePrixUnitaire(index, parseFloat(e.target.value) || 0)}
                                                                    className="h-8 pr-8 text-right font-mono text-sm"
                                                                    min="0"
                                                                />
                                                                <div className="absolute right-2 text-xs text-muted-foreground pointer-events-none">F</div>
                                                            </div>

                                                            {/* Sous-total */}
                                                            <div className="text-right min-w-[80px]">
                                                                <div className="font-bold text-sm sm:text-base whitespace-nowrap">
                                                                    {formatMontant(ligne.sous_total)} <span className="text-xs font-normal text-muted-foreground">F</span>
                                                                </div>
                                                            </div>

                                                            {/* Delete Desktop */}
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="hidden sm:flex h-8 w-8 text-muted-foreground hover:text-destructive"
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
                            </div>
                        </div>

                        {/* --- COLONNE GAUCHE (Desktop) / BAS (Mobile) : INFOS --- */}
                        <div className="order-1 lg:order-1 space-y-6">
                            {/* CLIENT CARD */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center text-base">
                                        <User className="h-5 w-5 mr-2 text-muted-foreground" />
                                        Information Client
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="client" className="text-xs uppercase text-muted-foreground font-semibold">Sélectionner un client</Label>
                                        <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Client de passage" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Client de passage</SelectItem>
                                                {clients.map((client) => (
                                                    <SelectItem key={client.id} value={client.id.toString()}>
                                                        {client.nom} {client.prenom}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedClientId && selectedClientId !== 'none' && (
                                            <div className="pt-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded border mt-2">
                                                Tel: {clients.find(c => c.id.toString() === selectedClientId)?.telephone}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* PAIEMENT CARD */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center text-base">
                                        <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                                        Paiement
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="mode_paiement" className="text-xs uppercase text-muted-foreground font-semibold">Mode de règlement</Label>
                                        <Select value={modePaiement} onValueChange={setModePaiement}>
                                            <SelectTrigger className="h-11">
                                                <div className="flex items-center">
                                                    {getPaymentIcon(modePaiement)}
                                                    <SelectValue />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="espèces">Espèces</SelectItem>
                                                <SelectItem value="carte">Carte bancaire</SelectItem>
                                                <SelectItem value="virement">Virement</SelectItem>
                                                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* RÉSUMÉ DESKTOP (Caché sur mobile car on a la barre fixe) */}
                            <Card className="hidden lg:block bg-primary/5 border-primary/20">
                                <CardHeader className="pb-3">
                                    <CardTitle>Total à payer</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Articles</span>
                                            <span className="font-semibold">{lignes.reduce((acc, l) => acc + l.quantite, 0)}</span>
                                        </div>
                                        <Separator className="bg-primary/20" />
                                        <div className="flex justify-between text-3xl font-bold text-primary">
                                            <span>{formatMontant(total)}</span>
                                            <span className="text-lg font-normal text-muted-foreground mt-auto mb-1">FCFA</span>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full mt-6 h-12 text-lg shadow-lg shadow-primary/20"
                                        type="submit"
                                        disabled={isSubmitting || lignes.length === 0}
                                    >
                                        {isSubmitting ? '...' : 'Valider la vente'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* --- BARRE FIXE MOBILE (Visible uniquement sur mobile) --- */}
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
                        <div className="flex items-center gap-4 max-w-md mx-auto">
                            <div className="flex-1">
                                <div className="text-xs text-muted-foreground uppercase font-semibold">Total</div>
                                <div className="text-2xl font-bold text-primary leading-none">
                                    {formatMontant(total)} <span className="text-sm font-normal text-muted-foreground">F</span>
                                </div>
                            </div>
                            <Button
                                size="lg"
                                className="h-12 px-8 rounded-full shadow-md font-bold"
                                type="submit"
                                disabled={isSubmitting || lignes.length === 0}
                            >
                                {isSubmitting ? '...' : 'Valider'}
                            </Button>
                        </div>
                    </div>

                </form>
            </div>
        </AppLayout>
    );
}
