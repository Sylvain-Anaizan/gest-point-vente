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
        Schema::table('variantes', function (Blueprint $table) {
            $table->integer('seuil_alerte')->default(5)->after('quantite');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('variantes', function (Blueprint $table) {
            $table->dropColumn('seuil_alerte');
        });
    }
};
