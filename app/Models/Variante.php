<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Variante extends Model
{
    use HasFactory;

    protected $fillable = [
        'produit_id',
        'taille_id',
        'prix_vente',
        'quantite',
        'seuil_alerte',
    ];

    protected $casts = [
        'prix_vente' => 'float',
        'quantite' => 'integer',
        'seuil_alerte' => 'integer',
    ];

    /**
     * Get the produit that owns the variante.
     */
    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }

    /**
     * Get the taille that owns the variante.
     */
    public function taille(): BelongsTo
    {
        return $this->belongsTo(Taille::class);
    }

    /**
     * Les mouvements de stock associés à la variante.
     */
    public function mouvements(): HasMany
    {
        return $this->hasMany(MouvementStock::class);
    }

    /**
     * Les ventes (lignes de vente) associées à la variante.
     */
    public function ventes(): HasMany
    {
        return $this->hasMany(LigneVente::class);
    }
}
