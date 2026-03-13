import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState, useMemo, useCallback } from 'react';
import {
    AlertCircle,
    ArrowDown,
    ArrowRight,
    ArrowUp,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    History,
    Layers,
    Loader2,
    Minus,
    Package,
    Plus,
    Search,
    Settings2,
    ShoppingBag,
    Tag,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import {
    updateSeuil,
    adjustStock,
    mouvements as mouvementsAction,
    exportMethod,
} from '@/actions/App/Http/Controllers/InventaireController';
import { motion, AnimatePresence } from 'framer-motion';

interface VarianteData {
    id: number;
    produit: string;
    categorie: string;
    taille: string;
    couleur: string;
    quantite: number;
    seuil_alerte: number;
    prix_vente: number | string;
    en_alerte: boolean;
    tendance: number;
}

interface MouvementData {
    id: number;
    quantite: number;
    type: string;
    commentaire: string | null;
    user: string;
    date: string;
}

interface Props {
    variantes: VarianteData[];
    categories: string[];
}

type SortField = 'produit' | 'categorie' | 'prix_vente' | 'quantite' | 'tendance';
type SortDirection = 'asc' | 'desc';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventaire',
        href: '/inventaire',
    },
];

const ITEMS_PER_PAGE = 20;

export default function Index({ variantes, categories }: Props) {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [alertesOnly, setAlertesOnly] = useState(false);
    const [sortField, setSortField] = useState<SortField>('produit');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [currentPage, setCurrentPage] = useState(1);

    // Seuil dialog
    const [selectedVariante, setSelectedVariante] = useState<VarianteData | null>(null);
    const [newSeuil, setNewSeuil] = useState<number>(0);
    const [isSeuilDialogOpen, setIsSeuilDialogOpen] = useState(false);

    // Adjust stock dialog
    const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
    const [adjustQuantite, setAdjustQuantite] = useState<number>(1);
    const [adjustType, setAdjustType] = useState<'entrée' | 'sortie'>('entrée');
    const [adjustCommentaire, setAdjustCommentaire] = useState('');
    const [adjustProcessing, setAdjustProcessing] = useState(false);

    // Mouvements dialog
    const [isMouvementsDialogOpen, setIsMouvementsDialogOpen] = useState(false);
    const [mouvementsList, setMouvementsList] = useState<MouvementData[]>([]);
    const [mouvementsLoading, setMouvementsLoading] = useState(false);

    // Filtering + sorting + pagination pipeline
    const processedVariantes = useMemo(() => {
        const result = variantes.filter((v) => {
            const matchesSearch =
                v.produit.toLowerCase().includes(search.toLowerCase()) ||
                v.categorie.toLowerCase().includes(search.toLowerCase()) ||
                v.taille.toLowerCase().includes(search.toLowerCase()) ||
                v.couleur.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || v.categorie === categoryFilter;
            const matchesAlerte = !alertesOnly || v.en_alerte;
            return matchesSearch && matchesCategory && matchesAlerte;
        });

        result.sort((a, b) => {
            let cmp = 0;
            if (sortField === 'produit' || sortField === 'categorie') {
                cmp = a[sortField].localeCompare(b[sortField], 'fr');
            } else {
                cmp = Number(a[sortField]) - Number(b[sortField]);
            }
            return sortDirection === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [variantes, search, categoryFilter, alertesOnly, sortField, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(processedVariantes.length / ITEMS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedVariantes = processedVariantes.slice(
        (safeCurrentPage - 1) * ITEMS_PER_PAGE,
        safeCurrentPage * ITEMS_PER_PAGE,
    );

    const stats = useMemo(
        () => ({
            total: variantes.length,
            alerte: variantes.filter((v) => v.en_alerte).length,
            valeur: variantes.reduce((acc, v) => acc + Number(v.prix_vente) * v.quantite, 0),
        }),
        [variantes],
    );

    const handleSort = useCallback(
        (field: SortField) => {
            if (sortField === field) {
                setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
            } else {
                setSortField(field);
                setSortDirection('asc');
            }
            setCurrentPage(1);
        },
        [sortField],
    );

    const handleUpdateSeuil = () => {
        if (!selectedVariante) return;
        router.patch(
            updateSeuil.url(selectedVariante.id),
            { seuil_alerte: newSeuil },
            {
                onSuccess: () => {
                    setIsSeuilDialogOpen(false);
                    setSelectedVariante(null);
                },
            },
        );
    };

    const handleAdjustStock = () => {
        if (!selectedVariante) return;
        setAdjustProcessing(true);
        router.post(
            adjustStock.url(selectedVariante.id),
            {
                quantite: adjustQuantite,
                type: adjustType,
                commentaire: adjustCommentaire || undefined,
            },
            {
                onSuccess: () => {
                    setIsAdjustDialogOpen(false);
                    setSelectedVariante(null);
                    setAdjustQuantite(1);
                    setAdjustCommentaire('');
                    setAdjustProcessing(false);
                },
                onError: () => setAdjustProcessing(false),
            },
        );
    };

    const openMouvements = async (v: VarianteData) => {
        setSelectedVariante(v);
        setMouvementsLoading(true);
        setIsMouvementsDialogOpen(true);
        try {
            const response = await fetch(mouvementsAction.url(v.id));
            const data = await response.json();
            setMouvementsList(data);
        } catch {
            setMouvementsList([]);
        } finally {
            setMouvementsLoading(false);
        }
    };

    const formatPrice = (price: number | string) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(Number(price));
    };

    const TendanceIcon = ({ tendance }: { tendance: number }) => {
        if (tendance > 0)
            return (
                <span className="inline-flex items-center gap-0.5 text-emerald-500" title={`+${tendance} sur 7 jours`}>
                    <TrendingUp className="h-4 w-4" />
                </span>
            );
        if (tendance < 0)
            return (
                <span className="inline-flex items-center gap-0.5 text-red-500" title={`${tendance} sur 7 jours`}>
                    <TrendingDown className="h-4 w-4" />
                </span>
            );
        return (
            <span className="inline-flex items-center text-muted-foreground/40" title="Aucun mouvement sur 7 jours">
                <ArrowRight className="h-4 w-4" />
            </span>
        );
    };

    const SortableHeader = ({
        field,
        children,
        className = '',
    }: {
        field: SortField;
        children: React.ReactNode;
        className?: string;
    }) => (
        <TableHead
            className={`cursor-pointer select-none hover:text-foreground transition-colors ${className}`}
            onClick={() => handleSort(field)}
        >
            <span className="inline-flex items-center gap-1.5">
                {children}
                {sortField === field ? (
                    sortDirection === 'asc' ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                    ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                    )
                ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />
                )}
            </span>
        </TableHead>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventaire | Sylvain Anaizan" />

            <div className="flex h-full flex-col gap-6 p-4 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Inventaire de Stock
                        </h1>
                        <p className="text-muted-foreground mt-1 text-lg">
                            Visualisation et gestion complète de vos stocks.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                    >
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Rechercher..."
                                className="pl-9 h-10 rounded-xl border-white/5 bg-background/50 backdrop-blur-md"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <Select
                            value={categoryFilter}
                            onValueChange={(v) => {
                                setCategoryFilter(v);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl border-white/5 bg-background/50 backdrop-blur-md">
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les catégories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-10 rounded-xl border-white/5 bg-background/50 gap-2"
                            asChild
                        >
                            <a href={exportMethod.url()} download>
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Export CSV</span>
                            </a>
                        </Button>
                    </motion.div>
                </div>

                {/* Stats + Alert Filter Row */}
                <div className="grid gap-4 md:gap-6 md:grid-cols-4">
                    {[
                        {
                            title: 'Articles Uniques',
                            value: stats.total,
                            icon: Package,
                            gradient: 'from-blue-500/10 to-indigo-500/10',
                            border: 'border-blue-500/20',
                        },
                        {
                            title: 'Points de Vigilance',
                            value: stats.alerte,
                            icon: AlertCircle,
                            color: 'text-red-500',
                            gradient: 'from-red-500/10 to-orange-500/10',
                            border: 'border-red-500/20',
                            animate: stats.alerte > 0,
                        },
                        {
                            title: 'Valeur Estimée',
                            value: formatPrice(stats.valeur),
                            icon: ShoppingBag,
                            gradient: 'from-emerald-500/10 to-teal-500/10',
                            border: 'border-emerald-500/20',
                        },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <Card
                                className={`overflow-hidden border-none bg-gradient-to-br ${stat.gradient} backdrop-blur-sm relative group`}
                            >
                                <div
                                    className={`absolute inset-0 border-2 rounded-xl transition-opacity opacity-0 group-hover:opacity-100 ${stat.border}`}
                                />
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
                                        {stat.title}
                                    </p>
                                    <stat.icon
                                        className={`h-5 w-5 ${stat.color || 'text-muted-foreground'} ${stat.animate ? 'animate-pulse' : ''}`}
                                    />
                                </CardHeader>
                                <CardContent>
                                    <p className={`text-3xl font-bold tracking-tight ${stat.color || ''}`}>
                                        {stat.value}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}

                    {/* Alertes Only Toggle Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Card className="overflow-hidden border-none bg-gradient-to-br from-amber-500/10 to-yellow-500/10 backdrop-blur-sm relative group h-full flex flex-col justify-center">
                            <div className="absolute inset-0 border-2 rounded-xl transition-opacity opacity-0 group-hover:opacity-100 border-amber-500/20" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
                                    Filtre rapide
                                </p>
                                <AlertCircle className="h-5 w-5 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <Switch
                                        id="alertes-only"
                                        checked={alertesOnly}
                                        onCheckedChange={(v) => {
                                            setAlertesOnly(v);
                                            setCurrentPage(1);
                                        }}
                                    />
                                    <Label htmlFor="alertes-only" className="text-sm font-semibold cursor-pointer">
                                        Alertes uniquement
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        {processedVariantes.length} résultat{processedVariantes.length !== 1 ? 's' : ''}
                        {processedVariantes.length !== variantes.length && ` sur ${variantes.length}`}
                    </span>
                    {totalPages > 1 && (
                        <span>
                            Page {safeCurrentPage} / {totalPages}
                        </span>
                    )}
                </div>

                {/* Desktop Table View */}
                <Card className="hidden lg:block overflow-hidden border-white/5 bg-background/40 backdrop-blur-xl rounded-3xl">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-white/5 bg-muted/30">
                                <SortableHeader field="produit" className="w-[260px] py-5 pl-8">
                                    Produit
                                </SortableHeader>
                                <SortableHeader field="categorie">Catégorie</SortableHeader>
                                <TableHead>Détails</TableHead>
                                <SortableHeader field="prix_vente" className="text-left">
                                    Prix
                                </SortableHeader>
                                <SortableHeader field="quantite">
                                    Stock
                                </SortableHeader>
                                <SortableHeader field="tendance">
                                    Tendance
                                </SortableHeader>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {paginatedVariantes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-50">
                                                <Search className="h-10 w-10 mb-2" />
                                                <p className="text-xl font-medium">Aucun résultat</p>
                                                <p className="text-sm">
                                                    Essayez un autre filtre ou mot-clé.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedVariantes.map((v) => (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={v.id}
                                            className="group border-white/5 hover:bg-accent/30 transition-all duration-300"
                                        >
                                            <TableCell className="py-4 pl-8">
                                                <span className="font-bold text-base group-hover:text-primary transition-colors">
                                                    {v.produit}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                                    <Tag className="h-3 w-3" /> {v.categorie}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="rounded-full bg-background/50 border-white/5 font-medium px-3"
                                                    >
                                                        <Layers className="h-3 w-3 mr-1.5" /> {v.taille}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className=" font-mono text-base font-semibold tabular-nums">
                                                {formatPrice(v.prix_vente)}
                                            </TableCell>
                                            <TableCell >
                                                <span
                                                    className={`text-xl font-mono font-bold ${v.en_alerte ? 'text-red-500' : 'text-emerald-500'}`}
                                                >
                                                    {v.quantite}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <TendanceIcon tendance={v.tendance} />
                                            </TableCell>
                                            <TableCell>
                                                {v.en_alerte ? (
                                                    <Badge
                                                        variant="destructive"
                                                        className="rounded-full px-3 py-0.5 animate-pulse shadow-lg shadow-red-500/20"
                                                    >
                                                        Alerte
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="secondary"
                                                        className="rounded-full px-3 py-0.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                    >
                                                        OK
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                                                        title="Ajuster le stock"
                                                        onClick={() => {
                                                            setSelectedVariante(v);
                                                            setAdjustQuantite(1);
                                                            setAdjustType('entrée');
                                                            setAdjustCommentaire('');
                                                            setIsAdjustDialogOpen(true);
                                                        }}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full hover:bg-blue-500/10 hover:text-blue-500"
                                                        title="Historique"
                                                        onClick={() => openMouvements(v)}
                                                    >
                                                        <History className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full hover:bg-amber-500/10 hover:text-amber-500"
                                                        title="Configurer le seuil"
                                                        onClick={() => {
                                                            setSelectedVariante(v);
                                                            setNewSeuil(v.seuil_alerte);
                                                            setIsSeuilDialogOpen(true);
                                                        }}
                                                    >
                                                        <Settings2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 py-4 border-t border-white/5">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full"
                                disabled={safeCurrentPage <= 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(
                                    (p) =>
                                        p === 1 ||
                                        p === totalPages ||
                                        Math.abs(p - safeCurrentPage) <= 2,
                                )
                                .map((p, idx, arr) => (
                                    <span key={p} className="flex items-center">
                                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                                            <span className="px-1 text-muted-foreground">…</span>
                                        )}
                                        <Button
                                            variant={p === safeCurrentPage ? 'default' : 'ghost'}
                                            size="icon"
                                            className={`h-9 w-9 rounded-full font-mono text-sm ${p === safeCurrentPage ? 'shadow-lg shadow-primary/20' : ''}`}
                                            onClick={() => setCurrentPage(p)}
                                        >
                                            {p}
                                        </Button>
                                    </span>
                                ))}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full"
                                disabled={safeCurrentPage >= totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Mobile Grid View */}
                <div className="grid gap-4 lg:hidden">
                    {paginatedVariantes.map((v, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={v.id}
                        >
                            <Card
                                className={`overflow-hidden border-white/10 bg-background/50 backdrop-blur-md relative ${v.en_alerte ? 'border-l-4 border-l-red-500' : ''}`}
                            >
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg font-bold">{v.produit}</CardTitle>
                                            <CardDescription className="flex items-center gap-1.5 mt-0.5 uppercase text-[10px] tracking-widest font-semibold">
                                                <Tag className="h-3 w-3" /> {v.categorie}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <TendanceIcon tendance={v.tendance} />
                                            <Badge
                                                variant={v.en_alerte ? 'destructive' : 'secondary'}
                                                className="rounded-full text-[10px]"
                                            >
                                                {v.en_alerte ? 'Alerte' : 'OK'}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase text-muted-foreground tracking-wider">
                                                Variante
                                            </span>
                                            <p className="text-sm font-medium">
                                                {v.taille} / {v.couleur}
                                            </p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <span className="text-[10px] uppercase text-muted-foreground tracking-wider">
                                                Prix
                                            </span>
                                            <p className="text-sm font-bold font-mono">
                                                {formatPrice(v.prix_vente)}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase text-muted-foreground tracking-wider">
                                                Stock Actuel
                                            </span>
                                            <p
                                                className={`text-xl font-bold font-mono ${v.en_alerte ? 'text-red-500' : 'text-emerald-500'}`}
                                            >
                                                {v.quantite}
                                            </p>
                                        </div>
                                        <div className="flex items-end justify-end gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 rounded-full border-white/10 bg-background/50"
                                                onClick={() => {
                                                    setSelectedVariante(v);
                                                    setAdjustQuantite(1);
                                                    setAdjustType('entrée');
                                                    setAdjustCommentaire('');
                                                    setIsAdjustDialogOpen(true);
                                                }}
                                            >
                                                <Plus className="h-3. w-3.5 mr-1" />
                                                Stock
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-full border-white/10 bg-background/50"
                                                onClick={() => openMouvements(v)}
                                            >
                                                <History className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-full border-white/10 bg-background/50"
                                                onClick={() => {
                                                    setSelectedVariante(v);
                                                    setNewSeuil(v.seuil_alerte);
                                                    setIsSeuilDialogOpen(true);
                                                }}
                                            >
                                                <Settings2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                    {paginatedVariantes.length === 0 && (
                        <div className="py-20 text-center opacity-40">
                            <Package className="h-12 w-12 mx-auto mb-3" />
                            <p className="font-medium">Aucun résultat trouvé</p>
                        </div>
                    )}

                    {/* Mobile pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                disabled={safeCurrentPage <= 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Préc.
                            </Button>
                            <span className="text-sm font-mono text-muted-foreground">
                                {safeCurrentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                disabled={safeCurrentPage >= totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            >
                                Suiv. <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* ── Dialog : Seuil d'alerte ── */}
                <Dialog open={isSeuilDialogOpen} onOpenChange={setIsSeuilDialogOpen}>
                    <DialogContent className="border-white/10 bg-background/80 backdrop-blur-3xl rounded-[2rem] sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                Configuration de Vigilance
                            </DialogTitle>
                            <DialogDescription className="text-md mt-2">
                                Ajustez le seuil de bascule pour{' '}
                                <span className="font-bold text-foreground">{selectedVariante?.produit}</span>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-white/5">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground uppercase tracking-wider text-[10px] font-bold">
                                        Quantité minimale souhaitée
                                    </p>
                                    <p className="text-xs text-muted-foreground max-w-[200px]">
                                        Une alerte s'activera dès que le stock sera inférieur ou égal à ce chiffre.
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-3 px-1">
                                <Label htmlFor="seuil" className="text-sm font-semibold pl-1">
                                    Valeur du seuil
                                </Label>
                                <Input
                                    id="seuil"
                                    type="number"
                                    autoFocus
                                    className="h-14 rounded-2xl border-white/10 bg-background/50 text-2xl font-mono text-center focus-visible:ring-primary/20"
                                    value={newSeuil}
                                    onChange={(e) => setNewSeuil(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-3 sm:gap-0">
                            <Button
                                variant="ghost"
                                className="rounded-2xl h-12 flex-1 font-semibold"
                                onClick={() => setIsSeuilDialogOpen(false)}
                            >
                                Ignorer
                            </Button>
                            <Button
                                className="rounded-2xl h-12 flex-1 font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95"
                                onClick={handleUpdateSeuil}
                            >
                                Confirmer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* ── Dialog : Ajustement rapide de stock ── */}
                <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
                    <DialogContent className="border-white/10 bg-background/80 backdrop-blur-3xl rounded-[2rem] sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                Ajustement de Stock
                            </DialogTitle>
                            <DialogDescription className="text-md mt-2">
                                Modifier le stock de{' '}
                                <span className="font-bold text-foreground">{selectedVariante?.produit}</span>
                                <span className="text-xs ml-2 text-muted-foreground">
                                    (actuel : {selectedVariante?.quantite})
                                </span>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-5 py-4">
                            <div className="grid gap-3">
                                <Label className="text-sm font-semibold pl-1">Type de mouvement</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        type="button"
                                        variant={adjustType === 'entrée' ? 'default' : 'outline'}
                                        className="h-12 rounded-2xl gap-2 font-semibold"
                                        onClick={() => setAdjustType('entrée')}
                                    >
                                        <Plus className="h-4 w-4" /> Entrée
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={adjustType === 'sortie' ? 'destructive' : 'outline'}
                                        className="h-12 rounded-2xl gap-2 font-semibold"
                                        onClick={() => setAdjustType('sortie')}
                                    >
                                        <Minus className="h-4 w-4" /> Sortie
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="adjust-qty" className="text-sm font-semibold pl-1">
                                    Quantité
                                </Label>
                                <Input
                                    id="adjust-qty"
                                    type="number"
                                    min={1}
                                    className="h-14 rounded-2xl border-white/10 bg-background/50 text-2xl font-mono text-center"
                                    value={adjustQuantite}
                                    onChange={(e) => setAdjustQuantite(Math.max(1, parseInt(e.target.value) || 1))}
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="adjust-comment" className="text-sm font-semibold pl-1">
                                    Commentaire <span className="text-muted-foreground font-normal">(optionnel)</span>
                                </Label>
                                <Input
                                    id="adjust-comment"
                                    className="h-11 rounded-xl border-white/10 bg-background/50"
                                    placeholder="Raison de l'ajustement..."
                                    value={adjustCommentaire}
                                    onChange={(e) => setAdjustCommentaire(e.target.value)}
                                />
                            </div>
                            {adjustType === 'sortie' &&
                                selectedVariante &&
                                adjustQuantite > selectedVariante.quantite && (
                                    <p className="text-sm text-red-500 flex items-center gap-2 px-1">
                                        <AlertCircle className="h-4 w-4" />
                                        Quantité supérieure au stock disponible ({selectedVariante.quantite})
                                    </p>
                                )}
                        </div>
                        <DialogFooter className="gap-3 sm:gap-0">
                            <Button
                                variant="ghost"
                                className="rounded-2xl h-12 flex-1 font-semibold"
                                onClick={() => setIsAdjustDialogOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                className="rounded-2xl h-12 flex-1 font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95"
                                onClick={handleAdjustStock}
                                disabled={
                                    adjustProcessing ||
                                    (adjustType === 'sortie' &&
                                        !!selectedVariante &&
                                        adjustQuantite > selectedVariante.quantite)
                                }
                            >
                                {adjustProcessing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Traitement...
                                    </>
                                ) : (
                                    'Confirmer'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* ── Dialog : Historique des mouvements ── */}
                <Dialog open={isMouvementsDialogOpen} onOpenChange={setIsMouvementsDialogOpen}>
                    <DialogContent className="border-white/10 bg-background/80 backdrop-blur-3xl rounded-[2rem] sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-3">
                                <Clock className="h-6 w-6 text-blue-500" />
                                Historique des mouvements
                            </DialogTitle>
                            <DialogDescription className="text-md mt-2">
                                Derniers mouvements pour{' '}
                                <span className="font-bold text-foreground">{selectedVariante?.produit}</span>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            {mouvementsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : mouvementsList.length === 0 ? (
                                <div className="text-center py-12 opacity-50">
                                    <History className="h-10 w-10 mx-auto mb-3" />
                                    <p className="font-medium">Aucun mouvement enregistré</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {mouvementsList.map((m) => (
                                        <div
                                            key={m.id}
                                            className="flex items-start gap-4 p-3 rounded-xl bg-muted/20 border border-white/5"
                                        >
                                            <div
                                                className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${m.quantite > 0
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'bg-red-500/10 text-red-500'
                                                    }`}
                                            >
                                                {m.quantite > 0 ? (
                                                    <ArrowUp className="h-4 w-4" />
                                                ) : (
                                                    <ArrowDown className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold font-mono text-lg">
                                                        {m.quantite > 0 ? '+' : ''}
                                                        {m.quantite}
                                                    </span>
                                                    <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                                                        {m.type}
                                                    </Badge>
                                                </div>
                                                {m.commentaire && (
                                                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                                                        {m.commentaire}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                    <span>{m.user}</span>
                                                    <span>•</span>
                                                    <span>{m.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
