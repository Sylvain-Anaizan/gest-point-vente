<?php

namespace App\Models;

use App\Models\Produit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Taille extends Model
{
    /** @use HasFactory<\Database\Factories\TailleFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nom',
        'description',
    ];

    /**
     * Get the produits for the taille.
     */
    public function produits(): BelongsToMany
    {
        return $this->belongsToMany(Produit::class, 'variantes', 'taille_id', 'produit_id')->distinct();
    }
}
