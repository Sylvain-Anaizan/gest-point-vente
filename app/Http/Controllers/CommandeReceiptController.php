<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use Barryvdh\DomPDF\Facade\Pdf;

class CommandeReceiptController extends Controller
{
    public function download(Commande $commande)
    {
        $user = auth()->user();
        if (! $user->isAdmin() && $commande->boutique_id !== $user->boutique_id) {
            abort(403);
        }

        $commande->load(['client', 'lignesCommande', 'boutique']);

        $pdf = Pdf::loadView('pdf.commande-receipt', compact('commande'));

        return $pdf->download("recu-commande-{$commande->numero}.pdf");
    }
}
