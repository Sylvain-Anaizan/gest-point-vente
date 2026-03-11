import BoutiqueController from '@/actions/App/Http/Controllers/BoutiqueController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, SearchIcon, MapPinIcon, PhoneIcon, StoreIcon, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import Pagination from '@/components/ui/pagination-custom';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Boutiques',
        href: BoutiqueController.index.url(),
    },
];

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Boutique { id: number; nom: string; adresse: string | null; telephone: string | null; email: string | null; notes: string | null; active: boolean; created_at: string; updated_at: string; produits_count: number; }

export default function BoutiquesIndex({
    boutiques,
    filters
}: {
    boutiques: {
        data: Boutique[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    filters: { search?: string; };
}) {
    const { auth } = usePage().props as unknown as { auth: { user: { permissions: string[] } } };
    const canManage = auth.user.permissions.includes('manage boutiques');

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [boutiqueToDelete, setBoutiqueToDelete] = useState<Boutique | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = () => {
        router.get(BoutiqueController.index.url(), {
            search: searchTerm
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        router.get(BoutiqueController.index.url(), {}, { preserveState: true, replace: true });
    };

    const handleDeleteClick = (boutique: Boutique) => {
        setBoutiqueToDelete(boutique);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (boutiqueToDelete) {
            router.delete(
                BoutiqueController.destroy.url(boutiqueToDelete.id),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setDeleteDialogOpen(false);
                        setBoutiqueToDelete(null);
                    },
                },
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Boutiques" />

            <div className="space-y-8 p-4 md:p-8 max-w-[1600px] pb-32 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-xl font-black tracking-tight bg-gradient-to-br from-indigo-600 to-violet-700 bg-clip-text text-transparent">
                            Gestion des Boutiques
                        </h1>
                        <p className="text-muted-foreground font-medium max-w-2xl text-sm">
                            Supervisez votre réseau de vente et l'inventaire en temps réel.
                        </p>
                    </div>
                    {canManage && (
                        <Link href={BoutiqueController.create.url()}>
                            <Button className="h-12 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 border-0 font-black uppercase tracking-widest text-[10px] transition-all active:scale-95">
                                <PlusIcon className="size-4 mr-2" /> Nouvelle boutique
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-4 max-w-md">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-500/50" />
                        <Input
                            placeholder="Rechercher par nom..."
                            className="w-full h-11 pl-11 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    {searchTerm && <Button variant="ghost" onClick={clearFilters} className="text-xs uppercase font-black">Effacer</Button>}
                </div>

                {boutiques.data.length === 0 ? (
                    <Card className="shadow-none border-dashed bg-muted/5">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <StoreIcon className="size-16 text-zinc-300 mb-4 opacity-20" />
                            <p className="text-muted-foreground text-center font-bold uppercase tracking-widest text-xs">
                                {searchTerm ? `Aucune boutique pour "${searchTerm}"` : "Aucune boutique enregistrée."}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 whitespace-nowrap overflow-visible">
                            <AnimatePresence mode="popLayout">
                                {boutiques.data.map((boutique, index) => (
                                    <motion.div
                                        key={boutique.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="group relative h-full transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
                                            <CardHeader className="pb-4">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="size-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                        <StoreIcon className="size-5" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-indigo-500 text-white border-0 font-bold text-[9px] px-2 py-0.5">
                                                            {boutique.produits_count} {boutique.produits_count <= 1 ? 'PRODUIT' : 'PRODUITS'}
                                                        </Badge>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="icon" variant="ghost" className="size-8 rounded-lg">
                                                                    <MoreVertical className="size-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl">
                                                                <Link href={BoutiqueController.show.url(boutique.id)}>
                                                                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg cursor-pointer font-bold text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                                                                        <EyeIcon className="size-4 text-indigo-500" /> Inventaire
                                                                    </DropdownMenuItem>
                                                                </Link>
                                                                {canManage && (
                                                                    <>
                                                                        <Link href={BoutiqueController.edit.url(boutique.id)}>
                                                                            <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg cursor-pointer font-bold text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                                                                                <PencilIcon className="size-4 text-emerald-500" /> Modifier
                                                                            </DropdownMenuItem>
                                                                        </Link>
                                                                        <DropdownMenuItem
                                                                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer font-bold text-xs uppercase tracking-widest text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                                                                            onClick={() => handleDeleteClick(boutique)}
                                                                        >
                                                                            <TrashIcon className="size-4" /> Supprimer
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                                <CardTitle className="text-xl font-black text-indigo-950 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                    {boutique.nom}
                                                </CardTitle>
                                                <div className="space-y-1.5 mt-4">
                                                    {boutique.adresse && (
                                                        <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
                                                            <MapPinIcon className="size-3 mr-2 text-indigo-400 shrink-0" />
                                                            <span className="truncate">{boutique.adresse}</span>
                                                        </div>
                                                    )}
                                                    {boutique.telephone && (
                                                        <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
                                                            <PhoneIcon className="size-3 mr-2 text-indigo-400 shrink-0" />
                                                            {boutique.telephone}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                                                <Link href={BoutiqueController.show.url(boutique.id)} className="w-full">
                                                    <Button variant="secondary" className="w-full h-10 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-sm">
                                                        Voir détails
                                                    </Button>
                                                </Link>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* PAGINATION */}
                        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-center">
                            <Pagination
                                links={boutiques.links}
                                meta={{
                                    current_page: boutiques.current_page,
                                    from: (boutiques as any).from,
                                    last_page: boutiques.last_page,
                                    per_page: boutiques.per_page,
                                    to: (boutiques as any).to,
                                    total: boutiques.total
                                }}
                            />
                        </div>
                    </div>
                )}

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer la boutique</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer la boutique **"{boutiqueToDelete?.nom}"** ?
                                <br />
                                Les produits ne seront pas supprimés, mais ne seront plus liés à cette boutique.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>Supprimer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
