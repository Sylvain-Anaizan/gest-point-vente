<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Client;
use Illuminate\Http\Request;

class WhatsAppController extends Controller
{
    /**
     * Generate WhatsApp link to send product catalog by category.
     */
    public function generateCatalogLink(Request $request)
    {
        $request->validate([
            'categorie_id' => 'required|exists:categories,id',
            'client_id' => 'nullable|exists:clients,id',
            'telephone' => 'required_without:client_id|string',
        ]);

        // Get category with products
        $categorie = Categorie::with('produits')->findOrFail($request->categorie_id);

        // Get phone number
        $telephone = $request->client_id
            ? Client::findOrFail($request->client_id)->telephone
            : $request->telephone;

        // Format phone number (remove spaces, dashes, and ensure international format)
        $telephone = $this->formatPhoneNumber($telephone);

        // Generate message
        $message = $this->generateCatalogMessage($categorie);

        // Generate WhatsApp link
        $whatsappLink = "https://wa.me/{$telephone}?text=" . urlencode($message);

        return response()->json([
            'success' => true,
            'whatsapp_link' => $whatsappLink,
            'message' => $message,
            'products_count' => $categorie->produits->count(),
        ]);
    }

    /**
     * Format phone number to international format.
     */
    private function formatPhoneNumber(string $telephone): string
    {
        // Remove all non-numeric characters except +
        $telephone = preg_replace('/[^0-9+]/', '', $telephone);

        // If number starts with +, remove it temporarily to process
        $hasPlus = str_starts_with($telephone, '+');
        if ($hasPlus) {
            $telephone = substr($telephone, 1);
        }

        // If number already has a country code (starts with 2 or 3 digits country code)
        // Common country codes: 212 (Morocco), 223 (Mali), 221 (Senegal), 225 (Ivory Coast), etc.
        if (preg_match('/^(2[0-9]{2}|3[0-9]{2}|1)/', $telephone)) {
            // Already has country code, return as is
            return $telephone;
        }

        // If number starts with 0, it's a local number - replace with Morocco code (212)
        if (str_starts_with($telephone, '0')) {
            return '212' . substr($telephone, 1);
        }

        // If it's a short number without country code, assume Morocco
        if (strlen($telephone) < 10) {
            return '212' . $telephone;
        }

        return $telephone;
    }

    /**
     * Generate catalog message with product details.
     */
    private function generateCatalogMessage(Categorie $categorie): string
    {
        $galleryUrl = url("/gallery/category/{$categorie->id}");
        
        $message = "🛍️ *Catalogue {$categorie->nom}*\n\n";

        if ($categorie->description) {
            $message .= "{$categorie->description}\n\n";
        }

        $message .= "📸 *{$categorie->produits->count()} photos disponibles*\n\n";
        $message .= "👉 Voir toutes les photos:\n";
        $message .= "{$galleryUrl}\n\n";
        $message .= "---\n";
        $message .= "📞 Pour plus d'infos ou commander, répondez à ce message!\n";
        $message .= "🏪 *Anaizan*";

        return $message;
    }

    /**
     * Get available categories with product count for the WhatsApp interface.
     */
    public function getCategories()
    {
        $categories = Categorie::withCount('produits')
            ->has('produits')
            ->get()
            ->map(function ($categorie) {
                return [
                    'id' => $categorie->id,
                    'nom' => $categorie->nom,
                    'description' => $categorie->description,
                    'produits_count' => $categorie->produits_count,
                ];
            });

        return response()->json($categories);
    }

    /**
     * Get products preview for a category.
     */
    public function getCategoryProducts(Request $request)
    {
        $request->validate([
            'categorie_id' => 'required|exists:categories,id',
        ]);

        $produits = Categorie::findOrFail($request->categorie_id)
            ->produits()
            ->get()
            ->map(function ($produit) {
                return [
                    'id' => $produit->id,
                    'nom' => $produit->nom,
                    'prix_vente' => $produit->prix_vente,
                    'quantite' => $produit->quantite,
                    'description' => $produit->description,
                    'imageUrl' => $produit->imageUrl,
                ];
            });

        return response()->json($produits);
    }
}
