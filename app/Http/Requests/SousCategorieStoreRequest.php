<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SousCategorieStoreRequest extends FormRequest
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
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom de la sous-catégorie est requis.',
            'nom.max' => 'Le nom ne doit pas dépasser 255 caractères.',
            'categorie_id.required' => 'La catégorie parente est requise.',
            'categorie_id.exists' => 'La catégorie sélectionnée est invalide.',
        ];
    }
}
