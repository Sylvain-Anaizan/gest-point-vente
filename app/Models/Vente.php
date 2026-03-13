<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vente extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero',
        'client_id',
        'commande_id',
        'user_id',
        'montant_total',
        'statut',
        'mode_paiement',
        'type',
        'delivery_address',
        'boutique_id',
        'statut_paiement',
    ];

    protected $casts = [
        'montant_total' => 'decimal:2',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lignes(): HasMany
    {
        return $this->hasMany(LigneVente::class);
    }

    public function boutique(): BelongsTo
    {
        return $this->belongsTo(Boutique::class);
    }

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class);
    }

    public function paiements(): HasMany
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
        $total = (float) $this->montant_total;
        $paye = (float) $this->paiements()->sum('montant');

        if ($paye <= 0) {
            $this->statut_paiement = 'Impayée';
        } elseif ($paye < $total) {
            $this->statut_paiement = 'Partiellement payée';
        } else {
            $this->statut_paiement = 'Payée';
        }

        $this->save();
    }
}
