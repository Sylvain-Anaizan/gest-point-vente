import { Head } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Product {
    id: number;
    nom: string;
    imageUrl: string;
}

interface Categorie {
    id: number;
    nom: string;
    description: string | null;
}

interface GalleryCategoryProps {
    categorie: Categorie;
    products: Product[];
}

export default function GalleryCategory({
    categorie,
    products,
}: GalleryCategoryProps) {
    const handleDownloadAll = () => {
        // Download all images
        products.forEach((product, index) => {
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
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 border-b shadow-sm sticky top-0 z-10">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.history.back()}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Retour
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">
                                        {categorie.nom}
                                    </h1>
                                    {categorie.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {categorie.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadAll}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger tout
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-6">
                        <p className="text-sm text-muted-foreground">
                            {products.length} photo{products.length > 1 ? 's' : ''}{' '}
                            disponible{products.length > 1 ? 's' : ''}
                        </p>
                    </div>

                    {products.length === 0 ? (
                        <Card className="p-12 text-center">
                            <p className="text-muted-foreground">
                                Aucune photo disponible pour cette catégorie
                            </p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <Card
                                    key={product.id}
                                    className="group overflow-hidden hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="aspect-square relative overflow-hidden bg-muted">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.nom}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
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
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-800">
                                        <p className="text-sm font-medium text-center truncate">
                                            {product.nom}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-white dark:bg-slate-900 border-t mt-12">
                    <div className="container mx-auto px-4 py-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            🏪 <span className="font-semibold">Anaizan</span> -
                            Galerie de produits
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
