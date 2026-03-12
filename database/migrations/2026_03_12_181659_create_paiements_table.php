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
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vente_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('commande_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('montant', 10, 2);
            $table->string('mode_paiement'); // espèces, carte, virement, mobile_money, chèque
            $table->string('reference')->nullable();
            $table->dateTime('date_paiement')->useCurrent();
            $table->text('commentaire')->nullable();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('boutique_id')->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
