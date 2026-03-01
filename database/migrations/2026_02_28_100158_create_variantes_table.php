<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Création de la table variantes
        Schema::create('variantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produit_id')->constrained()->cascadeOnDelete();
            $table->foreignId('taille_id')->nullable()->constrained()->cascadeOnDelete();
            $table->decimal('prix_vente', 10, 2);
            $table->integer('quantite')->default(0);
            $table->timestamps();
        });

        // 2. Ajout de variante_id aux tables liées
        Schema::table('mouvement_stocks', function (Blueprint $table) {
            $table->foreignId('variante_id')->nullable()->after('produit_id')->constrained('variantes')->nullOnDelete();
        });

        Schema::table('ligne_ventes', function (Blueprint $table) {
            $table->foreignId('variante_id')->nullable()->after('produit_id')->constrained('variantes')->nullOnDelete();
        });

        // 3. Migration des données existantes
        $produits = DB::table('produits')->get();
        foreach ($produits as $produit) {
            $varianteId = DB::table('variantes')->insertGetId([
                'produit_id' => $produit->id,
                'taille_id' => $produit->taille_id,
                'prix_vente' => $produit->prix_vente,
                'quantite' => $produit->quantite,
                'created_at' => $produit->created_at,
                'updated_at' => $produit->updated_at,
            ]);

            // Mettre à jour les mouvements de stock et lignes de vente pour pointer vers la variante
            DB::table('mouvement_stocks')->where('produit_id', $produit->id)->update(['variante_id' => $varianteId]);
            DB::table('ligne_ventes')->where('produit_id', $produit->id)->update(['variante_id' => $varianteId]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ligne_ventes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('variante_id');
        });

        Schema::table('mouvement_stocks', function (Blueprint $table) {
            $table->dropConstrainedForeignId('variante_id');
        });

        Schema::dropIfExists('variantes');
    }
};
