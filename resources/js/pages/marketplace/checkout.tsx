import { Head, useForm, usePage } from '@inertiajs/react';
import MarketplaceLayout from '@/layouts/marketplace-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SharedData } from '@/types';

export default function Checkout({ cart, total }: { cart: any, total: number }) {
    const { auth } = usePage<SharedData>().props;
    const cartItems = Object.values(cart) as any[];

    const { data, setData, post, processing, errors } = useForm({
        nom: auth.user?.name || '',
        email: auth.user?.email || '',
        telephone: auth.user?.numero || '',
        adresse: '',
        mode_paiement: 'espèces',
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <MarketplaceLayout>
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
                    <Button asChild><a href="/catalog">Retourner au catalogue</a></Button>
                </div>
            </MarketplaceLayout>
        );
    }

    return (
        <MarketplaceLayout>
            <Head title="Paiement" />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations de contact</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nom">Nom complet</Label>
                                        <Input
                                            id="nom"
                                            value={data.nom}
                                            onChange={(e) => setData('nom', e.target.value)}
                                            required
                                        />
                                        {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telephone">Téléphone</Label>
                                        <Input
                                            id="telephone"
                                            //value={data.telephone}
                                            onChange={(e) => setData('telephone', e.target.value)}
                                            required
                                        />
                                        {errors.telephone && <p className="text-sm text-destructive">{errors.telephone}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivery Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Livraison</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="adresse">Adresse de livraison</Label>
                                    <Textarea
                                        id="adresse"
                                        placeholder="Quartier, rue, indications..."
                                        value={data.adresse}
                                        onChange={(e) => setData('adresse', e.target.value)}
                                        required
                                    />
                                    {errors.adresse && <p className="text-sm text-destructive">{errors.adresse}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes de commande (optionnel)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Instructions spéciales..."
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Paiement</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={data.mode_paiement}
                                    onValueChange={(val) => setData('mode_paiement', val)}
                                    className="space-y-3"
                                >
                                    <div className="flex items-center space-x-2 border p-4 rounded-lg">
                                        <RadioGroupItem value="espèces" id="especes" />
                                        <Label htmlFor="especes" className="flex-1 cursor-pointer">Paiement à la livraison (Espèces)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border p-4 rounded-lg">
                                        <RadioGroupItem value="mobile_money" id="mobile_money" />
                                        <Label htmlFor="mobile_money" className="flex-1 cursor-pointer">Mobile Money</Label>
                                    </div>
                                </RadioGroup>
                                {errors.mode_paiement && <p className="text-sm text-destructive mt-2">{errors.mode_paiement}</p>}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Résumé</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total à payer</span>
                                        <span className="text-primary">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(total)}</span>
                                    </div>
                                </div>
                                <Button className="w-full" size="lg" type="submit" disabled={processing}>
                                    {processing ? 'Traitement...' : 'Confirmer la commande'}
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">
                                    En confirmant, vous acceptez nos conditions générales de vente.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </MarketplaceLayout>
    );
}
