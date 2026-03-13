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
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { AlertCircle, Package, Search } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import { updateSeuil } from '@/actions/App/Http/Controllers/InventaireController';

interface VarianteData {
    id: number;
    produit: string;
    categorie: string;
    taille: string;
    quantite: number;
    seuil_alerte: number;
    is_low_stock: boolean;
}

interface Props {
    variantes: VarianteData[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventaire',
        href: '/inventaire',
    },
];

export default function Index({ variantes }: Props) {
    const [search, setSearch] = useState('');
    const [selectedVariante, setSelectedVariante] = useState<VarianteData | null>(null);
    const [newSeuil, setNewSeuil] = useState<number>(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const filteredVariantes = variantes.filter((v) =>
        v.produit.toLowerCase().includes(search.toLowerCase()) ||
        v.categorie.toLowerCase().includes(search.toLowerCase()) ||
        v.taille.toLowerCase().includes(search.toLowerCase())
    );

    const handleUpdateSeuil = () => {
        if (!selectedVariante) return;

        router.patch(updateSeuil.url(selectedVariante.id), {
            seuil_alerte: newSeuil
        }, {
            onSuccess: () => {
                setIsDialogOpen(false);
                setSelectedVariante(null);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventaire" />

            <div className="flex h-full flex-col gap-4 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Gestion de l'Inventaire</h1>
                        <p className="text-muted-foreground">
                            Suivez vos niveaux de stock et gérez les seuils d'alerte.
                        </p>
                    </div>
                    
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Rechercher un produit..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-background to-accent/20 border-white/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium italic uppercase tracking-wider text-muted-foreground">Articles au total</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{variantes.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-500/5 border-red-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium italic uppercase tracking-wider text-red-500">Stock Critique</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{variantes.filter(v => v.is_low_stock).length}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="h-full border-white/5 bg-background/50 backdrop-blur-xl">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-white/5 bg-accent/50">
                                    <TableHead>Produit</TableHead>
                                    <TableHead>Catégorie</TableHead>
                                    <TableHead>Taille</TableHead>
                                    <TableHead className="text-right">Stock Actuel</TableHead>
                                    <TableHead className="text-right">Seuil d'alerte</TableHead>
                                    <TableHead className="text-center">Statut</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredVariantes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            Aucun produit trouvé.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredVariantes.map((v) => (
                                        <TableRow key={v.id} className="border-white/5 hover:bg-accent/30 transition-colors">
                                            <TableCell className="font-semibold">{v.produit}</TableCell>
                                            <TableCell>{v.categorie}</TableCell>
                                            <TableCell>{v.taille}</TableCell>
                                            <TableCell className="text-right font-mono">
                                                <span className={v.is_low_stock ? "text-red-500 font-bold" : ""}>
                                                    {v.quantite}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-muted-foreground">{v.seuil_alerte}</TableCell>
                                            <TableCell className="text-center">
                                                {v.is_low_stock ? (
                                                    <Badge variant="destructive" className="animate-pulse">Stock Faible</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">Optimal</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedVariante(v);
                                                        setNewSeuil(v.seuil_alerte);
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    Modifier Seuil
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="border-white/10 bg-background/95 backdrop-blur-2xl">
                        <DialogHeader>
                            <DialogTitle>Modifier le seuil d'alerte</DialogTitle>
                            <DialogDescription>
                                Définissez la quantité minimale pour laquelle vous souhaitez recevoir une alerte pour <strong>{selectedVariante?.produit} ({selectedVariante?.taille})</strong>.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="seuil">Quantité Seuil</Label>
                                <Input
                                    id="seuil"
                                    type="number"
                                    value={newSeuil}
                                    onChange={(e) => setNewSeuil(parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                            <Button onClick={handleUpdateSeuil}>Enregistrer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
