<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\LigneVente;
use App\Models\Produit;
use App\Models\Vente;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function index()
    {
        $cart = session()->get('cart', []);

        if (empty($cart)) {
            return redirect()->route('cart.index');
        }

        $total = array_reduce($cart, function ($sum, $item) {
            return $sum + ($item['price'] * $item['quantity']);
        }, 0);

        return Inertia::render('marketplace/checkout', [
            'cart' => $cart,
            'total' => $total,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'required|email',
            'telephone' => 'required|string|max:20',
            'adresse' => 'required|string',
            'mode_paiement' => 'required|in:espèces,mobile_money',
        ]);

        $cart = session()->get('cart', []);

        if (empty($cart)) {
            return back()->withErrors(['cart' => 'Votre panier est vide.']);
        }

        $total = array_reduce($cart, function ($sum, $item) {
            return $sum + ($item['price'] * $item['quantity']);
        }, 0);

        try {
            DB::beginTransaction();

            // Create Order
            $vente = Vente::create([
                'numero' => 'CMD-' . strtoupper(uniqid()),
                'user_id' => \Illuminate\Support\Facades\Auth::id(), // Assumes user is logged in
                'client_id' => null, // Optional: link to a client record if needed
                'montant_total' => $total,
                'statut' => 'en_attente', // New status for online orders
                'mode_paiement' => $request->mode_paiement,
                'type' => 'online',
                'delivery_address' => $request->adresse,
            ]);

            // Create Order Items
            foreach ($cart as $item) {
                $produit = Produit::with('variantes')->find($item['id']);
                if (!$produit || $produit->variantes->isEmpty()) {
                    continue;
                }

                // Pour les commandes en ligne simplifiées, on prend la première variante disponible
                $variante = $produit->variantes->where('quantite', '>', 0)->first() ?? $produit->variantes->first();

                $vente->lignes()->create([
                    'produit_id' => $produit->id,
                    'variante_id' => $variante->id,
                    'quantite' => $item['quantity'],
                    'prix_unitaire' => $item['price'],
                    'sous_total' => $item['price'] * $item['quantity'],
                ]);

                // Décrémenter le stock de la variante
                $variante->decrement('quantite', $item['quantity']);
            }

            DB::commit();
            session()->forget('cart');

            return redirect()->route('home')->with('success', 'Votre commande a été enregistrée avec succès !');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la commande. ' . $e->getMessage()]);
        }
    }
}
