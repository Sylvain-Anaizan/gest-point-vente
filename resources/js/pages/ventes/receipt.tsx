import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Client {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Produit {
    id: number;
    nom: string;
}

interface LigneVente {
    id: number;
    produit_id: number;
    quantite: number;
    prix_unitaire: number;
    sous_total: number;
    produit: Produit;
    designation_originale?: string;
}

interface Vente {
    id: number;
    numero: string;
    client_id: number | null;
    user_id: number;
    montant_total: number | string;
    statut: 'complétée' | 'annulée';
    mode_paiement: 'espèces' | 'carte' | 'virement' | 'mobile_money';
    created_at: string;
    updated_at: string;
    client?: Client;
    user: User;
    lignes: LigneVente[];
}

export default function VentesReceipt({ vente }: { vente: Vente }) {
    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatMontant = (montant: number | string | null | undefined): string => {
        let numericValue: number;

        if (typeof montant === 'string') {
            const cleaned = montant.replace(/[^\d.,-]/g, '').replace(',', '.');
            numericValue = parseFloat(cleaned);
        } else if (typeof montant === 'number') {
            numericValue = montant;
        } else if (montant === null || montant === undefined) {
            return '0';
        } else {
            numericValue = Number(montant);
        }

        if (isNaN(numericValue)) {
            return '0';
        }

        return Math.round(numericValue).toLocaleString('fr-FR');
    };

    return (
        <>
            <Head title={`Reçu ${vente.numero}`} />

            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        margin: 0;
                        padding: 20px;
                    }
                    .receipt-container {
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
                
                @page {
                    size: A4;
                    margin: 1cm;
                }
            `}</style>

            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Print Button - Hidden when printing */}
                    <div className="no-print mb-6 flex justify-end">
                        <Button onClick={handlePrint} size="lg" className="gap-2">
                            <Printer className="h-5 w-5" />
                            Imprimer le reçu
                        </Button>
                    </div>

                    {/* Receipt Container */}
                    <div className="receipt-container bg-white shadow-lg border border-gray-200 p-8 md:p-12">
                        {/* Header with Logo */}
                        <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
                            <img
                                src="/anaizan.png"
                                alt="Anaizan"
                                className="h-20 mx-auto mb-4"
                            />
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                REÇU DE VENTE
                            </h1>
                            <p className="text-gray-600">
                                Boutique Anaizan - Mode et Accessoires
                            </p>
                        </div>

                        {/* Sale Information */}
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                                    Informations de vente
                                </h2>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-gray-900">
                                        {vente.numero}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {formatDate(vente.created_at)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Vendeur: {vente.user.name}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                                    Client
                                </h2>
                                {vente.client ? (
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold text-gray-900">
                                            {vente.client.nom} {vente.client.prenom}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Tél: {vente.client.telephone}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600 italic">
                                        Client de passage
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-8">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-800">
                                        <th className="text-left py-3 px-2 font-semibold text-gray-900">
                                            Article
                                        </th>
                                        <th className="text-center py-3 px-2 font-semibold text-gray-900">
                                            Qté
                                        </th>
                                        <th className="text-right py-3 px-2 font-semibold text-gray-900">
                                            P.U.
                                        </th>
                                        <th className="text-right py-3 px-2 font-semibold text-gray-900">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vente.lignes.map((ligne, index) => (
                                        <tr
                                            key={ligne.id}
                                            className={
                                                index % 2 === 0
                                                    ? 'bg-gray-50'
                                                    : 'bg-white'
                                            }
                                        >
                                            <td className="py-3 px-2 text-gray-900">
                                                {ligne.designation_originale || ligne.produit.nom}
                                            </td>
                                            <td className="py-3 px-2 text-center text-gray-900">
                                                {ligne.quantite}
                                            </td>
                                            <td className="py-3 px-2 text-right text-gray-900">
                                                {ligne.prix_unitaire.toLocaleString(
                                                    'fr-FR'
                                                )}{' '}
                                                F
                                            </td>
                                            <td className="py-3 px-2 text-right font-semibold text-gray-900">
                                                {ligne.sous_total.toLocaleString(
                                                    'fr-FR'
                                                )}{' '}
                                                F
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="border-t-2 border-gray-800 pt-4 mb-8">
                            <div className="flex justify-end">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Sous-total:
                                        </span>
                                        <span className="text-gray-900">
                                            {formatMontant(vente.montant_total)} F
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">TVA (0%):</span>
                                        <span className="text-gray-900">0 F</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold border-t-2 border-gray-300 pt-2">
                                        <span className="text-gray-900">TOTAL:</span>
                                        <span className="text-gray-900">
                                            {formatMontant(vente.montant_total)} FCFA
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">
                                    Mode de paiement:
                                </span>
                                <span className="text-lg font-bold text-gray-900 capitalize">
                                    {vente.mode_paiement.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-300 pt-6 text-center space-y-2">
                            <p className="text-sm text-gray-600">
                                Merci pour votre confiance !
                            </p>
                            <p className="text-xs text-gray-500">
                                Ce reçu fait foi de votre achat
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                                Reçu #{vente.numero} - Imprimé le{' '}
                                {new Date().toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
