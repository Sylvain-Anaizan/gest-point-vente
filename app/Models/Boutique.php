<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Boutique extends Model
{
    /** @use HasFactory<\Database\Factories\BoutiqueFactory> */
    use HasFactory;

    protected $fillable = ['nom', 'adresse', 'telephone'];

    public function produits()
    {
        return $this->hasMany(Produit::class);
    }

    public function ventes()
    {
        return $this->hasMany(Vente::class);
    }

    public function employes()
    {
        return $this->hasMany(User::class);
    }
}
