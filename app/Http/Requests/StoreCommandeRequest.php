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

    public function messages()
    {
        return [
            'client_id.exists' => "Le client selectionné n'existe pas",
            'nom_client.required' => "Le champ nom du client est requis",
            'nom_client.string' => "Le champ nom du client doit être une chaîne de caractères",
            'nom_client.max' => "Le champ nom du client ne doit pas dépasser 255 caractères",
            'telephone_client.required' => "Le champ telephone du client est requis",
            'telephone_client.string' => "Le champ telephone du client doit être une chaîne de caractères",
            'telephone_client.max' => "Le champ telephone du client ne doit pas dépasser 255 caractères",
            'adresse_origine.required' => "Le champ adresse d'origine est requis",
            'adresse_origine.string' => "Le champ adresse d'origine doit être une chaîne de caractères",
            'adresse_origine.max' => "Le champ adresse d'origine ne doit pas dépasser 255 caractères",
            'adresse_destination.required' => "Le champ adresse de destination est requis",
            'adresse_destination.string' => "Le champ adresse de destination doit être une chaîne de caractères",
            'adresse_destination.max' => "Le champ adresse de destination ne doit pas dépasser 255 caractères",
            'statut.required' => "Le champ statut est requis",
            'statut.string' => "Le champ statut doit être une chaîne de caractères",
            'statut.in' => "Le champ statut doit être en_attente, en_cours, livrée ou annulée",
            'montant_total.required' => "Le champ montant total est requis",
            'montant_total.numeric' => "Le champ montant total doit être un nombre",
            'montant_total.min' => "Le champ montant total ne doit pas être négatif",
            'observations.required' => "Le champ observations est requis",
            'observations.string' => "Le champ observations doit être une chaîne de caractères",
            'boutique_id.exists' => "La boutique selectionnée n'existe pas",
            'lignes_commande.required' => "Le champ lignes de commande est requis",
            'lignes_commande.array' => "Le champ lignes de commande doit être un tableau",
            'lignes_commande.min' => "Le champ lignes de commande doit contenir au moins un élément",
            'lignes_commande.*.nom.required' => "Le champ nom de la ligne de commande est requis",
            'lignes_commande.*.nom.string' => "Le champ nom de la ligne de commande doit être une chaîne de caractères",
            'lignes_commande.*.nom.max' => "Le champ nom de la ligne de commande ne doit pas dépasser 255 caractères",
            'lignes_commande.*.quantite.required' => "Le champ quantite de la ligne de commande est requis",
            'lignes_commande.*.quantite.integer' => "Le champ quantite de la ligne de commande doit être un entier",
            'lignes_commande.*.quantite.min' => "Le champ quantite de la ligne de commande ne doit pas être négatif",
            'lignes_commande.*.prix.required' => "Le champ prix de la ligne de commande est requis",
            'lignes_commande.*.prix.numeric' => "Le champ prix de la ligne de commande doit être un nombre",
            'lignes_commande.*.prix.min' => "Le champ prix de la ligne de commande ne doit pas être négatif",
        ];
    }
}
