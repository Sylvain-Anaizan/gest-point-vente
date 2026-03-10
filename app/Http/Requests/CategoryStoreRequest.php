<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryStoreRequest extends FormRequest
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
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages() {
        return [
            'nom.required' => "Le champ nom est requis",
            'nom.string' => "Le champ nom doit être une chaîne de caractères",
            'nom.max' => "Le champ nom ne doit pas dépasser 255 caractères",
            'description.string' => "Le champ description doit être une chaîne de caractères",
            'description.max' => "Le champ description ne doit pas dépasser 1000 caractères",
        ];
    }
}
