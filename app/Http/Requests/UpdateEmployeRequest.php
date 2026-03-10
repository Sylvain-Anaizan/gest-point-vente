<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateEmployeRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($this->route('employe'))],
            'numero' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', 'exists:roles,name'],
            'boutique_id' => ['nullable', 'exists:boutiques,id'],
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Le nom est requis',
            'name.string' => 'Le nom doit être une chaîne de caractères',
            'name.max' => 'Le nom ne doit pas dépasser 255 caractères',
            'email.required' => 'L\'email est requis',
            'email.string' => 'L\'email doit être une chaîne de caractères',
            'email.email' => 'L\'email doit être une adresse email valide',
            'email.max' => 'L\'email ne doit pas dépasser 255 caractères',
            'email.unique' => 'L\'email existe déjà',
            'numero.required' => 'Le numéro est requis',
            'numero.string' => 'Le numéro doit être une chaîne de caractères',
            'numero.max' => 'Le numéro ne doit pas dépasser 255 caractères',
            'password.required' => 'Le mot de passe est requis',
            'password.confirmed' => 'Le mot de passe doit être confirmé',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères',
            'roles.required' => 'Le rôle est requis',
            'roles.array' => 'Le rôle doit être un tableau',
            'roles.min' => 'Le rôle doit contenir au moins un élément',
            'roles.*.required' => 'Le rôle est requis',
            'roles.*.string' => 'Le rôle doit être une chaîne de caractères',
            'roles.*.exists' => 'Le rôle n\'existe pas',
            'boutique_id.required' => 'La boutique est requise',
            'boutique_id.exists' => 'La boutique n\'existe pas',
        ];
    }
}
