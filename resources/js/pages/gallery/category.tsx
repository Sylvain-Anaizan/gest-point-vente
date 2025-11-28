import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Download, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Taille {
    id: number;
    nom: string;
}

interface Product {
    id: number;
    nom: string;
    imageUrl: string;
    taille: Taille | null;
}

interface Categorie {
    id: number;
    nom: string;
    description: string | null;
}

interface GalleryCategoryProps {
    categorie: Categorie;
    products: Product[];
    availableSizes: Taille[];
}

export default function GalleryCategory({
    categorie,
    products,
    availableSizes,
}: GalleryCategoryProps) {
    const [selectedSize, setSelectedSize] = useState<number | null>(null);

    // Filter products by selected size
    const filteredProducts =
        selectedSize === null
            ? products
            : products.filter((p) => p.taille?.id === selectedSize);

    const handleDownloadAll = () => {
        // Download all filtered images
        filteredProducts.forEach((product, index) => {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = product.imageUrl;
                link.download = `${product.nom}.jpg`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, index * 500); // Delay to avoid blocking
        });
    };

    return (
        <>
            <Head title={`Galerie - ${categorie.nom}`} />

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
                                        {categorie.nom}
                                    </h1>
                                    {categorie.description && (
                                        <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                                            {categorie.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadAll}
                                className="shrink-0"
                            >
                                <Download className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">
                                    Télécharger tout
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Size Filter - Mobile First */}
                {availableSizes.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 border-b shadow-sm sticky top-[57px] sm:top-[65px] z-10">
                        <div className="container mx-auto px-3 sm:px-4 py-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Ruler className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                    Filtrer par taille
                                </span>
                            </div>

                            {/* Mobile: Horizontal Scroll */}
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:hidden">
                                <Button
                                    variant={
                                        selectedSize === null
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => setSelectedSize(null)}
                                    className="shrink-0 min-w-[70px]"
                                >
                                    Toutes
                                    <span className="ml-1.5 text-xs opacity-80">
                                        ({products.length})
                                    </span>
                                </Button>
                                {availableSizes.map((size) => {
                                    const count = products.filter(
                                        (p) => p.taille?.id === size.id,
                                    ).length;
                                    return (
                                        <Button
                                            key={size.id}
                                            variant={
                                                selectedSize === size.id
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            onClick={() =>
                                                setSelectedSize(size.id)
                                            }
                                            className="shrink-0 min-w-[70px]"
                                        >
                                            {size.nom}
                                            <span className="ml-1.5 text-xs opacity-80">
                                                ({count})
                                            </span>
                                        </Button>
                                    );
                                })}
                            </div>

                            {/* Desktop: Wrapped Grid */}
                            <div className="hidden sm:flex flex-wrap gap-2">
                                <Button
                                    variant={
                                        selectedSize === null
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => setSelectedSize(null)}
                                >
                                    Toutes
                                    <span className="ml-2 text-xs opacity-80">
                                        ({products.length})
                                    </span>
                                </Button>
                                {availableSizes.map((size) => {
                                    const count = products.filter(
                                        (p) => p.taille?.id === size.id,
                                    ).length;
                                    return (
                                        <Button
                                            key={size.id}
                                            variant={
                                                selectedSize === size.id
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            onClick={() =>
                                                setSelectedSize(size.id)
                                            }
                                        >
                                            {size.nom}
                                            <span className="ml-2 text-xs opacity-80">
                                                ({count})
                                            </span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Gallery Grid */}
                <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
                    <div className="mb-4 sm:mb-6">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {filteredProducts.length} produit
                            {filteredProducts.length > 1 ? 's' : ''}{' '}
                            {selectedSize !== null && (
                                <span>
                                    en taille{' '}
                                    <span className="font-medium">
                                        {
                                            availableSizes.find(
                                                (s) => s.id === selectedSize,
                                            )?.nom
                                        }
                                    </span>
                                </span>
                            )}
                        </p>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <Card className="p-8 sm:p-12 text-center">
                            <p className="text-sm sm:text-base text-muted-foreground">
                                Aucun produit disponible
                                {selectedSize !== null &&
                                    ' pour cette taille'}
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
                                        {/* Size badge - Mobile */}
                                        {product.taille && (
                                            <div className="absolute top-2 right-2">
                                                <span className="text-xs px-2.5 py-1 bg-black/70 text-white rounded-full font-medium">
                                                    {product.taille.nom}
                                                </span>
                                            </div>
                                        )}
                                        {/* Overlay on hover - Desktop */}
                                        <div className="hidden sm:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center">
                                            <div className="text-center text-white p-4">
                                                <p className="font-semibold text-lg mb-2">
                                                    {product.nom}
                                                </p>
                                                {product.taille && (
                                                    <p className="text-sm mb-3 opacity-90">
                                                        Taille:{' '}
                                                        {product.taille.nom}
                                                    </p>
                                                )}
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
