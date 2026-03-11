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
        Schema::table('ligne_commandes', function (Blueprint $table) {
            $table->foreignId('produit_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('variante_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ligne_commandes', function (Blueprint $table) {
            $table->dropForeign(['produit_id']);
            $table->dropForeign(['variante_id']);
            $table->dropColumn(['produit_id', 'variante_id']);
        });
    }
};
