import { Head, Link, router } from '@inertiajs/react';
import MarketplaceLayout from '@/layouts/marketplace-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Catalog({ products, categories, filters }: { products: any, categories: any[], filters: any }) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');

    // Simple debounce implementation if hook doesn't exist
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== filters.search) {
                router.get('/catalog', { search, category: category === 'all' ? undefined : category }, { preserveState: true, replace: true });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleCategoryChange = (value: string) => {
        setCategory(value);
        router.get('/catalog', { search, category: value === 'all' ? undefined : value }, { preserveState: true, replace: true });
    };

    return (
        <MarketplaceLayout>
            <Head title="Catalogue" />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <h1 className="text-3xl font-bold">Catalogue</h1>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={category} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.slug || cat.nom}>{cat.nom}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.data.map((product: any) => (
                        <Link key={product.id} href={`/product/${product.id}`} className="group">
                            <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                                <div className="aspect-square bg-muted relative overflow-hidden">
                                    <img
                                        src={product.imageUrl || 'https://placehold.co/400'}
                                        alt={product.nom}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    {product.quantite <= 0 && (
                                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                            <Badge variant="secondary">Épuisé</Badge>
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold line-clamp-1">{product.nom}</h3>
                                        <span className="font-bold text-primary">
                                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(product.prix_vente)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {product.description || "Aucune description disponible."}
                                    </p>
                                    <Button
                                        className="w-full"
                                        disabled={product.quantite <= 0}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            router.post(`/cart/add/${product.id}`, {}, { preserveScroll: true });
                                        }}
                                    >
                                        Ajouter au panier
                                    </Button>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {products.data.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        Aucun produit trouvé.
                    </div>
                )}

                {/* Pagination would go here */}
            </div>
        </MarketplaceLayout>
    );
}
