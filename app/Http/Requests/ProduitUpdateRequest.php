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
}
