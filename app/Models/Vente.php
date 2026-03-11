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
}
