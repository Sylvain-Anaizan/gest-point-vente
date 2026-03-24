<?php

namespace App\Models;

use App\Models\Traits\HasBoutique;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasBoutique, HasFactory;

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

    protected $appends = ['nom_complet', 'adresse_complete'];

    /**
     * Scope to filter active clients.
     */
    public function scopeActifs($query)
    {
        return $query->where('actif', true);
    }

    /**
     * Accesseur : nom complet (on garde le champ 'nom' seul pour l'instant).
     */
    public function getNomCompletAttribute(): string
    {
        return $this->nom;
    }

    /**
     * Accesseur : adresse complète (champ 'adresse').
     */
    public function getAdresseCompleteAttribute(): ?string
    {
        return $this->adresse;
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

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }

    public function ventes()
    {
        return $this->hasMany(Vente::class);
    }
}
