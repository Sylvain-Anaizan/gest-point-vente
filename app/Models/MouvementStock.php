<?php

namespace App\Models;

use App\Models\Traits\HasBoutique;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MouvementStock extends Model
{
    use HasBoutique, HasFactory;

    protected $fillable = [
        'produit_id',
        'variante_id',
        'boutique_id',
        'user_id',
        'type',
        'quantite',
        'commentaire',
    ];

    public function boutique(): BelongsTo
    {
        return $this->belongsTo(Boutique::class);
    }

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
