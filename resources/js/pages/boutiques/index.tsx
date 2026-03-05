import BoutiqueController from '@/actions/App/Http/Controllers/BoutiqueController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, SearchIcon, MapPinIcon, PhoneIcon, StoreIcon } from 'lucide-react';
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
                    <Link href={BoutiqueController.create.url()}>
                        <Button className="h-14 px-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 border-0 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95">
                            <PlusIcon className="size-5 mr-2 stroke-[3px]" />
                            Nouvelle boutique
                        </Button>
                    </Link>
                </div>

                <div className="relative group max-w-md">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl blur opacity-10 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-500/50" />
                        <Input
                            placeholder="Rechercher par nom, adresse..."
                            className="w-full h-12 pl-12 rounded-xl border-indigo-100 bg-white/50 backdrop-blur-sm focus-visible:ring-indigo-500 shadow-sm"
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
                            {boutiques.length === 0 && !searchTerm && (
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
                                    <Card className="group relative h-full transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 border-indigo-100/50 overflow-hidden bg-white/70 backdrop-blur-sm">
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <StoreIcon className="size-16 -mr-4 -mt-4 rotate-12" />
                                        </div>
                                        <CardHeader className="pb-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="size-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                    <StoreIcon className="size-6" />
                                                </div>
                                                <Badge className="bg-indigo-500 text-white border-0 font-bold">
                                                    {boutique.produits_count} {boutique.produits_count <= 1 ? 'PRODUIT' : 'PRODUITS'}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-2xl font-black text-indigo-950 group-hover:text-indigo-600 transition-colors">
                                                {boutique.nom}
                                            </CardTitle>
                                            <div className="space-y-2 mt-4">
                                                {boutique.adresse && (
                                                    <div className="flex items-center text-sm font-medium text-slate-600">
                                                        <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                                                            <MapPinIcon className="size-3 text-slate-500" />
                                                        </div>
                                                        {boutique.adresse}
                                                    </div>
                                                )}
                                                {boutique.telephone && (
                                                    <div className="flex items-center text-sm font-medium text-slate-600">
                                                        <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                                                            <PhoneIcon className="size-3 text-slate-500" />
                                                        </div>
                                                        {boutique.telephone}
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardFooter className="flex gap-2 pt-6 border-t border-indigo-50/50 bg-indigo-50/20 group-hover:bg-indigo-50/40 transition-colors">
                                            <Link href={BoutiqueController.show.url(boutique.id)} className="flex-1">
                                                <Button className="w-full bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-100 font-bold shadow-sm">
                                                    <EyeIcon className="size-4 mr-2" />
                                                    Inventaire
                                                </Button>
                                            </Link>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                                                <Link href={BoutiqueController.edit.url(boutique.id)}>
                                                    <Button variant="outline" size="icon" className="rounded-lg hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200">
                                                        <PencilIcon className="size-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                                                    onClick={() => handleDeleteClick(boutique)}
                                                >
                                                    <TrashIcon className="size-4" />
                                                </Button>
                                            </div>
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
