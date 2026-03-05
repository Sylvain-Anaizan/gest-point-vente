<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCommandeRequest extends FormRequest
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
            'adresse_origine' => 'sometimes|string|max:255',
            'adresse_destination' => 'sometimes|string|max:255',
            'statut' => 'sometimes|string|in:en_attente,en_cours,livrée,annulée',
            'montant_total' => 'sometimes|numeric|min:0',
            'observations' => 'nullable|string',
            'lignes_commande' => 'sometimes|array|min:1',
            'lignes_commande.*.id' => 'nullable|exists:ligne_commandes,id',
            'lignes_commande.*.nom' => 'required_with:lignes_commande|string|max:255',
            'lignes_commande.*.quantite' => 'required_with:lignes_commande|integer|min:1',
            'lignes_commande.*.prix' => 'required_with:lignes_commande|numeric|min:0',
        ];
    }
}
