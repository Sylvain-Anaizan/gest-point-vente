# Implémentation : Rapports Journaliers des Employés

**Objectif :** Permettre aux employés de créer et consulter des rapports journaliers en texte enrichi, et aux managers de superviser ces rapports.

**Architecture :**

- **Backend (Laravel) :** Création du modèle `RapportJournalier`, de la migration, du contrôleur `RapportJournalierController`, et des routes standards (`index`, `store`, `show`).
- **Frontend (Inertia + React) :** Création d'une vue de liste (`Index`), et d'une vue de création (`Create`). On utilisera un éditeur de texte léger. Puisque l'utilisateur n'a pas spécifié d'éditeur, nous allons configurer **react-quill** (très courant et simple) ou construire un composant texte basique si l'on ne veut pas ajouter de dépendance npm lourde. _Pour rester dans l'écosystème `shadcn`, nous allons plutôt inclure un éditeur compatible en installant une librairie fiable comme `react-quill`._

**Stack Technique :** Laravel 12, React 19, Inertia v2, Tailwind CSS, `react-quill`.

---

## Modèle de Données et Backend

### Tâche 1 : Modèle, Migration et Controller

**Fichiers concernés :**

- `app/Models/RapportJournalier.php` (À créer)
- `database/migrations/xxxx_xx_xx_create_rapport_journaliers_table.php` (À créer)
- `app/Http/Controllers/RapportJournalierController.php` (À créer)
- `routes/web.php` (À modifier)

**Implémentation Backend :**

1. Création de la migration (`artisan make:model RapportJournalier -mc`) :
   ```php
   $table->id();
   $table->foreignId('user_id')->constrained()->onDelete('cascade');
   $table->date('date_rapport');
   $table->longText('contenu');
   $table->timestamps();
   ```
2. Dans le Model `RapportJournalier` : protéger les filiables (`fillable = ['user_id', 'date_rapport', 'contenu']`) et ajouter la relation `user()`.
3. Dans `RapportJournalierController` :
   - `index` : Récupère les rapports. Si l'utilisateur actuel peut `manage employes`, il voit tous les rapports (avec `$query->with('user')`), sinon il ne voit que les siens (`$query->where('user_id', auth()->id())`).
   - `store` : Valide que `contenu` est présent. Enregistre le rapport pour la date du jour :
     ```php
     RapportJournalier::updateOrCreate(
         ['user_id' => auth()->id(), 'date_rapport' => today()],
         ['contenu' => $request->contenu]
     );
     ```

## Frontend et Interfaces

### Tâche 2 : Dépendance de Texte Enrichi

1. Exécuter : `npm install react-quill --save`
2. Créer un composant réutilisable `resources/js/components/RichTextEditor.tsx`

### Tâche 3 : Vues React (Inertia)

**Fichiers :**

- `resources/js/pages/rapport-journaliers/Index.tsx` (Création)
  - Liste sous forme de table (ou cartes) les rapports passés.
  - Bouton "Rédiger le rapport d'aujourd'hui".
- `resources/js/pages/rapport-journaliers/Create.tsx` (Création)
  - Affiche l'éditeur `RichTextEditor`.
  - Bouton de soumission via `@inertiajs/react` `useForm`.

### Tâche 4 : Lien dans la Navigation

**Fichiers :**

- `resources/js/components/app-sidebar.tsx`
  - Ajouter un lien vers la route des rapports journaliers sous le groupe "Équipe & Staff" (ou "Tableau de bord").

## Plan de Vérification

- **Vérification Automatisée (Backend) :**
  - Exécuter la commande de migration : `php artisan migrate` et observer que la table est créée sans erreur.
- **Vérification TypeScript/UI :**
  - Run `npm run types` pour valider les props et les contrôleurs Wayfinder.
  - Run `npm run build` pour vérifier la compilation des paquets importés (react-quill).
- **Vérification Manuelle (User) :**
  - L'utilisateur devra se connecter, aller dans "Mes Rapports".
  - Rédiger un texte (avec du gras, une liste) et cliquer sur Valider.
  - Vérifier que le texte formaté s'affiche correctement dans l'historique.
