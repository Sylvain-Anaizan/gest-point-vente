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
        // 'prix_vente', // Migré vers Variante
        // 'quantite',   // Migré vers Variante
        'categorie_id',
        // 'taille_id',  // Migré vers Variante
        'description',
        'image',
        'boutique_id',
        'unite_id',
        'est_virtuel',
    ];

    protected $appends = ['imageUrl', 'totalStock', 'prixMin', 'prixMax'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'est_virtuel' => 'boolean',
        ];
    }

    /**
     * Scope pour les produits visibles par l'utilisateur.
     */
    public function scopeVisibles($query)
    {
        return $query->where('est_virtuel', false);
    }

    // Accessors for master product summary
    public function getTotalStockAttribute(): int
    {
        return $this->variantes->sum('quantite');
    }

    public function getPrixMinAttribute(): float
    {
        return $this->variantes->min('prix_vente') ?? 0;
    }

    public function getPrixMaxAttribute(): float
    {
        return $this->variantes->max('prix_vente') ?? 0;
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
     * Les variantes du produit.
     */
    public function variantes(): HasMany
    {
        return $this->hasMany(Variante::class);
    }

    /**
     * Get the boutique that owns the produit.
     */
    public function boutique(): BelongsTo
    {
        return $this->belongsTo(Boutique::class);
    }

    /**
     * Get the unit that belongs to the product.
     */
    public function unite(): BelongsTo
    {
        return $this->belongsTo(Unite::class);
    }
}
