import { Head, Link, router } from '@inertiajs/react';
import MarketplaceLayout from '@/layouts/marketplace-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star } from 'lucide-react';

export default function Home({ featuredProducts, categories }: { featuredProducts: any[], categories: any[] }) {
    return (
        <MarketplaceLayout>
            <Head title="Accueil" />

            {/* Hero Section */}
            <section className="bg-muted/40 py-12 md:py-24 lg:py-32">
                <div className="container mx-auto px-4 flex flex-col items-center text-center gap-4">
                    <Badge variant="secondary" className="px-4 py-1 text-sm">Nouvelle Collection</Badge>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter max-w-3xl">
                        Découvrez nos meilleurs produits au meilleur prix
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-[600px]">
                        Une sélection unique de produits de qualité pour tous vos besoins. Commandez en ligne et faites-vous livrer rapidement.
                    </p>
                    <div className="flex gap-4 mt-4">
                        <Button size="lg" asChild>
                            <Link href="/catalog">Voir le catalogue</Link>
                        </Button>
                        <Button size="lg" variant="outline">
                            En savoir plus
                        </Button>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold mb-8">Catégories Populaires</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((category) => (
                            <Link key={category.id} href={`/catalog?category=${category.slug}`} className="group">
                                <Card className="h-full hover:border-primary transition-colors">
                                    <CardContent className="p-6 flex flex-col items-center justify-center gap-2 text-center h-full">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <Star className="h-6 w-6 text-primary" />
                                        </div>
                                        <span className="font-medium">{category.nom}</span>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-12 md:py-16 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Produits Vedettes</h2>
                        <Button variant="link" asChild>
                            <Link href="/catalog" className="flex items-center gap-2">
                                Tout voir <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {featuredProducts.map((product) => (
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
                </div>
            </section>
        </MarketplaceLayout>
    );
}
