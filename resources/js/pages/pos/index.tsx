import POSController from '@/actions/App/Http/Controllers/POSController';
import { Head, useForm } from '@inertiajs/react';
import {
    SearchIcon,
    ShoppingCartIcon,
    TrashIcon,
    PlusIcon,
    MinusIcon,
    UserIcon,
    CreditCardIcon,
    BanknoteIcon,
    SmartphoneIcon,
    CalculatorIcon,

} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';

// --- Interfaces ---
interface Produit {
    id: number;
    nom: string;
    prix_vente: number;
    quantite: number;
    imageUrl: string;
    category?: { nom: string };
    taille?: { nom: string };
}

interface Client {
    id: number;
    nom: string;
    email: string | null;
    telephone: string;
}

interface PanierItem extends Produit {
    panierQuantite: number;
}

export default function POSIndex({ produits, clients }: { produits: Produit[]; clients: Client[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [panier, setPanier] = useState<PanierItem[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>('anonymous');
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [openCombobox, setOpenCombobox] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        client_id: null as number | null,
        panier: [] as { id: number; quantite: number; prix_vente: number }[],
        mode_paiement: 'espèces',
        montant_recu: null as number | null,
    });

    // --- Calculs ---
    const categories = useMemo(() => {
        const cats = new Set(produits.map(p => p.category?.nom || 'Autre'));
        return ['all', ...Array.from(cats)];
    }, [produits]);

    const filteredProducts = useMemo(() => {
        return produits.filter(p => {
            const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || (p.category?.nom || 'Autre') === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [produits, searchTerm, selectedCategory]);

    const panierTotal = useMemo(() => {
        return panier.reduce((total, item) => total + (item.prix_vente * item.panierQuantite), 0);
    }, [panier]);

    const montantRendu = useMemo(() => {
        const recu = parseFloat(data.montant_recu ? String(data.montant_recu) : '0');
        if (isNaN(recu)) return 0;
        return Math.max(0, recu - panierTotal);
    }, [data.montant_recu, panierTotal]);

    // --- Actions ---
    const addToCart = (produit: Produit) => {
        setPanier(prev => {
            const existing = prev.find(item => item.id === produit.id);
            if (existing) {
                if (existing.panierQuantite >= produit.quantite) {
                    toast.error("Stock insuffisant");
                    return prev;
                }
                return prev.map(item =>
                    item.id === produit.id
                        ? { ...item, panierQuantite: item.panierQuantite + 1 }
                        : item
                );
            }
            return [...prev, { ...produit, panierQuantite: 1 }];
        });
        toast.success(`${produit.nom} ajouté`, { duration: 1000, position: 'bottom-center' });
    };

    const removeFromCart = (id: number) => {
        setPanier(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: number, delta: number) => {
        setPanier(prev => {
            return prev.map(item => {
                if (item.id === id) {
                    const newQty = item.panierQuantite + delta;
                    if (newQty < 1) return item;
                    if (newQty > item.quantite) return item;
                    return { ...item, panierQuantite: newQty };
                }
                return item;
            });
        });
    };

    const handleCheckout = () => {
        setPaymentModalOpen(true);
        setIsCartOpen(false); // Fermer le drawer mobile si ouvert
        setData({
            client_id: selectedClient === 'anonymous' ? null : parseInt(selectedClient),
            panier: panier.map(item => ({
                id: item.id,
                quantite: item.panierQuantite,
                prix_vente: item.prix_vente,
            })),
            mode_paiement: 'espèces',
            montant_recu: null,
        });
    };

    const confirmPayment = () => {
        post(POSController.store.url(), {
            onSuccess: () => {
                setPaymentModalOpen(false);
                setPanier([]);
                setSelectedClient('anonymous');
                reset();
                toast.success("Vente enregistrée avec succès");
            },
            onError: (errors) => {
                console.error("Erreur:", errors);
                toast.error("Erreur lors de l'enregistrement");
            }
        });
    };

    // --- Composant Reutilisable pour le contenu du Panier ---
    const CartContentUI = () => (
        <div className="flex flex-col h-full">
            <div className="pb-4">
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className="w-full justify-between bg-background font-normal"
                        >
                            {selectedClient === 'anonymous'
                                ? "Client Anonyme"
                                : clients.find((client) => client.id.toString() === selectedClient)?.nom || "Sélectionner un client..."}
                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Rechercher un client..." />
                            <CommandList>
                                <CommandEmpty>Aucun client trouvé.</CommandEmpty>
                                <CommandGroup>
                                    <CommandItem
                                        value="anonymous"
                                        onSelect={() => {
                                            setSelectedClient('anonymous');
                                            setData('client_id', null);
                                            setOpenCombobox(false);
                                        }}
                                    >
                                        <CheckIcon
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedClient === 'anonymous' ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        Client Anonyme
                                    </CommandItem>
                                    {clients.map((client) => (
                                        <CommandItem
                                            key={client.id}
                                            value={`${client.nom} ${client.telephone || ''}`}
                                            onSelect={() => {
                                                setSelectedClient(client.id.toString());
                                                setData('client_id', client.id);
                                                setOpenCombobox(false);
                                            }}
                                        >
                                            <CheckIcon
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedClient === client.id.toString() ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col">
                                                <span>{client.nom}</span>
                                                {client.telephone && (
                                                    <span className="text-xs text-muted-foreground">{client.telephone}</span>
                                                )}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                {errors.client_id && <p className="text-sm text-destructive mt-1">{errors.client_id}</p>}
            </div>

            <ScrollArea className="flex-1 -mx-4 px-4">
                {panier.length === 0 ? (
                    <div className="h-[30vh] lg:h-full flex flex-col items-center justify-center text-muted-foreground">
                        <ShoppingCartIcon className="h-12 w-12 mb-2 opacity-20" />
                        <p>Panier vide</p>
                    </div>
                ) : (
                    <div className="space-y-3 pb-4">
                        {panier.map((item) => (
                            <div key={item.id} className="flex gap-2 items-start p-2 rounded-lg border bg-card/50">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium truncate">{item.nom}</h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs text-muted-foreground">
                                            {item.panierQuantite} x {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(item.prix_vente)}
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(item.prix_vente * item.panierQuantite)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 items-center">
                                    <div className="flex items-center border rounded-md bg-background shadow-sm">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-muted active:bg-muted/80">
                                            <MinusIcon className="h-3 w-3" />
                                        </button>
                                        <span className="w-6 text-center text-xs font-medium">{item.panierQuantite}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-muted active:bg-muted/80" disabled={item.panierQuantite >= item.quantite}>
                                            <PlusIcon className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-destructive hover:text-destructive/80 p-1">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {errors.panier && <p className="text-sm text-destructive p-2">{errors.panier}</p>}

            <div className="pt-4 mt-auto border-t bg-background/50 backdrop-blur-sm space-y-3">
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Sous-total</span>
                        <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(panierTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-primary">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(panierTotal)}</span>
                    </div>
                </div>

                <Button
                    className="w-full h-12 text-lg shadow-md"
                    disabled={panier.length === 0 || processing}
                    onClick={handleCheckout}
                >
                    {processing ? '...' : 'Encaisser'}
                </Button>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'POS', href: '#' }]}>
            <Head title="Point de Vente" />

            {/* Container principal avec hauteur dynamique pour mobile */}
            <div className="h-[calc(100dvh-4rem)] lg:h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4 lg:gap-6 relative">

                {/* 1. Zone Gauche : Catalogue (Prend toute la largeur sur mobile) */}
                <div className="flex-1 flex flex-col gap-4 min-w-0 h-full pb-20 lg:pb-0">
                    {/* Filtres */}
                    <Card className="shrink-0 border-0 shadow-none lg:border lg:shadow-sm bg-transparent lg:bg-card">
                        <CardContent className="p-0 lg:p-4 flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher..."
                                    className="pl-9 h-11 lg:h-10 bg-background shadow-sm lg:shadow-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full sm:w-[180px] h-11 lg:h-10 bg-background shadow-sm lg:shadow-none">
                                    <SelectValue placeholder="Catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tout</SelectItem>
                                    {categories.filter(c => c !== 'all').map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Grille Produits */}
                    <ScrollArea className="flex-1 rounded-md border-0 lg:border bg-transparent lg:bg-card p-0 lg:p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 pb-4">
                            {filteredProducts.map((produit) => (
                                <button
                                    key={produit.id}
                                    onClick={() => addToCart(produit)}
                                    disabled={produit.quantite <= 0}
                                    className={cn(
                                        "group relative flex flex-col items-start text-left rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden",
                                        produit.quantite <= 0 ? "opacity-60 grayscale cursor-not-allowed" : "hover:border-primary/50"
                                    )}
                                >
                                    <div className="w-full aspect-square bg-muted relative overflow-hidden">
                                        <img
                                            src={produit.imageUrl}
                                            alt={produit.nom}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        {/* Overlay gradient on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Add to cart icon on hover */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                <PlusIcon className="h-8 w-8" />
                                            </div>
                                        </div>

                                        {produit.quantite <= 5 && produit.quantite > 0 && (
                                            <Badge variant="destructive" className="absolute top-2 right-2 shadow-md">
                                                -{produit.quantite}
                                            </Badge>
                                        )}
                                        {produit.quantite <= 0 && (
                                            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                                                <Badge variant="secondary" className="text-sm px-3 py-1 font-semibold border-2">Épuisé</Badge>
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full p-3 space-y-2 bg-card z-10">
                                        <h3 className="font-semibold leading-tight line-clamp-2 text-sm h-10 text-foreground/90 group-hover:text-primary transition-colors">
                                            {produit.nom}
                                        </h3>
                                        <div className="flex items-center justify-between w-full pt-1 border-t border-border/50">
                                            <span className="font-bold text-primary text-lg">
                                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(produit.prix_vente)}
                                            </span>
                                            {produit.category?.nom && (
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium bg-muted px-1.5 py-0.5 rounded">
                                                    {produit.category.nom}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center h-40 text-muted-foreground">
                                    <SearchIcon className="h-10 w-10 mb-2 opacity-20" />
                                    <p>Aucun produit trouvé</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>D

                {/* 2. Zone Droite : Panier (DESKTOP SEULEMENT) */}
                <Card className="hidden lg:flex w-[380px] xl:w-[420px] flex-col h-full border-l shrink-0 shadow-sm">
                    <CardHeader className="pb-3 border-b bg-muted/30">
                        <CardTitle className="flex items-center justify-between text-base">
                            <span className="flex items-center gap-2">
                                <ShoppingCartIcon className="h-5 w-5" /> Panier
                            </span>
                            <Badge variant="secondary">
                                {panier.reduce((acc, item) => acc + item.panierQuantite, 0)} articles
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-4 overflow-hidden flex flex-col h-full">
                        <CartContentUI />
                    </CardContent>
                </Card>

                {/* 3. Barre Flottante Mobile (MOBILE SEULEMENT) */}
                <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
                    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                        <SheetTrigger asChild>
                            <Button size="lg" className="w-full h-14 shadow-xl flex items-center justify-between px-6 rounded-full text-base">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary-foreground/20 px-2 py-0.5 rounded text-sm font-semibold">
                                        {panier.reduce((acc, item) => acc + item.panierQuantite, 0)}
                                    </div>
                                    <span className="font-medium">Voir le panier</span>
                                </div>
                                <div className="font-bold text-lg">
                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(panierTotal)}
                                </div>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[85dvh] flex flex-col rounded-t-[20px] p-0">
                            <SheetHeader className="p-4 border-b">
                                <SheetTitle className="flex items-center gap-2">
                                    <ShoppingCartIcon className="h-5 w-5" /> Votre Panier
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex-1 overflow-hidden p-4 flex flex-col">
                                <CartContentUI />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Modal de Paiement (Responsive) */}
            <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
                <DialogContent className="w-[95vw] max-w-md rounded-lg sm:rounded-lg">
                    <DialogHeader>
                        <DialogTitle>Paiement</DialogTitle>
                        <DialogDescription>
                            Total à payer : <span className="font-bold text-primary text-lg">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(panierTotal)}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {errors.client_id && <p className="text-sm text-destructive border-l-2 border-destructive pl-2 bg-destructive/10 p-2">{errors.client_id}</p>}

                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: 'espèces', icon: BanknoteIcon, label: 'Espèces' },
                                { id: 'mobile_money', icon: SmartphoneIcon, label: 'Mobile Money' },
                                { id: 'carte', icon: CreditCardIcon, label: 'Carte' },
                                { id: 'virement', icon: CalculatorIcon, label: 'Virement' },
                            ].map((mode) => (
                                <Button
                                    key={mode.id}
                                    variant={data.mode_paiement === mode.id ? 'default' : 'outline'}
                                    onClick={() => setData('mode_paiement', mode.id)}
                                    className={cn("flex flex-col h-20 gap-2 hover:bg-muted/50 transition-colors", data.mode_paiement === mode.id && "ring-2 ring-primary ring-offset-2")}
                                >
                                    <mode.icon className="h-6 w-6" />
                                    {mode.label}
                                </Button>
                            ))}
                        </div>

                        {data.mode_paiement === 'espèces' && (
                            <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Montant reçu</label>
                                    <Input
                                        type="number"
                                        inputMode="numeric"
                                        placeholder="0"
                                        value={data.montant_recu || ''}
                                        onChange={(e) => setData('montant_recu', e.target.value ? parseFloat(e.target.value) : null)}
                                        className="text-lg h-12"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {[1000, 2000, 5000, 10000].map(val => (
                                        <Badge
                                            key={val}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground px-3 py-1.5 h-auto text-sm transition-colors"
                                            onClick={() => setData('montant_recu', val)}
                                        >
                                            {val} F
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="font-medium">Monnaie à rendre :</span>
                                    <span className={cn("text-xl font-bold", montantRendu < 0 ? "text-destructive" : "text-green-600")}>
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(montantRendu)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" className="h-12" onClick={() => setPaymentModalOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            className="h-12 text-lg"
                            onClick={confirmPayment}
                            disabled={processing || (data.mode_paiement === 'espèces' && (data.montant_recu === null || parseFloat(String(data.montant_recu)) < panierTotal))}
                        >
                            {processing ? '...' : 'Valider'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}