<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reçu Commande {{ $commande->numero }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.5; font-size: 14px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #000; }
        .info-section { margin-bottom: 20px; overflow: hidden; }
        .info-box { width: 45%; float: left; }
        .info-box.right { float: right; text-align: right; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #f2f2f2; text-align: left; padding: 10px; border-bottom: 2px solid #ddd; }
        td { padding: 10px; border-bottom: 1px solid #eee; }
        .total-section { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="header">
        <h1>REÇU DE COMMANDE</h1>
        <p>#{{ $commande->numero }}</p>
    </div>

    <div class="info-section">
        <div class="info-box">
            <strong>Émetteur :</strong><br>
            {{ $commande->boutique->nom }}<br>
            {{ $commande->boutique->adresse ?? '' }}
        </div>
        <div class="info-box right">
            <strong>Client :</strong><br>
            {{ $commande->nom_client ?? $commande->client?->nom ?? 'Client Divers' }}<br>
            {{ $commande->telephone_client ?? $commande->client?->telephone ?? '' }}<br>
            {{ $commande->adresse_destination }}
        </div>
    </div>

    <div class="info-section">
        <p><strong>Date :</strong> {{ $commande->date_commande->format('d/m/Y H:i') }}</p>
        <p><strong>Statut :</strong> {{ ucfirst($commande->statut) }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Désignation</th>
                <th>Quantité</th>
                <th>Prix Unitaire</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($commande->lignesCommande as $ligne)
                <tr>
                    <td>{{ $ligne->nom }}</td>
                    <td>{{ $ligne->quantite }}</td>
                    <td>{{ number_format($ligne->prix, 2, ',', ' ') }} FCFA</td>
                    <td>{{ number_format($ligne->total, 2, ',', ' ') }} FCFA</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total-section">
        TOTAL : {{ number_format($commande->montant_total, 2, ',', ' ') }} FCFA
    </div>

    @if($commande->observations)
        <div style="margin-top: 20px;">
            <strong>Observations :</strong><br>
            {{ $commande->observations }}
        </div>
    @endif

    <div class="footer">
        Merci de votre confiance !<br>
        Généré le {{ date('d/m/Y H:i') }}
    </div>
</body>
</html>
