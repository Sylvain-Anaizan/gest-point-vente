<?php

namespace App\Http\Controllers;

use App\Models\RapportJournalier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RapportJournalierController extends Controller
{
    public function index(Request $request)
    {
        $query = RapportJournalier::with('user')->orderBy('date_rapport', 'desc');

        if (!$request->user()->can('manage employes')) {
            $query->where('user_id', $request->user()->id);
        }

        return Inertia::render('rapport-journaliers/Index', [
            'rapports' => $query->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('rapport-journaliers/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'contenu' => 'required|string',
            'date_rapport' => [
                'required',
                'date',
                'after_or_equal:' . now()->subDays(7)->format('Y-m-d'),
                'before_or_equal:' . now()->format('Y-m-d'),
            ],
        ], [
            'date_rapport.after_or_equal' => 'Vous ne pouvez pas enregistrer de rapport datant de plus de 7 jours.',
            'date_rapport.before_or_equal' => 'La date du rapport ne peut pas être dans le futur.',
        ]);

        RapportJournalier::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'date_rapport' => $request->date_rapport
            ],
            [
                'contenu' => $request->contenu
            ]
        );

        return redirect()->route('rapport-journaliers.index')
            ->with('success', 'Rapport journalier enregistré avec succès.');
    }

    public function show(RapportJournalier $rapportJournalier)
    {
        if (auth()->user()->cannot('manage employes') && $rapportJournalier->user_id !== auth()->id()) {
            abort(403);
        }

        $rapportJournalier->load('user');

        return Inertia::render('rapport-journaliers/Show', [
            'rapport' => $rapportJournalier
        ]);
    }

    public function edit(RapportJournalier $rapportJournalier)
    {
        if ($rapportJournalier->user_id !== auth()->user()->id) {
            abort(403);
        }

        return Inertia::render('rapport-journaliers/Edit', [
            'rapport' => $rapportJournalier
        ]);
    }

    public function update(Request $request, RapportJournalier $rapportJournalier)
    {
        if ($rapportJournalier->user_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'contenu' => 'required|string',
        ]);

        $rapportJournalier->update([
            'contenu' => $request->contenu
        ]);

        return redirect()->route('rapport-journaliers.index')
            ->with('success', 'Rapport journalier mis à jour avec succès.');
    }
}
