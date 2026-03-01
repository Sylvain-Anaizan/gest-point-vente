<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MouvementStock extends Model
{
    protected $fillable = [
        'produit_id',
        'variante_id',
        'user_id',
        'quantite',
        'type',
        'commentaire',
    ];

    /**
     * Get the produit (master) that owns the movement.
     */
    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }

    /**
     * Get the variante that owns the movement.
     */
    public function variante(): BelongsTo
    {
        return $this->belongsTo(Variante::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
