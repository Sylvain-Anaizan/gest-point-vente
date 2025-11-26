import { Head, Link, router } from '@inertiajs/react';
import MarketplaceLayout from '@/layouts/marketplace-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function Cart({ cart, total }: { cart: any, total: number }) {
    const cartItems = Object.values(cart) as any[];

    const updateQuantity = (id: number, quantity: number) => {
        router.patch(`/cart/update/${id}`, { quantity }, { preserveScroll: true });
    };

    const removeItem = (id: number) => {
        router.delete(`/cart/remove/${id}`, { preserveScroll: true });
    };

    return (
        <MarketplaceLayout>
            <Head title="Mon Panier" />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Mon Panier</h1>

                {cartItems.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <Card key={item.id} className="overflow-hidden">
                                    <CardContent className="p-4 flex gap-4 items-center">
                                        <div className="h-24 w-24 bg-muted rounded-md overflow-hidden shrink-0">
                                            <img
                                                src={item.image || 'https://placehold.co/200'}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{item.name}</h3>
                                            <p className="text-primary font-bold">
                                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(item.price)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={item.quantity >= item.max_quantity}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive/90"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24">
                                <CardContent className="p-6 space-y-4">
                                    <h2 className="text-xl font-semibold">Résumé de la commande</h2>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Sous-total</span>
                                            <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(total)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Livraison</span>
                                            <span className="text-muted-foreground italic">Calculé à l'étape suivante</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                            <span>Total</span>
                                            <span className="text-primary">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(total)}</span>
                                        </div>
                                    </div>
                                    <Button className="w-full" size="lg" asChild>
                                        <Link href="/checkout">Passer la commande</Link>
                                    </Button>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/catalog">Continuer mes achats</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 space-y-4">
                        <div className="bg-muted/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-semibold">Votre panier est vide</h2>
                        <p className="text-muted-foreground">Découvrez nos produits et commencez votre shopping !</p>
                        <Button asChild className="mt-4">
                            <Link href="/catalog">Voir le catalogue</Link>
                        </Button>
                    </div>
                )}
            </div>
        </MarketplaceLayout>
    );
}
