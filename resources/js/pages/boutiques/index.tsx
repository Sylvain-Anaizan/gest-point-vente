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
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Boutiques',
        href: BoutiqueController.index.url(),
    },
];

interface Boutique {
    id: number;
    nom: string;
    adresse: string | null;
    telephone: string | null;
    produits_count: number;
}

export default function BoutiquesIndex({
    boutiques,
}: {
    boutiques: Boutique[];
}) {
    const { auth } = usePage().props as unknown as { auth: { user: { permissions: string[] } } };
    const canManage = auth.user.permissions.includes('manage boutiques');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [boutiqueToDelete, setBoutiqueToDelete] = useState<Boutique | null>(
        null,
    );
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBoutiques = useMemo(() => {
        if (!searchTerm) return boutiques;

        const lowercasedSearch = searchTerm.toLowerCase();
        return boutiques.filter((b) =>
            b.nom.toLowerCase().includes(lowercasedSearch) ||
            (b.adresse && b.adresse.toLowerCase().includes(lowercasedSearch)) ||
            (b.telephone && b.telephone.toLowerCase().includes(lowercasedSearch))
        );
    }, [boutiques, searchTerm]);

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
                        <p className="text-muted-foreground font-medium max-w-2xl">
                            Supervisez l'intégralité de votre réseau de vente. Suivez les performances et l'inventaire en temps réel.
                        </p>
                    </div>
                    {canManage && (
                        <Link href={BoutiqueController.create.url()}>
                            <Button className="h-14 px-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 border-0 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95">
                                <PlusIcon className="size-5 mr-2 stroke-[3px]" />
                                Nouvelle boutique
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="relative group max-w-md">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl blur opacity-10 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-500/50" />
                        <Input
                            placeholder="Rechercher par nom, adresse..."
                            className="w-full h-12 pl-12 rounded-xl border-indigo-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm focus-visible:ring-indigo-500 shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredBoutiques.length === 0 ? (
                    <Card className="shadow-none border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground text-center text-lg">
                                {searchTerm
                                    ? `Aucun résultat pour "${searchTerm}".`
                                    : `Aucune boutique enregistrée.`}
                            </p>
                            {boutiques.length === 0 && !searchTerm && canManage && (
                                <Link
                                    href={BoutiqueController.create.url()}
                                    className="mt-4"
                                >
                                    <Button>
                                        <PlusIcon className="size-4 mr-2" />
                                        Créer votre première boutique
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        <AnimatePresence mode="popLayout">
                            {filteredBoutiques.map((boutique, index) => (
                                <motion.div
                                    key={boutique.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="group relative h-full transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                            <StoreIcon className="size-16 -mr-4 -mt-4 rotate-12" />
                                        </div>
                                        <CardHeader className="pb-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="size-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                    <StoreIcon className="size-6" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-indigo-500 text-white border-0 font-bold whitespace-nowrap">
                                                        {boutique.produits_count} {boutique.produits_count <= 1 ? 'PRODUIT' : 'PRODUITS'}
                                                    </Badge>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                            <Button size="icon" variant="ghost" className="size-8 rounded-lg text-indigo-950/40 dark:text-white/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                                                <MoreVertical className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-2xl">
                                                            <Link href={BoutiqueController.show.url(boutique.id)}>
                                                                <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                                                                    <EyeIcon className="size-4 text-indigo-500" />
                                                                    Inventaire
                                                                </DropdownMenuItem>
                                                            </Link>
                                                            {canManage && (
                                                                <>
                                                                    <Link href={BoutiqueController.edit.url(boutique.id)}>
                                                                        <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                                                                            <PencilIcon className="size-4 text-emerald-500" />
                                                                            Modifier
                                                                        </DropdownMenuItem>
                                                                    </Link>
                                                                    <DropdownMenuItem
                                                                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold text-xs uppercase tracking-widest text-rose-600 focus:bg-rose-50 focus:text-rose-600"
                                                                        onClick={() => handleDeleteClick(boutique)}
                                                                    >
                                                                        <TrashIcon className="size-4" />
                                                                        Supprimer
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                            <CardTitle className="text-2xl font-black text-indigo-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {boutique.nom}
                                            </CardTitle>
                                            <div className="space-y-2 mt-4">
                                                {boutique.adresse && (
                                                    <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
                                                        <div className="size-6 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mr-3">
                                                            <MapPinIcon className="size-3 text-slate-500 dark:text-slate-400" />
                                                        </div>
                                                        {boutique.adresse}
                                                    </div>
                                                )}
                                                {boutique.telephone && (
                                                    <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
                                                        <div className="size-6 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mr-3">
                                                            <PhoneIcon className="size-3 text-slate-500 dark:text-slate-400" />
                                                        </div>
                                                        {boutique.telephone}
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardFooter className="pt-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 transition-colors">
                                            <Link href={BoutiqueController.show.url(boutique.id)} className="w-full">
                                                <Button className="w-full bg-white dark:bg-zinc-900 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white dark:hover:text-white text-indigo-600 dark:text-indigo-400 border border-zinc-200 dark:border-zinc-800 font-bold shadow-sm rounded-xl transition-all">
                                                    <EyeIcon className="size-4 mr-2" />
                                                    Voir l'inventaire
                                                </Button>
                                            </Link>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                <Dialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer la boutique</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer la boutique
                                **"{boutiqueToDelete?.nom}"** ?
                                <br />
                                <span className="text-red-600 font-semibold mt-2 block">
                                    Les produits associés ne seront pas supprimés, mais ne seront plus liés à cette boutique.
                                </span>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setBoutiqueToDelete(null);
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                            >
                                <TrashIcon className="size-4 mr-2" />
                                Supprimer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
