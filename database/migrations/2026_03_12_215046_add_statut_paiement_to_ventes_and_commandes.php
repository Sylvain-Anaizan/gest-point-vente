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
        Schema::table('ventes', function (Blueprint $table) {
            $table->string('statut_paiement')->default('Non payée')->after('statut');
        });

        Schema::table('commandes', function (Blueprint $table) {
            $table->string('statut_paiement')->default('Non payée')->after('statut');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ventes', function (Blueprint $table) {
            $table->dropColumn('statut_paiement');
        });

        Schema::table('commandes', function (Blueprint $table) {
            $table->dropColumn('statut_paiement');
        });
    }
};
