<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RapportJournalier extends Model
{
    protected $fillable = [
        'user_id',
        'date_rapport',
        'contenu',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
