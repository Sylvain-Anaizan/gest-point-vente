<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneCommande extends Model
{
    protected $fillable = [
        'nom',
        'quantite',
        'prix',
        'commande_id',
        'produit_id',
        'variante_id',
    ];

    protected $appends = [
        'total',
    ];

    public function getTotalAttribute () {
        return $this->prix * $this->quantite;
    }

    public function commande () {
        return $this->belongsTo(Commande::class);
    }

    public function produit () {
        return $this->belongsTo(Produit::class);
    }

    public function variante () {
        return $this->belongsTo(Variante::class);
    }
}
