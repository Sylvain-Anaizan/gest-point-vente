<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->string('nom_client')->nullable(); // For cases where client is not in system
            $table->string('telephone_client')->nullable();
            $table->string('adresse_origine');
            $table->string('adresse_destination');
            $table->string('statut')->default('en_attente'); // en_attente, en_cours, livrée, annulée
            $table->decimal('montant_total', 10, 2)->default(0);
            $table->dateTime('date_commande')->useCurrent();
            $table->text('observations')->nullable();
            $table->foreignId('boutique_id')->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};
