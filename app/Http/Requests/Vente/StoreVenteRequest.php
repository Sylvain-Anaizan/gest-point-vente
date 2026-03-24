<?php

namespace App\Http\Requests\Vente;

use Illuminate\Foundation\Http\FormRequest;

class StoreVenteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Vente::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'boutique_id' => ['required', 'exists:boutiques,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'user_id' => ['required', 'exists:users,id'],
            'total' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:pending,completed,cancelled'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
