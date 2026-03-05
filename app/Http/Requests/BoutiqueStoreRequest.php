<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BoutiqueStoreRequest extends FormRequest
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
            'nom' => 'required|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20',
        ];
    }

    public function messages()
    {
        return [
            'nom.required' => "Le champ nom est obligatoire",
            "nom.string" =>"Le doit être une chaîne de caractères",
            "telephone.max" => "Le numéro de téléphone ne doit pas dépasser 20 caractères",
            "telephone.string" => "Le numéro de téléphone doit être une chaîne de caractères",
            "adresse.max" => "L'adresse ne doit pas dépasser 255 caractères",
            "adresse.string" => "L'adresse doit être une chaîne de caractères",
        ];
    }
}
