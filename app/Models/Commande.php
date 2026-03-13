<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    /** @use HasFactory<\Database\Factories\CommandeFactory> */
    use HasFactory;

    protected $fillable = [
        'numero',
        'client_id',
        'nom_client',
        'telephone_client',
        'adresse_origine',
        'adresse_destination',
        'statut',
        'montant_total',
        'date_commande',
        'observations',
        'boutique_id',
        'statut_paiement',
    ];

    protected $casts = [
        'date_commande' => 'datetime',
        'montant_total' => 'decimal:2',
    ];

    public function client(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function boutique(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Boutique::class);
    }

    public function lignesCommande(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(LigneCommande::class);
    }

    public function paiements(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Paiement::class);
    }

    public function getMontantPayeAttribute(): float
    {
        return (float) $this->paiements()->sum('montant');
    }

    public function getResteAPayerAttribute(): float
    {
        return (float) $this->montant_total - $this->montant_paye;
    }

    public function updateStatutPaiement(): void
    {
        $paye = $this->montant_paye;
        $total = (float) $this->montant_total;

        if ($paye <= 0) {
            $this->statut_paiement = 'Non payée';
        } elseif ($paye < $total) {
            $this->statut_paiement = 'Partiellement payée';
        } else {
            $this->statut_paiement = 'Payée';
        }

        $this->save();
    }
}
