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
}
