<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'boutique_id',
        'nom',
        'email',
        'telephone',
        'adresse',
        'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    /**
     * Scope to filter active clients.
     */
    public function scopeActifs($query)
    {
        return $query->where('actif', true);
    }

    /**
     * Scope to search clients by name or email.
     */
    public function scopeRechercher($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('nom', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('telephone', 'like', "%{$search}%");
        });
    }

    public function ventes()
    {
        return $this->hasMany(Vente::class);
    }
}
