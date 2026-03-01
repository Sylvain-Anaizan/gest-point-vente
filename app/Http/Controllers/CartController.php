<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        $cart = session()->get('cart', []);
        $total = array_reduce($cart, function ($sum, $item) {
            return $sum + ($item['price'] * $item['quantity']);
        }, 0);

        return Inertia::render('marketplace/cart', [
            'cart' => $cart,
            'total' => $total,
        ]);
    }

    public function add(Request $request, Produit $product)
    {
        $cart = session()->get('cart', []);
        $quantity = $request->input('quantity', 1);

        if (isset($cart[$product->id])) {
            $cart[$product->id]['quantity'] += $quantity;
        } else {
            $cart[$product->id] = [
                'id' => $product->id,
                'name' => $product->nom,
                'price' => $product->prixMin,
                'image' => $product->imageUrl,
                'quantity' => $quantity,
                'max_quantity' => $product->totalStock,
            ];
        }

        session()->put('cart', $cart);

        return back()->with('success', 'Produit ajouté au panier !');
    }

    public function update(Request $request, $id)
    {
        $cart = session()->get('cart', []);

        if (isset($cart[$id])) {
            $cart[$id]['quantity'] = max(1, intval($request->quantity));
            session()->put('cart', $cart);
        }

        return back();
    }

    public function remove($id)
    {
        $cart = session()->get('cart', []);

        if (isset($cart[$id])) {
            unset($cart[$id]);
            session()->put('cart', $cart);
        }

        return back()->with('success', 'Produit retiré du panier.');
    }

    public function clear()
    {
        session()->forget('cart');

        return back()->with('success', 'Panier vidé.');
    }
}
