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
        Schema::table('produits', function (Blueprint $table) {
            $table->dropForeign(['taille_id']);
            $table->dropColumn(['prix_vente', 'quantite', 'taille_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->decimal('prix_vente', 10, 2)->after('nom');
            $table->integer('quantite')->default(0)->after('prix_vente');
            $table->foreignId('taille_id')->nullable()->after('categorie_id')->constrained()->nullOnDelete();
        });
    }
};
