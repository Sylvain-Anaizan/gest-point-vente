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
            'boutique_id' => 'sometimes|exists:boutiques,id',
            'lignes_commande' => 'sometimes|array|min:1',
            'lignes_commande.*.id' => 'nullable|exists:ligne_commandes,id',
            'lignes_commande.*.nom' => 'required_with:lignes_commande|string|max:255',
            'lignes_commande.*.quantite' => 'required_with:lignes_commande|integer|min:1',
            'lignes_commande.*.prix' => 'required_with:lignes_commande|numeric|min:0',
        ];
    }

    public function messages()
    {
        return [
            'client_id.exists' => 'Le client selectionné n\'existe pas',
            'nom_client.required' => 'Le nom du client est requis',
            'nom_client.string' => 'Le nom du client doit être une chaîne de caractères',
            'nom_client.max' => 'Le nom du client ne doit pas dépasser 255 caractères',
            'telephone_client.required' => 'Le numéro de téléphone du client est requis',
            'telephone_client.string' => 'Le numéro de téléphone du client doit être une chaîne de caractères',
            'telephone_client.max' => 'Le numéro de téléphone du client ne doit pas dépasser 255 caractères',
            'adresse_origine.required' => 'L\'adresse d\'origine est requise',
            'adresse_origine.string' => 'L\'adresse d\'origine doit être une chaîne de caractères',
            'adresse_origine.max' => 'L\'adresse d\'origine ne doit pas dépasser 255 caractères',
            'adresse_destination.required' => 'L\'adresse de destination est requise',
            'adresse_destination.string' => 'L\'adresse de destination doit être une chaîne de caractères',
            'adresse_destination.max' => 'L\'adresse de destination ne doit pas dépasser 255 caractères',
            'statut.required' => 'Le statut est requis',
            'statut.in' => 'Le statut doit être en attente, en cours, livrée ou annulée',
            'montant_total.required' => 'Le montant total est requis',
            'montant_total.numeric' => 'Le montant total doit être un nombre',
            'montant_total.min' => 'Le montant total doit être supérieur à 0',
            'observations.required' => 'Les observations sont requises',
            'observations.string' => 'Les observations doivent être une chaîne de caractères',
            'observations.max' => 'Les observations ne doivent pas dépasser 255 caractères',
            'boutique_id.required' => 'La boutique est requise',
            'boutique_id.exists' => 'La boutique selectionnée n\'existe pas',
            'lignes_commande.required' => 'Les lignes de commande sont requises',
            'lignes_commande.array' => 'Les lignes de commande doivent être un tableau',
            'lignes_commande.min' => 'Les lignes de commande doivent contenir au moins un élément',
            'lignes_commande.*.id.required' => 'L\'id de la ligne de commande est requis',
            'lignes_commande.*.id.exists' => 'L\'id de la ligne de commande n\'existe pas',
            'lignes_commande.*.nom.required' => 'Le nom de la ligne de commande est requis',
            'lignes_commande.*.nom.string' => 'Le nom de la ligne de commande doit être une chaîne de caractères',
            'lignes_commande.*.nom.max' => 'Le nom de la ligne de commande ne doit pas dépasser 255 caractères',
            'lignes_commande.*.quantite.required' => 'La quantité de la ligne de commande est requise',
            'lignes_commande.*.quantite.integer' => 'La quantité de la ligne de commande doit être un entier',
            'lignes_commande.*.quantite.min' => 'La quantité de la ligne de commande doit être supérieure à 0',
            'lignes_commande.*.prix.required' => 'Le prix de la ligne de commande est requis',
            'lignes_commande.*.prix.numeric' => 'Le prix de la ligne de commande doit être un nombre',
            'lignes_commande.*.prix.min' => 'Le prix de la ligne de commande doit être supérieur à 0',
        ];
    }
}
