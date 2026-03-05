import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, ArrowDownLeft, ArrowUpRight, Scale, AlertTriangle } from 'lucide-react';
import MouvementStockController from '@/actions/App/Http/Controllers/MouvementStockController';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: '/dashboard' },
    { title: 'Mouvements de stock', href: MouvementStockController.index.url() },
    { title: 'Nouvelle saisie', href: MouvementStockController.create.url() },
];

interface Taille { id: number; nom: string; }
interface Variante { id: number; taille: Taille | null; quantite: number; prix_vente: number; }
interface Produit { id: number; nom: string; imageUrl: string; variantes: Variante[]; }

export default function MouvementsCreate({
    produits
}: {
    produits: Produit[];
}) {
    const { data, setData, post, processing, errors } = useForm({
        produit_id: '',
        variante_id: '',
        type: 'entrée',
        quantite: '',
        commentaire: '',
    });

    const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
    const [selectedVariante, setSelectedVariante] = useState<Variante | null>(null);

    const handleProduitChange = (val: string) => {
        const prod = produits.find(p => p.id.toString() === val);
        setSelectedProduit(prod || null);
        setSelectedVariante(null);
        setData(data => ({ ...data, produit_id: val, variante_id: '' }));
    };

    const handleVarianteChange = (val: string) => {
        if (!selectedProduit) return;
        const vari = selectedProduit.variantes.find(v => v.id.toString() === val);
        setSelectedVariante(vari || null);
        setData('variante_id', val);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(MouvementStockController.store.url());
    };

    const isExitType = data.type === 'sortie' || data.type === 'perte';
    const currentStock = selectedVariante?.quantite || 0;
    const proposedQuantity = parseInt(data.quantite) || 0;
    const simulatedStock = isExitType
        ? currentStock - proposedQuantity
        : currentStock + proposedQuantity;

    const isExceedingStock = isExitType && proposedQuantity > currentStock;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouveau Mouvement de stock" />

            <div className="space-y-6 p-4 md:p-6 max-w-[1200px] pb-24">
                <div className="flex items-center gap-4">
                    <Link href={MouvementStockController.index.url()}>
                        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Saisir un mouvement</h1>
                        <p className="text-sm text-muted-foreground">Enregistrer une entrée, sortie ou perte d'inventaire.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                            <CardTitle>Détails du mouvement</CardTitle>
                            <CardDescription>Renseignez les informations de l'opération.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">

                            {/* Choix du Produit */}
                            <div className="space-y-2">
                                <Label htmlFor="produit_id">Produit <span className="text-red-500">*</span></Label>
                                <Select value={data.produit_id} onValueChange={handleProduitChange}>
                                    <SelectTrigger className={`w-full ${errors.produit_id ? 'border-red-500 ring-red-500' : ''}`}>
                                        <SelectValue placeholder="Sélectionner un produit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {produits.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.nom} {p.variantes.length > 0 ? `(${p.variantes.reduce((sum, v) => sum + v.quantite, 0)} en stock)` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.produit_id && <p className="text-[10px] text-red-500">{errors.produit_id}</p>}
                            </div>

                            {/* Choix de la Taille / Variante */}
                            {selectedProduit && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <Label htmlFor="variante_id">Taille / Variante <span className="text-red-500">*</span></Label>

                                    {selectedProduit.variantes.length === 0 ? (
                                        <div className="p-3 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm">
                                            Ce produit n'a aucune variante (taille) configurée. Veuillez d'abord en ajouter une depuis la fiche produit.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {selectedProduit.variantes.map(variante => {
                                                const isSelected = data.variante_id === variante.id.toString();
                                                const nomTaille = variante.taille?.nom || 'Unique';

                                                return (
                                                    <div
                                                        key={variante.id}
                                                        onClick={() => handleVarianteChange(variante.id.toString())}
                                                        className={`
                                                            cursor-pointer rounded-xl border-2 p-3 transition-all flex flex-col items-center justify-center gap-1 text-center
                                                            ${isSelected
                                                                ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20 ring-offset-1'
                                                                : 'border-border/60 hover:border-primary/40 hover:bg-muted/30'
                                                            }
                                                        `}
                                                    >
                                                        <span className="font-bold text-lg">{nomTaille}</span>
                                                        <Badge variant="secondary" className={`${variante.quantite <= 0 ? 'bg-red-100 text-red-700' : ''}`}>
                                                            {variante.quantite} dispo
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {errors.variante_id && <p className="text-[10px] text-red-500">{errors.variante_id}</p>}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                {/* Type de mouvement */}
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type d'opération <span className="text-red-500">*</span></Label>
                                    <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                        <SelectTrigger className={`w-full ${errors.type ? 'border-red-500 ring-red-500' : ''}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="entrée">
                                                <div className="flex items-center gap-2">
                                                    <ArrowDownLeft className="h-4 w-4 text-emerald-600" /> Entrée (Ajout)
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="sortie">
                                                <div className="flex items-center gap-2">
                                                    <ArrowUpRight className="h-4 w-4 text-blue-600" /> Sortie (Retrait)
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="perte">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-rose-600" /> Perte / Casse
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="ajustement">
                                                <div className="flex items-center gap-2">
                                                    <Scale className="h-4 w-4 text-orange-600" /> Ajustement
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-[10px] text-red-500">{errors.type}</p>}
                                </div>

                                {/* Quantité */}
                                <div className="space-y-2">
                                    <Label htmlFor="quantite">Quantité <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="quantite"
                                        type="number"
                                        min="1"
                                        value={data.quantite}
                                        onChange={(e) => setData('quantite', e.target.value)}
                                        className={`${errors.quantite || isExceedingStock ? 'border-red-500 ring-red-500' : ''} text-lg font-mono`}
                                        placeholder="Ex: 10"
                                    />
                                    {errors.quantite && <p className="text-[10px] text-red-500">{errors.quantite}</p>}
                                </div>
                            </div>

                            {/* Résumé de l'opération */}
                            {selectedVariante && data.quantite && (
                                <div className={`p-4 rounded-xl flex items-center justify-between border ${isExceedingStock ? 'bg-red-50 border-red-200 text-red-800' : 'bg-muted/40 border-border/50'}`}>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projection du stock</span>
                                        <span className="text-sm">De <strong className="text-lg">{currentStock}</strong> vers <strong className="text-lg">{simulatedStock}</strong></span>
                                    </div>
                                    {isExceedingStock && (
                                        <div className="flex items-center gap-2 text-red-600 bg-red-100 px-3 py-1.5 rounded-lg text-sm font-semibold">
                                            <AlertTriangle className="h-4 w-4" /> Stock insuffisant
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Commentaire */}
                            <div className="space-y-2">
                                <Label htmlFor="commentaire">Commentaire (Optionnel)</Label>
                                <Textarea
                                    id="commentaire"
                                    value={data.commentaire}
                                    onChange={(e) => setData('commentaire', e.target.value)}
                                    placeholder="Raison de la sortie, référence facture fournisseur, etc."
                                    className="resize-none h-20"
                                />
                                {errors.commentaire && <p className="text-[10px] text-red-500">{errors.commentaire}</p>}
                            </div>

                        </CardContent>
                        <CardFooter className="bg-muted/10 border-t border-border/50 py-4 flex justify-between">
                            <Link href={MouvementStockController.index.url()}>
                                <Button type="button" variant="ghost">Annuler</Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing || !data.produit_id || !data.variante_id || !data.quantite || isExceedingStock}
                                className="bg-primary shadow-md hover:shadow-lg transition-all"
                            >
                                {processing ? 'Enregistrement...' : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" /> Enregistrer le mouvement
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
