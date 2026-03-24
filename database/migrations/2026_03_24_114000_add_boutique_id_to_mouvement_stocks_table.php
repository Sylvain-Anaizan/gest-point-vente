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
        if (!Schema::hasColumn('mouvement_stocks', 'boutique_id')) {
            Schema::table('mouvement_stocks', function (Blueprint $table) {
                // On ajoute boutique_id sil n'existe pas déjà
                // (Suite à l'ajout manuel dans la migration de création de 2025)
                $table->foreignId('boutique_id')->after('id')->nullable()->constrained()->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('mouvement_stocks', 'boutique_id')) {
            Schema::table('mouvement_stocks', function (Blueprint $table) {
                $table->dropForeign(['boutique_id']);
                $table->dropColumn('boutique_id');
            });
        }
    }
};
