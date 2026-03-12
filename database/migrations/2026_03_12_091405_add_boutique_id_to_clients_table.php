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
        Schema::table('clients', function (Blueprint $table) {
            $table->foreignId('boutique_id')->nullable()->constrained()->nullOnDelete()->after('id');
        });

        // Set existing clients to the first boutique if any exist, then make nullable=false
        // We keep nullable to avoid breaking existing data; enforce at application level.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropForeign(['boutique_id']);
            $table->dropColumn('boutique_id');
        });
    }
};
