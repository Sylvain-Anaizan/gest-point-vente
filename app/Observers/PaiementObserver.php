<?php

namespace App\Observers;

use App\Models\Paiement;

class PaiementObserver
{
    /**
     * Handle the Paiement "created" event.
     */
    public function created(Paiement $paiement): void
    {
        $this->updatePayableStatut($paiement);
    }

    /**
     * Handle the Paiement "updated" event.
     */
    public function updated(Paiement $paiement): void
    {
        $this->updatePayableStatut($paiement);
    }

    /**
     * Handle the Paiement "deleted" event.
     */
    public function deleted(Paiement $paiement): void
    {
        $this->updatePayableStatut($paiement);
    }

    /**
     * Handle the Paiement "restored" event.
     */
    public function restored(Paiement $paiement): void
    {
        $this->updatePayableStatut($paiement);
    }

    /**
     * Handle the Paiement "force deleted" event.
     */
    public function forceDeleted(Paiement $paiement): void
    {
        $this->updatePayableStatut($paiement);
    }

    /**
     * Update the statut of the payable model (Vente or Commande).
     */
    protected function updatePayableStatut(Paiement $paiement): void
    {
        if ($paiement->vente) {
            $paiement->vente->updateStatutPaiement();
        }

        if ($paiement->commande) {
            $paiement->commande->updateStatutPaiement();
        }
    }
}
