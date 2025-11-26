<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produit extends Model
{
    /** @use HasFactory<\Database\Factories\ProduitFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nom',
        'prix_vente',
        'quantite',
        'categorie_id',
        'taille_id',
        'description',
        'image',
    ];

    protected $appends = ['imageUrl'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'prix_vente' => 'float',
            'quantite' => 'integer',
        ];
    }

    public function getImageUrlAttribute()
    {
        return $this->image
            ? asset('storage/images/produits/'.$this->image)
            : asset('storage/images/produits/default.png');
    }

    /**
     * Get the category that owns the produit.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'categorie_id');
    }

    /**
     * Get the taille that owns the produit.
     */
    public function taille(): BelongsTo
    {
        return $this->belongsTo(Taille::class);
    }

    /**
     * Les mouvements de stock associés au produit.
     */
    public function mouvements(): HasMany
    {
        return $this->hasMany(MouvementStock::class);
    }

    /**
     * Les ventes (lignes de vente) associées au produit.
     */
    public function ventes(): HasMany
    {
        return $this->hasMany(LigneVente::class);
    }
}
