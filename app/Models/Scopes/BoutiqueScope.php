<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class BoutiqueScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $user = auth()->user();

        if ($user instanceof \App\Models\User && ! $user->isAdmin()) {
            $builder->where($model->getTable().'.boutique_id', $user->boutique_id);
        }
    }
}
