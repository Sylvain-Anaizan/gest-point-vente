<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommandeRequest extends FormRequest
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
            'client_id' => 'nullable|exists:clients,id',
            'nom_client' => 'nullable|string|max:255',
            'telephone_client' => 'nullable|string|max:255',
            'adresse_origine' => 'required|string|max:255',
            'adresse_destination' => 'required|string|max:255',
            'statut' => 'required|string|in:en_attente,en_cours,livrée,annulée',
            'montant_total' => 'required|numeric|min:0',
            'observations' => 'nullable|string',
            'boutique_id' => 'nullable|exists:boutiques,id',
            'lignes_commande' => 'required|array|min:1',
            'lignes_commande.*.nom' => 'required|string|max:255',
            'lignes_commande.*.quantite' => 'required|integer|min:1',
            'lignes_commande.*.prix' => 'required|numeric|min:0',
        ];
    }
}
