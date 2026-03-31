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
    image_url: string;
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
            className={`cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors text-slate-600 dark:text-slate-400 font-semibold ${className}`}
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
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
                )}
            </span>
        </TableHead>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventaire | Sylvain Anaizan" />

            <div className="flex h-full flex-col gap-6 p-4 font-sans min-h-screen">
                {/* Header Section */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Inventaire de Stock
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-base">
                            Visualisation et gestion complète de vos stocks.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                    >
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                            <Input
                                type="search"
                                placeholder="Rechercher un produit..."
                                className="pl-9 h-10 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-slate-400 dark:focus-visible:ring-slate-700 dark:text-white"
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
                            <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm dark:text-white">
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-md dark:text-white">
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
                            className="h-10 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 gap-2"
                            asChild
                        >
                            <a href={exportMethod.url()} download>
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline font-medium">Exporter</span>
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
                            iconBg: 'bg-blue-50',
                            iconColor: 'text-blue-600',
                        },
                        {
                            title: 'Points de Vigilance',
                            value: stats.alerte,
                            icon: AlertCircle,
                            iconBg: 'bg-red-50',
                            iconColor: 'text-red-600',
                            valueColor: 'text-red-600',
                            animate: stats.alerte > 0,
                        },
                        {
                            title: 'Valeur Estimée',
                            value: formatPrice(stats.valeur),
                            icon: ShoppingBag,
                            iconBg: 'bg-emerald-50',
                            iconColor: 'text-emerald-600',
                        },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                        >
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        {stat.title}
                                    </p>
                                    <div className={`p-2 rounded-lg ${stat.iconBg} dark:bg-slate-800`}>
                                        <stat.icon
                                            className={`h-5 w-5 ${stat.iconColor} ${stat.animate ? 'animate-pulse' : ''}`}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-5">
                                    <p className={`text-2xl font-bold ${stat.valueColor || 'text-slate-900 dark:text-white'}`}>
                                        {stat.value}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}

                    {/* Alertes Only Toggle Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-xl h-full flex flex-col justify-center">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Filtre rapide
                                </p>
                                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                                </div>
                            </CardHeader>
                            <CardContent className="pb-5">
                                <div className="flex items-center gap-3">
                                    <Switch
                                        id="alertes-only"
                                        checked={alertesOnly}
                                        onCheckedChange={(v) => {
                                            setAlertesOnly(v);
                                            setCurrentPage(1);
                                        }}
                                        className="data-[state=checked]:bg-amber-500"
                                    />
                                    <Label htmlFor="alertes-only" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                                        Alertes uniquement
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <span>
                        {processedVariantes.length} résultat{processedVariantes.length !== 1 ? 's' : ''}
                        {processedVariantes.length !== variantes.length && ` sur ${variantes.length}`}
                    </span>
                    {totalPages > 1 && (
                        <span>
                            Page {safeCurrentPage} sur {totalPages}
                        </span>
                    )}
                </div>

                {/* Desktop Table View */}
                <Card className="hidden lg:block bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                            <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-900/50 border-none">
                                <SortableHeader field="produit" className="w-[280px] py-4 pl-6">
                                    Produit
                                </SortableHeader>
                                <SortableHeader field="categorie">Catégorie</SortableHeader>
                                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Détails</TableHead>
                                <SortableHeader field="prix_vente" className="text-left">
                                    Prix
                                </SortableHeader>
                                <SortableHeader field="quantite">
                                    Stock
                                </SortableHeader>
                                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Statut</TableHead>
                                <TableHead className="text-right pr-6 text-slate-600 dark:text-slate-400 font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {paginatedVariantes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-48 text-center text-slate-500 dark:text-slate-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Search className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-1" />
                                                <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Aucun produit trouvé</p>
                                                <p className="text-sm">Modifiez vos filtres ou votre recherche.</p>
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
                                            className="group border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <TableCell className="py-3 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={v.image_url}
                                                        alt={v.produit}
                                                        className="h-10 w-10 rounded-md object-cover border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0"
                                                    />
                                                    <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {v.produit}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                                    <Tag className="h-3 w-3 text-slate-400 dark:text-slate-500" /> {v.categorie}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="inline-flex items-center">
                                                        <Layers className="h-3.5 w-3.5 mr-1.5 text-slate-400 dark:text-slate-500" /> {v.taille}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                                                {formatPrice(v.prix_vente)}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`text-lg font-bold tabular-nums ${v.en_alerte ? 'text-red-600' : 'text-emerald-600'}`}
                                                >
                                                    {v.quantite}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {v.en_alerte ? (
                                                    <Badge
                                                        variant="destructive"
                                                        className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 font-semibold shadow-none"
                                                    >
                                                        Alerte
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold shadow-none"
                                                    >
                                                        En stock
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
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
                                                        className="h-8 w-8 rounded-md text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                                                        title="Historique"
                                                        onClick={() => openMouvements(v)}
                                                    >
                                                        <History className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
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
                        <div className="flex items-center justify-center gap-1.5 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-md bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
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
                                            <span className="px-2 text-slate-400 dark:text-slate-600">…</span>
                                        )}
                                        <Button
                                            variant={p === safeCurrentPage ? 'default' : 'outline'}
                                            size="icon"
                                            className={`h-8 w-8 rounded-md text-sm font-medium ${p === safeCurrentPage ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}
                                            onClick={() => setCurrentPage(p)}
                                        >
                                            {p}
                                        </Button>
                                    </span>
                                ))}
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-md bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
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
                            <Card className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${v.en_alerte ? 'border-l-4 border-l-red-500' : ''}`}>
                                <CardHeader className="p-4 pb-2 border-b border-slate-50 dark:border-slate-800/50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={v.image_url}
                                                alt={v.produit}
                                                className="h-12 w-12 rounded-md object-cover border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0"
                                            />
                                            <div>
                                                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">{v.produit}</CardTitle>
                                                <CardDescription className="flex items-center gap-1.5 mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    <Tag className="h-3 w-3" /> {v.categorie}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                        <div className="space-y-1">
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                Variante
                                            </span>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                {v.taille} / {v.couleur}
                                            </p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                Prix
                                            </span>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                                                {formatPrice(v.prix_vente)}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                Stock
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <p className={`text-lg font-bold tabular-nums ${v.en_alerte ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {v.quantite}
                                                </p>
                                                {v.en_alerte && (
                                                    <Badge variant="destructive" className="h-5 px-1.5 text-[10px] bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 shadow-none">
                                                        Alerte
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-end gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
                                                onClick={() => {
                                                    setSelectedVariante(v);
                                                    setAdjustQuantite(1);
                                                    setAdjustType('entrée');
                                                    setAdjustCommentaire('');
                                                    setIsAdjustDialogOpen(true);
                                                }}
                                            >
                                                <Plus className="h-3.5 w-3.5 mr-1" />
                                                Stock
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
                                                onClick={() => openMouvements(v)}
                                            >
                                                <History className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
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
                        <div className="py-12 text-center text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p className="font-medium text-slate-600 dark:text-slate-400">Aucun résultat trouvé</p>
                        </div>
                    )}

                    {/* Mobile pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 py-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
                                disabled={safeCurrentPage <= 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Préc.
                            </Button>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                {safeCurrentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
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
                    <DialogContent className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl sm:rounded-2xl sm:max-w-[425px] p-0 overflow-hidden">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                                Configuration de Vigilance
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1">
                                Ajustez le seuil d'alerte pour le produit{' '}
                                <span className="font-semibold text-slate-900 dark:text-slate-200">{selectedVariante?.produit}</span>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-5 py-4 px-6">
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                <AlertCircle className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Quantité minimale
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Une alerte s'activera dès que le stock sera inférieur ou égal à ce chiffre.
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="seuil" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Valeur du seuil
                                </Label>
                                <Input
                                    id="seuil"
                                    type="number"
                                    autoFocus
                                    className="h-12 rounded-lg border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xl text-center focus-visible:ring-slate-400 dark:text-white"
                                    value={newSeuil}
                                    onChange={(e) => setNewSeuil(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0 p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                variant="outline"
                                className="rounded-lg h-10 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 w-full sm:w-auto"
                                onClick={() => setIsSeuilDialogOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                className="rounded-lg h-10 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 w-full sm:w-auto font-bold"
                                onClick={handleUpdateSeuil}
                            >
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* ── Dialog : Ajustement rapide de stock ── */}
                <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
                    <DialogContent className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl sm:rounded-2xl sm:max-w-[425px] p-0 overflow-hidden">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus className="h-5 w-5 text-blue-500" />
                                Ajustement manuel
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1">
                                Modifier le stock de{' '}
                                <span className="font-semibold text-slate-900 dark:text-slate-200">{selectedVariante?.produit}</span>
                                <span className="text-xs ml-2 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 shrink-0">
                                    Actuel : {selectedVariante?.quantite}
                                </span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-5 py-4 px-6">
                            <div className="grid gap-2">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Type de mouvement</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        type="button"
                                        variant={adjustType === 'entrée' ? 'default' : 'outline'}
                                        className={`h-11 rounded-lg gap-2 font-bold transition-all ${
                                            adjustType === 'entrée'
                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 dark:shadow-none border-transparent'
                                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-slate-950'
                                        }`}
                                        onClick={() => setAdjustType('entrée')}
                                    >
                                        <Plus className="h-4 w-4" /> Entrée
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={adjustType === 'sortie' ? 'destructive' : 'outline'}
                                        className={`h-11 rounded-lg gap-2 font-bold transition-all ${
                                            adjustType === 'sortie'
                                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 dark:shadow-none border-transparent'
                                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-slate-950'
                                        }`}
                                        onClick={() => setAdjustType('sortie')}
                                    >
                                        <Minus className="h-4 w-4" /> Sortie
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="adjust-qty" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Quantité
                                </Label>
                                <Input
                                    id="adjust-qty"
                                    type="number"
                                    min={1}
                                    className="h-12 rounded-lg border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xl text-center focus-visible:ring-slate-400 dark:text-white"
                                    value={adjustQuantite}
                                    onChange={(e) => setAdjustQuantite(Math.max(1, parseInt(e.target.value) || 1))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="adjust-comment" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Commentaire <span className="text-slate-400 dark:text-slate-500 font-normal">(optionnel)</span>
                                </Label>
                                <Input
                                    id="adjust-comment"
                                    className="h-10 rounded-lg border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                                    placeholder="Raison de l'ajustement..."
                                    value={adjustCommentaire}
                                    onChange={(e) => setAdjustCommentaire(e.target.value)}
                                />
                            </div>
                            {adjustType === 'sortie' &&
                                selectedVariante &&
                                adjustQuantite > selectedVariante.quantite && (
                                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-xl border border-red-100 dark:border-red-900/50">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        La quantité dépasse le stock disponible ({selectedVariante.quantite})
                                    </p>
                                )}
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0 p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                variant="outline"
                                className="rounded-lg h-10 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 w-full sm:w-auto"
                                onClick={() => setIsAdjustDialogOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                className="rounded-lg h-10 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 w-full sm:w-auto font-bold"
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
                    <DialogContent className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl sm:rounded-2xl sm:max-w-[500px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="shrink-0 p-6 pb-2">
                            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                Historique des mouvements
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1">
                                Dernières opérations pour{' '}
                                <span className="font-semibold text-slate-900 dark:text-slate-200">{selectedVariante?.produit}</span>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2 px-6 overflow-y-auto min-h-[150px] last:pb-6">
                            {mouvementsLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-600 gap-2">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span className="text-sm">Chargement...</span>
                                </div>
                            ) : mouvementsList.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 dark:text-slate-600">
                                    <History className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p className="font-medium text-slate-600 dark:text-slate-400">Aucun mouvement enregistré</p>
                                </div>
                            ) : (
                                <div className="space-y-3 pb-4">
                                    {mouvementsList.map((m) => (
                                        <div
                                            key={m.id}
                                            className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 shadow-sm"
                                        >
                                            <div
                                                className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${m.quantite > 0
                                                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                                                    : 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400'
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
                                                    <span className="font-bold text-slate-900 dark:text-white text-base">
                                                        {m.quantite > 0 ? '+' : ''}
                                                        {m.quantite}
                                                    </span>
                                                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                                        {m.type}
                                                    </Badge>
                                                </div>
                                                {m.commentaire && (
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                                                        {m.commentaire}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                                                    <span className="truncate">{m.user}</span>
                                                    <span className="opacity-50">•</span>
                                                    <span className="whitespace-nowrap">{m.date}</span>
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