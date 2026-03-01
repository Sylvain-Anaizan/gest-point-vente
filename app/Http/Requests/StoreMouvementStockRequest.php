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
}
