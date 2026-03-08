<?php

namespace App\Http\Controllers;

use App\Models\LigneCommande;
use Illuminate\Http\Request;

class LigneCommandeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return LigneCommande::all();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('ligne_commande.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        return LigneCommande::create($request->all());
    }

    /**
     * Display the specified resource.
     */
    public function show(LigneCommande $ligneCommande)
    {
        return $ligneCommande;
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(LigneCommande $ligneCommande)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LigneCommande $ligneCommande)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LigneCommande $ligneCommande)
    {
        //
    }
}
