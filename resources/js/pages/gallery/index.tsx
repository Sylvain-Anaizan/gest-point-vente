import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Product {
    id: number;
    nom: string;
    imageUrl: string;
    categorieId: number;
    categorieNom: string;
}

interface Category {
    id: number;
    nom: string;
    description: string | null;
    productsCount: number;
}

interface GalleryIndexProps {
    categories: Category[];
    products: Product[];
}

export default function GalleryIndex({
    categories,
    products,
}: GalleryIndexProps) {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null,
    );

    // Filter products based on selected category
    const filteredProducts =
        selectedCategory === null
            ? products
            : products.filter((p) => p.categorieId === selectedCategory);

    return (
        <>
            <Head title="Galerie - Anaizan" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                {/* Header - Mobile Optimized */}
                <div className="bg-white dark:bg-slate-900 border-b shadow-sm sticky top-0 z-10">
                    <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.history.back()}
                                    className="shrink-0"
                                >
                                    <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">
                                        Retour
                                    </span>
                                </Button>
                                <div className="min-w-0">
                                    <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                                        Galerie Anaizan
                                    </h1>
                                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                                        Découvrez nos produits
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0">
                                <Filter className="h-5 w-5 text-muted-foreground sm:hidden" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Filter - Mobile First */}
                <div className="bg-white dark:bg-slate-900 border-b shadow-sm sticky top-[57px] sm:top-[65px] z-10">
                    <div className="container mx-auto px-3 sm:px-4 py-3">
                        {/* Mobile: Horizontal Scroll */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:hidden">
                            <Button
                                variant={
                                    selectedCategory === null
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => setSelectedCategory(null)}
                                className="shrink-0 min-w-[80px]"
                            >
                                Toutes
                                <span className="ml-1.5 text-xs opacity-80">
                                    ({products.length})
                                </span>
                            </Button>
                            {categories.map((category) => (
                                <Button
                                    key={category.id}
                                    variant={
                                        selectedCategory === category.id
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() =>
                                        setSelectedCategory(category.id)
                                    }
                                    className="shrink-0 min-w-[80px]"
                                >
                                    {category.nom}
                                    <span className="ml-1.5 text-xs opacity-80">
                                        ({category.productsCount})
                                    </span>
                                </Button>
                            ))}
                        </div>

                        {/* Desktop: Wrapped Grid */}
                        <div className="hidden sm:flex flex-wrap gap-2">
                            <Button
                                variant={
                                    selectedCategory === null
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => setSelectedCategory(null)}
                            >
                                Toutes
                                <span className="ml-2 text-xs opacity-80">
                                    ({products.length})
                                </span>
                            </Button>
                            {categories.map((category) => (
                                <Button
                                    key={category.id}
                                    variant={
                                        selectedCategory === category.id
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() =>
                                        setSelectedCategory(category.id)
                                    }
                                >
                                    {category.nom}
                                    <span className="ml-2 text-xs opacity-80">
                                        ({category.productsCount})
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Products Count */}
                <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        {filteredProducts.length} produit
                        {filteredProducts.length > 1 ? 's' : ''}{' '}
                        {selectedCategory !== null && (
                            <span>
                                dans{' '}
                                <span className="font-medium">
                                    {
                                        categories.find(
                                            (c) => c.id === selectedCategory,
                                        )?.nom
                                    }
                                </span>
                            </span>
                        )}
                    </p>
                </div>

                {/* Gallery Grid - Mobile First */}
                <div className="container mx-auto px-3 sm:px-4 pb-8">
                    {filteredProducts.length === 0 ? (
                        <Card className="p-8 sm:p-12 text-center">
                            <p className="text-sm sm:text-base text-muted-foreground">
                                Aucun produit disponible
                                {selectedCategory !== null &&
                                    ' dans cette catégorie'}
                            </p>
                        </Card>
                    ) : (
                        <div
                            className={cn(
                                'grid gap-3 sm:gap-4 md:gap-6',
                                'grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
                                'transition-all duration-300',
                            )}
                        >
                            {filteredProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className="group overflow-hidden hover:shadow-xl transition-all duration-300 animate-in fade-in-50 zoom-in-95"
                                >
                                    <div className="aspect-square relative overflow-hidden bg-muted">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.nom}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        {/* Overlay on hover - Hidden on mobile for better touch experience */}
                                        <div className="hidden sm:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center">
                                            <div className="text-center text-white p-4">
                                                <p className="font-semibold text-lg mb-2">
                                                    {product.nom}
                                                </p>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        window.open(
                                                            product.imageUrl,
                                                            '_blank',
                                                        );
                                                    }}
                                                >
                                                    Voir en grand
                                                </Button>
                                            </div>
                                        </div>
                                        {/* Mobile: Show category badge */}
                                        <div className="sm:hidden absolute top-2 right-2">
                                            <span className="text-[10px] px-2 py-1 bg-black/70 text-white rounded-full">
                                                {product.categorieNom}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-800">
                                        <p className="text-xs sm:text-sm font-medium text-center truncate">
                                            {product.nom}
                                        </p>
                                        {/* Mobile: Tap to view */}
                                        <button
                                            className="sm:hidden w-full mt-2 text-[10px] text-primary hover:underline"
                                            onClick={() => {
                                                window.open(
                                                    product.imageUrl,
                                                    '_blank',
                                                );
                                            }}
                                        >
                                            Voir en grand
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-white dark:bg-slate-900 border-t mt-8 sm:mt-12">
                    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 text-center">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            🏪 <span className="font-semibold">Anaizan</span> -
                            Galerie de produits
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </>
    );
}
