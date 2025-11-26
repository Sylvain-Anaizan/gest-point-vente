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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('nom')->index();
            $table->string('email')->nullable()->unique();
            $table->string('telephone');
            $table->string('adresse');
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('nom')->index();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('tailles', function (Blueprint $table) {
            $table->id();
            $table->string('nom')->index();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('produits', function (Blueprint $table) {
            $table->id();
            $table->string('nom')->index();
            $table->float('prix_vente');
            $table->integer('quantite');

            $table->foreignId('categorie_id')->constrained()->cascadeOnDelete();
            $table->foreignId('taille_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('tailles');
        Schema::dropIfExists('produits');
    }
};
