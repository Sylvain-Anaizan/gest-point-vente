<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProduitUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
            'categorie_id' => ['required', 'exists:categories,id'],
            'sous_categorie_id' => ['nullable', 'exists:sous_categories,id'],
            'boutique_id' => ['nullable', 'exists:boutiques,id'],
            'unite_id' => ['nullable', 'exists:unites,id'],
            'description' => ['nullable', 'string', 'max:1000'],
            'image' => ['nullable', 'image', 'max:2048'],

            'variantes' => ['required', 'array', 'min:1'],
            'variantes.*.id' => ['nullable', 'exists:variantes,id'],
            'variantes.*.taille_id' => ['nullable', 'exists:tailles,id'],
            'variantes.*.prix_vente' => ['required', 'numeric', 'min:0'],
            'variantes.*.quantite' => ['required', 'integer', 'min:0'],
        ];
    }

    public function messages()
    {
        return [
            'nom.required' => 'Le champ nom est requis',
            'nom.string' => 'Le champ nom doit être une chaîne de caractères',
            'nom.max' => 'Le champ nom ne doit pas dépasser 255 caractères',
            'categorie_id.required' => 'Le champ categorie_id est requis',
            'categorie_id.exists' => "La categorie selectionnée n'existe pas",
            'boutique_id.required' => 'Le champ boutique_id est requis',
            'boutique_id.exists' => "La boutique selectionnée n'existe pas",
            'unite_id.required' => 'Le champ unite_id est requis',
            'unite_id.exists' => "L'unite selectionnée n'existe pas",
            'description.required' => 'Le champ description est requis',
            'description.string' => 'Le champ description doit être une chaîne de caractères',
            'description.max' => 'Le champ description ne doit pas dépasser 1000 caractères',
            'image.required' => 'Le champ image est requis',
            'image.image' => 'Le champ image doit être une image',
            'image.max' => 'Le champ image ne doit pas dépasser 2048 caractères',
            'variantes.required' => 'Le champ variantes est requis',
            'variantes.array' => 'Le champ variantes doit être un tableau',
            'variantes.min' => 'Le champ variantes doit contenir au moins un élément',
            'variantes.*.id.required' => 'Le champ id est requis',
            'variantes.*.id.exists' => "La variante selectionnée n'existe pas",
            'variantes.*.taille_id.required' => 'Le champ taille_id est requis',
            'variantes.*.taille_id.exists' => "La taille selectionnée n'existe pas",
            'variantes.*.prix_vente.required' => 'Le champ prix_vente est requis',
            'variantes.*.prix_vente.numeric' => 'Le champ prix_vente doit être un nombre',
            'variantes.*.prix_vente.min' => 'Le champ prix_vente ne doit pas être négatif',
            'variantes.*.quantite.required' => 'Le champ quantite est requis',
            'variantes.*.quantite.integer' => 'Le champ quantite doit être un entier',
            'variantes.*.quantite.min' => 'Le champ quantite ne doit pas être négatif',
        ];
    }
}
