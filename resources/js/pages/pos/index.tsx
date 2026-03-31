import POSController from '@/actions/App/Http/Controllers/POSController';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    SearchIcon,
    ShoppingCartIcon,
    TrashIcon,
    PlusIcon,
    MinusIcon,
    CreditCardIcon,
    BanknoteIcon,
    SmartphoneIcon,
    CalculatorIcon,
    StoreIcon,
    UserPlus,
    X,
    Loader2,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
interface Variante {
    id: number;
    taille: string;
    prix_vente: number;
    quantite: number;
}

interface Produit {
    id: number;
    nom: string;
    imageUrl: string;
    category?: string;
    sous_categorie?: string | null;
    sous_categorie_id?: number | null;
    boutique_id: number | null;
    variantes: Variante[];
}

interface SousCategorie {
    id: number;
    nom: string;
    categorie_id: number;
    categorie?: { id: number; nom: string };
}

interface Client {
    id: number;
    nom: string;
    email: string | null;
    telephone: string;
    boutique_id: number | null;
}

interface PanierItem {
    id: number; // Produit ID (pour UI)
    variante_id: number; // Variante ID (réel)
    nom: string;
    taille: string;
    prix_vente: number;
    panierQuantite: number;
    stockDisponible: number;
}
interface Boutique { id: number; nom: string; }

// ─────────────────────────────────────────────
// Modal : Création rapide de client (POS)
// ─────────────────────────────────────────────
interface QuickClientModalProps {
    boutiqueId: string;
    boutiques: Boutique[];
    userRole: string;
    onClose: () => void;
    onCreated: (client: Client) => void;
}

function QuickClientModal({ boutiqueId, boutiques, userRole, onClose, onCreated }: QuickClientModalProps) {
    const [nom, setNom] = useState('');
    const [telephone, setTelephone] = useState('');
    const [email, setEmail] = useState('');
    const [adresse, setAdresse] = useState('');
    const [selectedBoutique, setSelectedBoutique] = useState(boutiqueId && boutiqueId !== 'all' ? boutiqueId : (boutiques.length === 1 ? boutiques[0].id.toString() : ''));
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        if (!nom.trim()) { setErrors({ nom: 'Le nom est requis' }); return; }
        setLoading(true);

        try {
            const xsrfToken = decodeURIComponent(
                document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] ?? ''
            );
            const body: Record<string, string> = { nom: nom.trim() };
            if (telephone) body.telephone = telephone.trim();
            if (email) body.email = email.trim();
            if (adresse) body.adresse = adresse.trim();
            if (selectedBoutique) body.boutique_id = selectedBoutique;

            const response = await fetch('/clients/creation-rapide', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': xsrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const mapped: Record<string, string> = {};
                    Object.entries(data.errors as Record<string, string[]>).forEach(([k, v]) => { mapped[k] = v[0]; });
                    setErrors(mapped);
                } else {
                    setErrors({ nom: data.message ?? 'Erreur lors de la création' });
                }
                return;
            }

            onCreated(data as Client);
            toast.success(`Client "${data.nom}" créé`);
        } catch {
            setErrors({ nom: 'Erreur réseau' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-xl shadow-2xl w-full max-w-md border">
                <div className="flex items-center justify-between p-5 border-b">
                    <div className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        <h2 className="font-semibold text-lg">Nouveau client</h2>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="qc-nom">Nom <span className="text-destructive">*</span></Label>
                        <Input
                            id="qc-nom"
                            value={nom}
                            onChange={e => setNom(e.target.value)}
                            placeholder="Nom du client"
                            className={errors.nom ? 'border-destructive' : ''}
                            autoFocus
                        />
                        {errors.nom && <p className="text-xs text-destructive">{errors.nom}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="qc-tel">Téléphone</Label>
                        <Input
                            id="qc-tel"
                            value={telephone}
                            onChange={e => setTelephone(e.target.value)}
                            placeholder="Ex : 06 12 34 56 78"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="qc-email">Email</Label>
                        <Input
                            id="qc-email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="client@exemple.com"
                            className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                    {userRole === 'admin' ? (
                        <div className="space-y-1.5">
                            <Label htmlFor="qc-boutique">Boutique <span className="text-destructive">*</span></Label>
                            <Select value={selectedBoutique} onValueChange={setSelectedBoutique}>
                                <SelectTrigger id="qc-boutique" className={!selectedBoutique ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Sélectionner une boutique" />
                                </SelectTrigger>
                                <SelectContent>
                                    {boutiques.map(b => (
                                        <SelectItem key={b.id} value={b.id.toString()}>{b.nom}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : boutiques.length === 1 ? (
                        <div className="space-y-1.5">
                            <Label>Boutique</Label>
                            <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/40 text-sm">
                                <StoreIcon className="h-4 w-4 text-muted-foreground" />
                                <span>{boutiques[0].nom}</span>
                            </div>
                        </div>
                    ) : null}
                    <div className="space-y-1.5">
                        <Label htmlFor="qc-adresse">Adresse</Label>
                        <Input
                            id="qc-adresse"
                            value={adresse}
                            onChange={e => setAdresse(e.target.value)}
                            placeholder="Adresse du client"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                            Annuler
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                            Créer le client
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function POSIndex({ produits, clients, boutiques, sousCategories }: { produits: Produit[]; clients: Client[]; boutiques: Boutique[]; sousCategories: SousCategorie[] }) {
    const { auth } = usePage().props as unknown as { auth: { user: { role: string; permissions: string[] } } };
    const userRole = auth.user.role;
    const canManage = auth.user.permissions.includes('manage sales');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSousCategorie, setSelectedSousCategorie] = useState<string>('all');
    const [selectedBoutiqueId, setSelectedBoutiqueId] = useState<string>(
        userRole !== 'admin' && boutiques.length === 1 ? boutiques[0].id.toString() : 'all'
    );
    const [panier, setPanier] = useState<PanierItem[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>('anonymous');
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [variantModalOpen, setVariantModalOpen] = useState(false);
    const [selectedProduitForVariant, setSelectedProduitForVariant] = useState<Produit | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [openCombobox, setOpenCombobox] = useState(false);
    const [showQuickClientModal, setShowQuickClientModal] = useState(false);
    const [clientsList, setClientsList] = useState<Client[]>(clients);

    const { data, setData, post, processing, reset, errors } = useForm({
        client_id: null as number | null,
        panier: [] as { id: number; variante_id: number; quantite: number; prix_vente: number }[],
        mode_paiement: 'espèces',
        montant_recu: null as number | null,
        boutique_id: (userRole !== 'admin' && boutiques.length === 1) ? boutiques[0].id : null as number | null,
    });

    const handleBoutiqueChange = async (value: string) => {
        setSelectedBoutiqueId(value);
        setPanier([]);
        setSelectedClient('anonymous');
        setData('client_id', null);
        const boutiqueId = value === 'all' ? null : parseInt(value);
        setData('boutique_id', boutiqueId);

        // Charger les clients de la boutique sélectionnée
        try {
            const url = boutiqueId
                ? `/clients/par-boutique?boutique_id=${boutiqueId}`
                : `/clients/par-boutique`;
            const response = await fetch(url, {
                headers: { 'Accept': 'application/json' },
            });
            if (response.ok) {
                const data = await response.json();
                setClientsList(data);
            }
        } catch {
            // Fallback : keep current list
        }
    };

    // --- Clients filtrés par boutique ---
    const filteredClients = useMemo(() => {
        return clientsList;
    }, [clientsList]);

    // --- Sous-catégories filtrées par catégorie sélectionnée ---
    const filteredSousCategories = useMemo(() => {
        if (selectedCategory === 'all') return sousCategories;
        return sousCategories.filter(sc => sc.categorie?.nom === selectedCategory);
    }, [sousCategories, selectedCategory]);

    // --- Calculs ---
    const categories = useMemo(() => {
        const cats = new Set(produits.map(p => p.category || 'Autre'));
        return ['all', ...Array.from(cats)];
    }, [produits]);

    const filteredProducts = useMemo(() => {
        return produits.filter(p => {
            const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || (p.category || 'Autre') === selectedCategory;
            const matchesSousCategorie = selectedSousCategorie === 'all' || p.sous_categorie_id?.toString() === selectedSousCategorie;
            const matchesBoutique = selectedBoutiqueId === 'all'
                ? p.boutique_id === null
                : p.boutique_id?.toString() === selectedBoutiqueId;
            return matchesSearch && matchesCategory && matchesSousCategorie && matchesBoutique;
        });
    }, [produits, searchTerm, selectedCategory, selectedSousCategorie, selectedBoutiqueId]);

    const panierTotal = useMemo(() => {
        return panier.reduce((total, item) => total + (item.prix_vente * item.panierQuantite), 0);
    }, [panier]);

    const montantRendu = useMemo(() => {
        const recu = parseFloat(data.montant_recu ? String(data.montant_recu) : '0');
        if (isNaN(recu)) return 0;
        return Math.max(0, recu - panierTotal);
    }, [data.montant_recu, panierTotal]);

    // --- Actions ---
    const handleAddClick = (produit: Produit) => {
        if (produit.variantes.length === 1) {
            addToCart(produit, produit.variantes[0]);
        } else {
            setSelectedProduitForVariant(produit);
            setVariantModalOpen(true);
        }
    };

    const addToCart = (produit: Produit, variante: Variante) => {
        setPanier(prev => {
            const existing = prev.find(item => item.variante_id === variante.id);
            if (existing) {
                if (existing.panierQuantite >= variante.quantite) {
                    toast.error(`Stock insuffisant pour la taille ${variante.taille}`);
                    return prev;
                }
                return prev.map(item =>
                    item.variante_id === variante.id
                        ? { ...item, panierQuantite: item.panierQuantite + 1 }
                        : item
                );
            }
            return [...prev, {
                id: produit.id,
                variante_id: variante.id,
                nom: produit.nom,
                taille: variante.taille,
                prix_vente: variante.prix_vente,
                panierQuantite: 1,
                stockDisponible: variante.quantite,
            }];
        });
        toast.success(`${produit.nom} (${variante.taille}) ajouté`, { duration: 1000, position: 'bottom-center' });
        setVariantModalOpen(false);
    };

    const removeFromCart = (varianteId: number) => {
        setPanier(prev => prev.filter(item => item.variante_id !== varianteId));
    };

    const updateQuantity = (varianteId: number, delta: number) => {
        setPanier(prev => {
            return prev.map(item => {
                if (item.variante_id === varianteId) {
                    const newQty = item.panierQuantite + delta;
                    if (newQty < 1) return item;
                    if (newQty > item.stockDisponible) return item;
                    return { ...item, panierQuantite: newQty };
                }
                return item;
            });
        });
    };

    const updatePrice = (varianteId: number, newPrice: number) => {
        if (isNaN(newPrice) || newPrice < 0) return;
        setPanier(prev => prev.map(item =>
            item.variante_id === varianteId
                ? { ...item, prix_vente: newPrice }
                : item
        ));
    };

    const handleCheckout = () => {
        setPaymentModalOpen(true);
        setIsCartOpen(false);
        setData(d => ({
            ...d,
            client_id: selectedClient === 'anonymous' ? null : parseInt(selectedClient),
            panier: panier.map(item => ({
                id: item.id,
                variante_id: item.variante_id,
                quantite: item.panierQuantite,
                prix_vente: item.prix_vente,
            })),
        }));
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


    return (
        <AppLayout
            breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Point de Vente (POS)', href: '#' }]}
            showBottomNav={false}
        >
            <Head title="Point de Vente" />

            {/* Container principal avec hauteur dynamique pour mobile */}
            <div className="h-[calc(100dvh-4rem)] lg:h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4 lg:gap-6 relative p-6">

                {/* 1. Zone Gauche : Catalogue (Prend toute la largeur sur mobile) */}
                <div className="flex-1 flex flex-col gap-4 min-w-0 h-full pb-20 lg:pb-0">
                    {/* Filtres */}
                    <Card className="shrink-0 border-0 shadow-none lg:border-border/50 lg:shadow-md bg-transparent lg:bg-card/80 lg:backdrop-blur-md lg:rounded-md transition-all">
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
                            {userRole === 'admin' && (
                                <Select value={selectedBoutiqueId} onValueChange={handleBoutiqueChange}>
                                    <SelectTrigger className="w-full sm:w-[200px] h-11 lg:h-10 bg-background shadow-sm lg:shadow-none">
                                        <StoreIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                                        <SelectValue placeholder="Boutique" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Stock Général</SelectItem>
                                        {boutiques.map(b => (
                                            <SelectItem key={b.id} value={b.id.toString()}>{b.nom}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setSelectedSousCategorie('all'); }}>
                                <SelectTrigger className="w-full sm:w-[180px] h-11 lg:h-10 bg-background shadow-sm lg:shadow-none">
                                    <SelectValue placeholder="Catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Catégories</SelectItem>
                                    {categories.filter(c => c !== 'all').map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {filteredSousCategories.length > 0 && (
                                <Select value={selectedSousCategorie} onValueChange={setSelectedSousCategorie}>
                                    <SelectTrigger className="w-full sm:w-[180px] h-11 lg:h-10 bg-background shadow-sm lg:shadow-none">
                                        <SelectValue placeholder="Sous-catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Sous-catégories </SelectItem>
                                        {filteredSousCategories.map(sc => (
                                            <SelectItem key={sc.id} value={sc.id.toString()}>{sc.nom}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                        </CardContent>
                    </Card>

                    {/* Grille Produits */}
                    <ScrollArea className="flex-1 rounded-md border-0 lg:border bg-transparent lg:bg-card p-0 lg:p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-4 pb-4">

                            {filteredProducts.map((produit) => {
                                const totalStock = produit.variantes.reduce((acc, v) => acc + v.quantite, 0);
                                const isOutOfStock = totalStock <= 0;
                                const minPrice = Math.min(...produit.variantes.map(v => v.prix_vente));

                                return (
                                    <button
                                        key={produit.id}
                                        onClick={() => handleAddClick(produit)}
                                        disabled={isOutOfStock}
                                        className={cn(
                                            "group relative flex flex-col items-start text-left rounded-lg border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden",
                                            isOutOfStock ? "opacity-60 grayscale cursor-not-allowed" : "hover:border-primary/50 hover:ring-1 hover:ring-primary/20"
                                        )}
                                    >
                                        <div className="w-full aspect-square bg-muted relative overflow-hidden">
                                            <img
                                                src={produit.imageUrl}
                                                alt={produit.nom}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                    <PlusIcon className="h-8 w-8" />
                                                </div>
                                            </div>

                                            {totalStock <= 5 && totalStock > 0 && (
                                                <Badge variant="destructive" className="absolute top-2 right-2 shadow-md">
                                                    -{totalStock}
                                                </Badge>
                                            )}
                                            {isOutOfStock && (
                                                <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                                                    <Badge variant="secondary" className="text-sm px-3 py-1 font-semibold border-2">Épuisé</Badge>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-full p-4 space-y-2 bg-gradient-to-b from-card to-muted/10 z-10 border-t border-border/10">
                                            <h3 className="font-semibold leading-tight line-clamp-2 text-sm h-10 text-foreground/90 group-hover:text-primary transition-colors">
                                                {produit.nom}
                                            </h3>
                                            <div className="flex items-center justify-between w-full pt-1 border-t border-border/50">
                                                <span className="font-bold text-primary text-lg">
                                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(minPrice)}
                                                </span>
                                                {produit.category && (
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium bg-muted px-1.5 py-0.5 rounded">
                                                        {produit.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                            {filteredProducts.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center h-40 text-muted-foreground">
                                    <SearchIcon className="h-10 w-10 mb-2 opacity-20" />
                                    <p>Aucun produit trouvé</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* 2. Zone Droite : Panier (DESKTOP SEULEMENT) */}
                <Card className="hidden lg:flex w-[380px] xl:w-[420px] flex-col h-full shrink-0 shadow-md bg-gradient-to-b from-card to-muted/10 rounded-none lg:rounded-md z-10">
                    <CardHeader className="pb-3 border-b backdrop-blur-md">
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
                        <div className="flex flex-col h-full">
                            <div className="pb-4">
                                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openCombobox}
                                            className="w-full justify-between bg-background font-normal h-11 lg:h-10 px-3 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <div className={cn("size-2 rounded-full", selectedClient === 'anonymous' ? "bg-zinc-300" : "bg-indigo-500")} />
                                                {selectedClient === 'anonymous'
                                                    ? "Client Anonyme"
                                                    : filteredClients.find((client) => client.id.toString() === selectedClient)?.nom || "Sélectionner un client..."}
                                            </div>
                                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0 shadow-2xl border-indigo-500/20" align="start" sideOffset={8}>
                                        <Command className="rounded-lg">
                                            <CommandInput placeholder="Rechercher par nom ou mobile..." className="h-12" />
                                            <CommandList className="max-h-[300px] overflow-y-auto pointer-events-auto">
                                                <CommandEmpty className="py-6 text-center text-sm">
                                                    <div className="flex flex-col items-center gap-2 opacity-40">
                                                        <SearchIcon className="size-8" />
                                                        <span>Aucun client trouvé</span>
                                                    </div>
                                                </CommandEmpty>
                                                <CommandGroup heading="Sélection" className="px-2">
                                                    <CommandItem
                                                        value="anonymous"
                                                        onSelect={() => {
                                                            setSelectedClient('anonymous');
                                                            setData('client_id', null);
                                                            setOpenCombobox(false);
                                                        }}
                                                        onPointerDown={(e) => e.stopPropagation()}
                                                        className="rounded-md cursor-pointer pointer-events-auto"
                                                    >
                                                        <CheckIcon
                                                            className={cn(
                                                                "mr-2 h-4 w-4 text-indigo-600",
                                                                selectedClient === 'anonymous' ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <span className="font-bold">Client Anonyme</span>
                                                    </CommandItem>
                                                    {filteredClients.map((client) => (
                                                        <CommandItem
                                                            key={client.id}
                                                            value={`${client.nom} ${client.telephone || ''} ${client.id}`}
                                                            onSelect={() => {
                                                                const idStr = client.id.toString();
                                                                setSelectedClient(idStr);
                                                                setData('client_id', client.id);
                                                                setOpenCombobox(false);
                                                            }}
                                                            onPointerDown={(e) => e.stopPropagation()}
                                                            className="rounded-md py-3 cursor-pointer pointer-events-auto"
                                                        >
                                                            <CheckIcon
                                                                className={cn(
                                                                    "mr-2 h-4 w-4 text-indigo-600",
                                                                    selectedClient === client.id.toString() ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="font-bold truncate">{client.nom}</span>
                                                                {client.telephone && (
                                                                    <span className="text-[10px] font-black text-indigo-500/60 uppercase tracking-tighter">{client.telephone}</span>
                                                                )}
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 w-full gap-1.5"
                                    onClick={() => setShowQuickClientModal(true)}
                                >
                                    <UserPlus className="h-4 w-4" /> Nouveau client
                                </Button>
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
                                            <div key={item.variante_id} className="flex gap-3 items-center p-3 rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium truncate">{item.nom}</h4>
                                                    <p className="text-[10px] text-muted-foreground font-semibold uppercase">Taille: {item.taille}</p>
                                                    <div className="flex items-center justify-between mt-1 gap-2">
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <span>{item.panierQuantite} x</span>
                                                            <input
                                                                type="number"
                                                                value={item.prix_vente}
                                                                onChange={(e) => updatePrice(item.variante_id, parseFloat(e.target.value) || 0)}
                                                                className="w-16 h-6 text-xs text-center font-medium bg-muted/50 border border-border/50 rounded px-1 focus:outline-none focus:ring-1 focus:ring-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                min={0}
                                                                step={100}
                                                            />
                                                            <span className="text-[9px]">F</span>
                                                        </div>
                                                        <p className="text-sm font-semibold">
                                                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(item.prix_vente * item.panierQuantite)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 items-center">
                                                    <div className="flex items-center border border-border/50 rounded-lg bg-muted/30 shadow-inner overflow-hidden">
                                                        <button onClick={() => updateQuantity(item.variante_id, -1)} className="p-1.5 hover:bg-muted active:bg-muted/80">
                                                            <MinusIcon className="h-3 w-3" />
                                                        </button>
                                                        <span className="w-6 text-center text-xs font-medium">{item.panierQuantite}</span>
                                                        <button onClick={() => updateQuantity(item.variante_id, 1)} className="p-1.5 hover:bg-muted active:bg-muted/80" disabled={item.panierQuantite >= item.stockDisponible}>
                                                            <PlusIcon className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.variante_id)} className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors">
                                                        < TrashIcon className="h-4 w-4" />
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
                                    <div className="flex items-center justify-between font-black text-xl">
                                        <span>Total</span>
                                        <span className="text-primary bg-primary/10 px-3 py-1 rounded-lg">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(panierTotal)}</span>
                                    </div>
                                </div>

                                {canManage ? (
                                    <Button
                                        className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary rounded-xl"
                                        disabled={panier.length === 0 || processing}
                                        onClick={handleCheckout}
                                    >
                                        {processing ? '...' : 'Encaisser'}
                                    </Button>
                                ) : (
                                    <div className="bg-muted p-4 rounded-xl text-center text-sm text-muted-foreground border border-dashed">
                                        Action non autorisée
                                    </div>
                                )}
                            </div>
                        </div>
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
                                <div className="flex flex-col h-full">
                                    <div className="pb-4">
                                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openCombobox}
                                                    className="w-full justify-between bg-zinc-50 dark:bg-zinc-900 font-normal h-12 rounded-xl border-zinc-200 dark:border-zinc-800 shadow-sm"
                                                >
                                                    <div className="flex items-center gap-2 truncate">
                                                        <div className={cn("size-2 rounded-full shadow-sm", selectedClient === 'anonymous' ? "bg-zinc-300" : "bg-indigo-500")} />
                                                        {selectedClient === 'anonymous'
                                                            ? "Client Anonyme"
                                                            : filteredClients.find((client) => client.id.toString() === selectedClient)?.nom || "Sélectionner un client..."}
                                                    </div>
                                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[calc(100vw-3rem)] p-0 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-indigo-500/20 rounded-2xl overflow-hidden" align="center" sideOffset={12}>
                                                <Command className="rounded-none">
                                                    <CommandInput placeholder="Nom ou téléphone..." className="h-14 bg-background/50" />
                                                    <CommandList className="max-h-[40vh] overflow-y-auto pointer-events-auto">
                                                        <CommandEmpty className="py-10 text-center">
                                                            <div className="flex flex-col items-center gap-3 opacity-30">
                                                                <SearchIcon className="size-10" />
                                                                <span className="text-sm font-bold uppercase tracking-widest">Inconnu</span>
                                                            </div>
                                                        </CommandEmpty>
                                                        <CommandGroup heading="Sélection Client" className="px-2 pt-2 pb-4">
                                                            <CommandItem
                                                                value="anonymous"
                                                                onSelect={() => {
                                                                    setSelectedClient('anonymous');
                                                                    setData('client_id', null);
                                                                    setOpenCombobox(false);
                                                                }}
                                                                onPointerDown={(e) => e.stopPropagation()}
                                                                className="rounded-xl py-4 aria-selected:bg-indigo-500/10 cursor-pointer pointer-events-auto"
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-5 w-5 text-indigo-500",
                                                                        selectedClient === 'anonymous' ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <span className="font-black uppercase tracking-tight text-sm">Client Anonyme</span>
                                                            </CommandItem>
                                                            {filteredClients.map((client) => (
                                                                <CommandItem
                                                                    key={client.id}
                                                                    value={`${client.nom} ${client.telephone || ''} ${client.id}`}
                                                                    onSelect={() => {
                                                                        setSelectedClient(client.id.toString());
                                                                        setData('client_id', client.id);
                                                                        setOpenCombobox(false);
                                                                    }}
                                                                    onPointerDown={(e) => e.stopPropagation()}
                                                                    className="rounded-xl py-5 aria-selected:bg-indigo-500/10 border-b border-zinc-100 dark:border-zinc-800 last:border-0 cursor-pointer pointer-events-auto"
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-5 w-5 text-indigo-500",
                                                                            selectedClient === client.id.toString() ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex flex-col min-w-0">
                                                                        <span className="font-black uppercase tracking-tight text-sm truncate">{client.nom}</span>
                                                                        {client.telephone && (
                                                                            <span className="text-[10px] font-bold text-indigo-500/70 tracking-[0.1em] mt-0.5 italic">{client.telephone}</span>
                                                                        )}
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="mt-2 w-full gap-1.5"
                                            onClick={() => setShowQuickClientModal(true)}
                                        >
                                            <UserPlus className="h-4 w-4" /> Nouveau client
                                        </Button>
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
                                                    <div key={item.variante_id} className="flex gap-3 items-center p-3 rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-medium truncate">{item.nom}</h4>
                                                            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Taille: {item.taille}</p>
                                                            <div className="flex items-center justify-between mt-1 gap-2">
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <span>{item.panierQuantite} x</span>
                                                                    <input
                                                                        type="number"
                                                                        value={item.prix_vente}
                                                                        onChange={(e) => updatePrice(item.variante_id, parseFloat(e.target.value) || 0)}
                                                                        className="w-16 h-6 text-xs text-center font-medium bg-muted/50 border border-border/50 rounded px-1 focus:outline-none focus:ring-1 focus:ring-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                        min={0}
                                                                        step={100}
                                                                    />
                                                                    <span className="text-[9px]">F</span>
                                                                </div>
                                                                <p className="text-sm font-semibold">
                                                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(item.prix_vente * item.panierQuantite)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2 items-center">
                                                            <div className="flex items-center border border-border/50 rounded-lg bg-muted/30 shadow-inner overflow-hidden">
                                                                <button onClick={() => updateQuantity(item.variante_id, -1)} className="p-1.5 hover:bg-muted active:bg-muted/80">
                                                                    <MinusIcon className="h-3 w-3" />
                                                                </button>
                                                                <span className="w-6 text-center text-xs font-medium">{item.panierQuantite}</span>
                                                                <button onClick={() => updateQuantity(item.variante_id, 1)} className="p-1.5 hover:bg-muted active:bg-muted/80" disabled={item.panierQuantite >= item.stockDisponible}>
                                                                    <PlusIcon className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                            <button onClick={() => removeFromCart(item.variante_id)} className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors">
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
                                            <div className="flex items-center justify-between font-black text-xl">
                                                <span>Total</span>
                                                <span className="text-primary bg-primary/10 px-3 py-1 rounded-lg">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(panierTotal)}</span>
                                            </div>
                                        </div>

                                        {canManage ? (
                                            <Button
                                                className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary rounded-xl"
                                                disabled={panier.length === 0 || processing}
                                                onClick={handleCheckout}
                                            >
                                                {processing ? '...' : 'Encaisser'}
                                            </Button>
                                        ) : (
                                            <div className="bg-muted p-4 rounded-xl text-center text-sm text-muted-foreground border border-dashed">
                                                Action non autorisée
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div >

            {/* Modal de Paiement (Responsive) */}
            < Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen} >
                <DialogContent className="w-[95vw] max-w-md rounded-lg sm:rounded-lg">
                    <DialogHeader>
                        <DialogTitle>Paiement</DialogTitle>
                        <DialogDescription>
                            Total à payer : <span className="font-bold text-primary text-lg">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(panierTotal)}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {errors.client_id && <p className="text-sm text-destructive border-l-2 border-destructive pl-2 bg-destructive/10 p-2">{errors.client_id}</p>}
                    {errors.boutique_id && <p className="text-sm text-destructive border-l-2 border-destructive pl-2 bg-destructive/10 p-2">{errors.boutique_id}</p>}

                    <div className="grid gap-4 py-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Boutique / Point de Vente</label>
                            <div className="flex items-center gap-2 h-11 px-3 rounded-md border bg-muted/40 text-sm">
                                <StoreIcon className="h-4 w-4 text-muted-foreground" />
                                <span>
                                    {data.boutique_id
                                        ? boutiques.find(b => b.id === data.boutique_id)?.nom ?? 'Inconnue'
                                        : 'Stock Général'}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Sélectionnez la boutique dans les filtres du catalogue</p>
                        </div>

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
                                    className={cn("flex flex-col h-20 gap-2 transition-colors", data.mode_paiement === mode.id && "ring-2 ring-primary ring-offset-2")}
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
            </Dialog >
            {/* Modal de Sélection de Variante (Taille) */}
            < Dialog open={variantModalOpen} onOpenChange={setVariantModalOpen} >
                <DialogContent className="w-[95vw] max-w-sm rounded-xl">
                    <DialogHeader>
                        <DialogTitle>Choisir une taille</DialogTitle>
                        <DialogDescription>
                            {selectedProduitForVariant?.nom}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-2 py-4">
                        {selectedProduitForVariant?.variantes.map((variante) => (
                            <Button
                                key={variante.id}
                                variant="outline"
                                className="h-16 flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-all text-sm px-4"
                                disabled={variante.quantite <= 0}
                                onClick={() => addToCart(selectedProduitForVariant!, variante)}
                            >
                                <span className="font-bold text-lg uppercase">{variante.taille}</span>
                                <div className="flex gap-3 text-xs text-muted-foreground">
                                    <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(variante.prix_vente)}</span>
                                    <span className={cn(variante.quantite <= 3 ? "text-destructive font-bold" : "")}>Stock: {variante.quantite}</span>
                                </div>
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog >

            {/* Modal Création rapide client */}
            {showQuickClientModal && (
                <QuickClientModal
                    boutiqueId={selectedBoutiqueId}
                    boutiques={boutiques}
                    userRole={userRole}
                    onClose={() => setShowQuickClientModal(false)}
                    onCreated={(newClient) => {
                        setClientsList(prev => [newClient, ...prev]);
                        setSelectedClient(newClient.id.toString());
                        setData('client_id', newClient.id);
                        setShowQuickClientModal(false);
                    }}
                />
            )}
        </AppLayout>
    );
}