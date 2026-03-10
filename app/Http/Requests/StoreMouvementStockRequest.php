<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMouvementStockRequest extends FormRequest
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
            'produit_id' => ['required', 'exists:produits,id'],
            'variante_id' => ['required', 'exists:variantes,id'],
            'quantite' => ['required', 'integer', 'min:1'],
            'type' => ['required', 'in:entrée,sortie,perte,ajustement'],
            'commentaire' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages()
    {
        return [
            "produit_id.required" => "Le champ produit est requis",
            "produit_id.exists" => "Le produit selectionné n'existe pas",
            "variante_id.required" => "Le champ variante est requis",
            "variante_id.exists" => "La variante selectionnée n'existe pas",
            "quantite.required" => "Le champ quantite est requis",
            "quantite.integer" => "Le champ quantite doit être un entier",
            "quantite.min" => "Le champ quantite doit être supérieur à 0",
            "type.required" => "Le champ type est requis",
            "type.in" => "Le champ type doit être entrée, sortie, perte ou ajustement",
            "commentaire.required" => "Le champ commentaire est requis",
            "commentaire.string" => "Le champ commentaire doit être une chaîne de caractères",
            "commentaire.max" => "Le champ commentaire ne doit pas dépasser 255 caractères",
        ];
    }
}
