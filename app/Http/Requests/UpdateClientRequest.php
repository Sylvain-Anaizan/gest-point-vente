<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Pour cet exemple, tout utilisateur authentifié peut modifier
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $clientId = $this->route('client')->id;

        return [
            'boutique_id' => ['required', 'exists:boutiques,id'],
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', Rule::unique('clients')->ignore($clientId)],
            'telephone' => ['nullable', 'string', 'max:20', 'regex:/^[\+]?[0-9\s\-\(\)]+$/'],
            'adresse' => ['nullable', 'string', 'max:500'],
            'actif' => ['boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'boutique_id.required' => 'La boutique est obligatoire.',
            'boutique_id.exists' => 'La boutique sélectionnée est invalide.',
            'nom.required' => 'Le nom est obligatoire.',
            'email.email' => 'L\'email doit être une adresse email valide.',
            'email.unique' => 'Cet email est déjà utilisé.',
            'telephone.regex' => 'Le format du téléphone n\'est pas valide.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'boutique_id' => 'boutique',
            'nom' => 'nom',
            'prenom' => 'prénom',
            'email' => 'email',
            'telephone' => 'téléphone',
            'adresse' => 'adresse',
            'actif' => 'statut actif',
        ];
    }
}
