<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreEmployeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // L'autorisation sera gérée par les middlewares de route
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
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'numero' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', 'exists:roles,name'],
            'boutique_id' => ['nullable', 'exists:boutiques,id'],
        ];
    }

    public function messages()
    {
        return [
            "name.required" => "Le champ nom est requis",
            "name.string" => "Le champ nom doit être une chaîne de caractères",
            "name.max" => "Le champ nom ne doit pas dépasser 255 caractères",
            "email.required" => "Le champ email est requis",
            "email.string" => "Le champ email doit être une chaîne de caractères",
            "email.email" => "Le champ email doit être une adresse email valide",
            "email.max" => "Le champ email ne doit pas dépasser 255 caractères",
            "email.unique" => "Le champ email existe deja",
            "numero.required" => "Le champ numero est requis",
            "numero.string" => "Le champ numero doit être une chaîne de caractères",
            "numero.max" => "Le champ numero ne doit pas dépasser 255 caractères",
            "password.required" => "Le champ mot de passe est requis",
            "password.confirmed" => "Le champ mot de passe doit être confirmé",
            "password.min" => "Le champ mot de passe doit contenir au moins 8 caractères",
            "roles.required" => "Le champ roles est requis",
            "roles.array" => "Le champ roles doit être un tableau",
            "roles.min" => "Le champ roles doit contenir au moins un élément",
            "roles.*.required" => "Le champ role est requis",
            "roles.*.string" => "Le champ role doit être une chaîne de caractères",
            "roles.*.exists" => "Le champ role doit exister",
            "boutique_id.required" => "Le champ boutique est requis",
            "boutique_id.exists" => "La boutique selectionnée n'existe pas",
        ];
    }
}
