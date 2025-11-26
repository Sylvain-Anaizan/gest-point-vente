import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';

interface Category {
    id: number;
    nom: string;
    description: string;
    produits_count: number;
}

interface Product {
    id: number;
    nom: string;
    prix_vente: number;
    quantite: number;
    description: string;
    imageUrl: string;
}

interface Client {
    id: number;
    nom: string;
    telephone: string;
    email: string;
}

interface WhatsAppShareModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clients?: Client[];
}

export function WhatsAppShareModal({
    open,
    onOpenChange,
    clients = [],
}: WhatsAppShareModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [customPhone, setCustomPhone] = useState('');
    const [loading, setLoading] = useState(false);

    // Load categories when modal opens
    useEffect(() => {
        if (open) {
            fetch('/whatsapp/categories')
                .then((res) => res.json())
                .then((data) => setCategories(data))
                .catch((err) => console.error('Error loading categories:', err));
        }
    }, [open]);

    // Load products when category changes
    useEffect(() => {
        if (selectedCategory) {
            fetch('/whatsapp/category-products?categorie_id=' + selectedCategory)
                .then((res) => res.json())
                .then((data) => setProducts(data))
                .catch((err) => console.error('Error loading products:', err));
        } else {
            setProducts([]);
        }
    }, [selectedCategory]);

    const handleSend = async () => {
        if (!selectedCategory) {
            alert('Veuillez sélectionner une catégorie');
            return;
        }

        const telephone = selectedClient
            ? clients.find((c) => c.id.toString() === selectedClient)?.telephone
            : customPhone;

        if (!telephone) {
            alert('Veuillez sélectionner un client ou entrer un numéro');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/whatsapp/send-catalog', {
                categorie_id: selectedCategory,
                client_id: selectedClient || null,
                telephone: customPhone || null,
            });

            const data = response.data;

            if (data.success) {
                // Generate gallery link
                const galleryUrl = `${window.location.origin}/gallery/category/${selectedCategory}`;

                // Open WhatsApp link in new tab
                window.open(data.whatsapp_link, '_blank');

                // Copy gallery link to clipboard
                navigator.clipboard.writeText(galleryUrl).then(() => {
                    alert(`✅ Lien de galerie copié!\n\n${galleryUrl}\n\nVous pouvez aussi le partager directement.`);
                });

                // Reset form
                setSelectedCategory('');
                setSelectedClient('');
                setCustomPhone('');
                setProducts([]);

                // Close modal
                onOpenChange(false);
            } else {
                alert('Erreur lors de la génération du lien WhatsApp');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erreur lors de la génération du lien WhatsApp');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageCircle className="size-5 text-green-600" />
                        Envoyer Catalogue WhatsApp
                    </DialogTitle>
                    <DialogDescription>
                        Sélectionnez une catégorie et un client pour envoyer le
                        catalogue de produits via WhatsApp
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Category Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Catégorie de produits</Label>
                        <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                        >
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem
                                        key={cat.id}
                                        value={cat.id.toString()}
                                    >
                                        {cat.nom} ({cat.produits_count} produits)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Products Preview */}
                    {products.length > 0 && (
                        <div className="space-y-2">
                            <Label>
                                Aperçu des produits ({products.length})
                            </Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="relative group"
                                    >
                                        <img
                                            src={product.imageUrl}
                                            alt={product.nom}
                                            className="w-full h-32 object-cover rounded-md"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex flex-col items-center justify-center p-2 text-white text-xs">
                                            <p className="font-semibold text-center">
                                                {product.nom}
                                            </p>
                                            <p className="text-green-400">
                                                {product.prix_vente} DH
                                            </p>
                                            <p className="text-gray-300">
                                                Stock: {product.quantite}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Client Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="client">Client (optionnel)</Label>
                        <Select
                            value={selectedClient}
                            onValueChange={(value) => {
                                setSelectedClient(value);
                                if (value) setCustomPhone('');
                            }}
                        >
                            <SelectTrigger id="client">
                                <SelectValue placeholder="Sélectionner un client" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem
                                        key={client.id}
                                        value={client.id.toString()}
                                    >
                                        {client.nom} - {client.telephone}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Custom Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">
                            Ou entrer un numéro de téléphone
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="0612345678 ou +212612345678"
                            value={customPhone}
                            onChange={(e) => {
                                setCustomPhone(e.target.value);
                                if (e.target.value) setSelectedClient('');
                            }}
                            disabled={!!selectedClient}
                        />
                        <p className="text-xs text-muted-foreground">
                            Format accepté: 0612345678 ou +212612345678
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={
                            loading ||
                            !selectedCategory ||
                            (!selectedClient && !customPhone)
                        }
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <MessageCircle className="size-4 mr-2" />
                        {loading ? 'Génération...' : 'Envoyer via WhatsApp'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
