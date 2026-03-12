<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePaiementRequest extends FormRequest
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
            'montant' => 'required|numeric|min:0.01',
            'mode_paiement' => 'required|string|in:espèces,carte,virement,mobile_money,chèque',
            'reference' => 'nullable|string|max:255',
            'date_paiement' => 'required|date',
            'commentaire' => 'nullable|string',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'montant.required' => 'Le montant du paiement est requis.',
            'montant.numeric' => 'Le montant doit être un nombre.',
            'montant.min' => 'Le montant doit être supérieur à zéro.',
            'mode_paiement.required' => 'Le mode de paiement est requis.',
            'mode_paiement.in' => 'Le mode de paiement doit être : espèces, carte, virement, mobile_money ou chèque.',
            'date_paiement.required' => 'La date du paiement est requise.',
            'date_paiement.date' => 'La date du paiement doit être une date valide.',
        ];
    }
}
