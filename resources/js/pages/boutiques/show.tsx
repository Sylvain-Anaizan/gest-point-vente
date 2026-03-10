import BoutiqueController from '@/actions/App/Http/Controllers/BoutiqueController';
import ProduitController from '@/actions/App/Http/Controllers/ProduitController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, MapPinIcon, PhoneIcon, PackageIcon, EyeIcon, SearchIcon, TrendingUpIcon, AlertCircleIcon, BoxIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';

interface Produit {
    id: number;
    nom: string;
    prix_vente: number;
    quantite: number;
    category: string;
    imageUrl: string;
}

interface Boutique {
    id: number;
    nom: string;
    adresse: string | null;
    telephone: string | null;
    produits: Produit[];
}

export default function BoutiquesShow({ boutique }: { boutique: Boutique }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProduits = useMemo(() => {
        if (!searchTerm) return boutique.produits;
        const lowSearch = searchTerm.toLowerCase();
        return boutique.produits.filter(p => p.nom.toLowerCase().includes(lowSearch) || p.category.toLowerCase().includes(lowSearch));
    }, [boutique.produits, searchTerm]);

    const totalStock = useMemo(() => boutique.produits.reduce((acc, p) => acc + p.quantite, 0), [boutique.produits]);
    const lowStockCount = useMemo(() => boutique.produits.filter(p => p.quantite < 10).length, [boutique.produits]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Boutiques',
            href: BoutiqueController.index.url(),
        },
        {
            title: boutique.nom,
            href: BoutiqueController.show.url(boutique.id),
        },
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Inventaire : ${boutique.nom}`} />

            <div className="space-y-8 p-4 md:p-8 max-w-[1600px] pb-32">
                <div className="flex flex-col md:flex-row items-center gap-6 bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-indigo-50 dark:border-zinc-800">
                    <Link href={BoutiqueController.index.url()}>
                        <Button variant="secondary" size="icon" className="size-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 shrink-0">
                            <ArrowLeftIcon className="size-6" />
                        </Button>
                    </Link>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl font-black tracking-tight text-indigo-950 dark:text-white">
                            {boutique.nom}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-3 font-medium">
                            {boutique.adresse && (
                                <div className="flex items-center text-slate-500 dark:text-slate-400">
                                    <MapPinIcon className="size-4 mr-2 text-indigo-500" />
                                    {boutique.adresse}
                                </div>
                            )}
                            {boutique.telephone && (
                                <div className="flex items-center text-slate-500 dark:text-slate-400">
                                    <PhoneIcon className="size-4 mr-2 text-indigo-500" />
                                    {boutique.telephone}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link href={BoutiqueController.edit.url(boutique.id)}>
                            <Button className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold">
                                Paramètres Boutique
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">Catégories de produits</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-4xl font-black">{boutique.produits.length}</div>
                                    <BoxIcon className="size-8 opacity-40" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Articles en Stock</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-4xl font-black text-indigo-950 dark:text-white">{totalStock}</div>
                                    <TrendingUpIcon className="size-8 text-indigo-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className={`border-0 shadow-sm ${lowStockCount > 0 ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20' : 'bg-white dark:bg-zinc-900'}`}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Alertes Stock Faible</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className={`text-4xl font-black ${lowStockCount > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-indigo-950 dark:text-white'}`}>{lowStockCount}</div>
                                    <AlertCircleIcon className={`size-8 ${lowStockCount > 0 ? 'text-amber-500' : 'text-slate-200 dark:text-slate-700'}`} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className="grid gap-6">
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <CardHeader className="bg-indigo-50/30 pb-6 border-b border-indigo-50/50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-2xl font-black text-indigo-950 dark:text-white flex items-center gap-2">
                                        <PackageIcon className="size-6 text-indigo-500" />
                                        Inventaire Détaillé
                                    </CardTitle>
                                    <CardDescription className="font-medium text-slate-500 dark:text-slate-400">
                                        Explorez et filtrez les produits enregistrés dans ce point de vente.
                                    </CardDescription>
                                </div>
                                <div className="relative w-full md:w-80">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-400" />
                                    <Input
                                        placeholder="Filtrer par nom ou catégorie..."
                                        className="pl-10 h-10 bg-white dark:bg-zinc-950 border-indigo-100 dark:border-zinc-800 rounded-xl"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredProduits.length === 0 ? (
                                <div className="text-center py-24">
                                    <div className="size-20 rounded-full bg-slate-50 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200 dark:border-zinc-800">
                                        <PackageIcon className="size-10 text-slate-300 dark:text-zinc-700" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold">Aucun produit ne correspond à votre recherche.</p>
                                    <Button variant="ghost" onClick={() => setSearchTerm('')} className="mt-2 text-indigo-600 dark:text-indigo-400">Réinitialiser les filtres</Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50/50 dark:bg-zinc-900/50 text-left">
                                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 text-center w-20">Réf.</th>
                                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Produit</th>
                                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Catégorie</th>
                                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 text-right">Prix de vente</th>
                                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 text-center">Quantité</th>
                                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                            {filteredProduits.map((produit) => (
                                                <tr key={produit.id} className="group hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                                                    <td className="px-6 py-4 text-center font-mono text-xs text-slate-400 dark:text-zinc-600">
                                                        #{produit.id}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-12 rounded-xl bg-slate-100 dark:bg-zinc-800 overflow-hidden ring-1 ring-slate-200 dark:ring-zinc-700 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-800 transition-all">
                                                                <img
                                                                    src={produit.imageUrl}
                                                                    alt={produit.nom}
                                                                    className="object-cover h-full w-full"
                                                                />
                                                            </div>
                                                            <span className="font-bold text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{produit.nom}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className="bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-zinc-800">
                                                            {produit.category}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">
                                                        {formatPrice(produit.prix_vente)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center">
                                                            <div className={`px-4 py-1.5 rounded-full font-black text-xs ${produit.quantite < 10
                                                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-900/50 animate-pulse"
                                                                : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-900/50"
                                                                }`}>
                                                                {produit.quantite} EN STOCK
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Link href={ProduitController.show.url(produit.id)}>
                                                            <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-900/40 font-bold transition-all">
                                                                <EyeIcon className="size-4 mr-2" /> DÉTAILS
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
