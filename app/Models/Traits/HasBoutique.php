<?php

namespace App\Models\Traits;

use App\Models\Scopes\BoutiqueScope;
use Illuminate\Support\Facades\Auth;

trait HasBoutique
{
    /**
     * Boot the trait.
     */
    public static function bootHasBoutique(): void
    {
        static::addGlobalScope(new BoutiqueScope);

        static::creating(function ($model) {
            if (empty($model->boutique_id) && Auth::check()) {
                $model->boutique_id = Auth::user()->boutique_id;
            }
        });
    }

    /**
     * Get the boutique that owns the model.
     */
    public function boutique()
    {
        return $this->belongsTo(\App\Models\Boutique::class);
    }

    /**
     * Scope a query to only include records for a specific boutique.
     */
    public function scopeForBoutique($query, $boutiqueId)
    {
        return $query->where('boutique_id', $boutiqueId);
    }
}
