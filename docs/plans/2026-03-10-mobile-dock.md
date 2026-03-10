# Ajout d'un Dock Mobile de Navigation — Plan d'Implémentation

**Objectif :** Ajouter une barre de navigation fixe en bas de l'écran contenant 5 raccourcis clés (Dashboard, POS, Ventes, Produits, Menu) visible uniquement sur mobile.

**Architecture :** Créer un composant `AppBottomNav` réutilisant les icônes de Lucide React et le composant `<Link />` d'Inertia.js. Injecter ce composant dans le `AppSidebarLayout` existant et s'assurer qu'il ne s'affiche que sur les petits écrans (`md:hidden`).

**Stack Technique :** React, Inertia.js, Tailwind CSS, Lucide React (Icônes), Laravel Permissions via props Inertia.

---

### Tâche 1 : Créer le composant `AppBottomNav`

**Fichiers :**

- Créer : `resources/js/components/app-bottom-nav.tsx`

**Étape 1 : Écrire l'implémentation du composant**

```tsx
import { Link, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import POSController from '@/actions/App/Http/Controllers/POSController';
import VenteController from '@/actions/App/Http/Controllers/VenteController';
import ProduitController from '@/actions/App/Http/Controllers/ProduitController';
import {
    LayoutGrid,
    ShoppingBag,
    ReceiptText,
    PackageSearch,
    Menu,
} from 'lucide-react';

export function AppBottomNav() {
    const { auth } = usePage().props as unknown as {
        auth: { user: { permissions: string[] } };
    };
    const user = auth.user;

    // On extrait le chemin actuel pour surligner le lien actif si besoin (optionnel mais recommandé)
    const { url } = usePage();

    const navItems = [
        {
            title: 'Accueil',
            href: dashboard(),
            icon: LayoutGrid,
            permission: 'view dashboard',
        },
        {
            title: 'POS',
            href: POSController.index.url(),
            icon: ShoppingBag,
            permission: 'manage sales',
        },
        {
            title: 'Ventes',
            href: VenteController.index.url(),
            icon: ReceiptText,
            permission: 'manage sales',
        },
        {
            title: 'Produits',
            href: ProduitController.index.url(),
            icon: PackageSearch,
            permission: 'manage products',
        },
        {
            // Ce lien agit comme un déclencheur pour le menu latéral mobile (géré par le SidebarProvider de shadcn/ui)
            title: 'Menu',
            href: '#',
            icon: Menu,
            isMenuTrigger: true,
        },
    ];

    return (
        <div className="bg-background/80 border-border/50 pb-safe fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t p-2 backdrop-blur-lg md:hidden">
            {navItems.map((item) => {
                // Vérification des permissions
                if (
                    item.permission &&
                    !user?.permissions?.includes(item.permission)
                )
                    return null;

                const isActive = url.startsWith(item.href) && item.href !== '#';

                return (
                    <Link
                        key={item.title}
                        href={item.href}
                        className={`flex flex-col items-center justify-center rounded-xl p-2 transition-colors ${
                            isActive
                                ? 'text-primary'
                                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                        }`}
                        preserveState
                    >
                        <item.icon
                            className={`h-5 w-5 ${isActive ? 'fill-primary/20' : ''}`}
                        />
                        <span className="mt-1 text-[10px] font-medium">
                            {item.title}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
```

**Étape 2 : Committer**

```bash
git add resources/js/components/app-bottom-nav.tsx
git commit -m "feat: ajouter le composant AppBottomNav pour la navigation mobile"
```

---

### Tâche 2 : Intégrer `AppBottomNav` au layout

**Fichiers :**

- Modifier : `resources/js/layouts/app/app-sidebar-layout.tsx`

**Étape 1 : Importer et placer le composant**

Modification de `resources/js/layouts/app/app-sidebar-layout.tsx` :

```tsx
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { AppBottomNav } from '@/components/app-bottom-nav'; // <-- AJOUT
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            {/* Ajout d'un padding-bottom mb-20 ou pb-20 sur mobile pour éviter que le contenu ne soit caché sous le dock */}
            <AppContent
                variant="sidebar"
                className="overflow-x-hidden p-2 pb-24 md:p-6 md:pb-6"
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            <AppBottomNav /> {/* <-- AJOUT */}
        </AppShell>
    );
}
```

**Étape 2 : Vérification visuelle (Tests end-to-end / manuel)**

- Lancer la commande `npm run build` ou `npm run dev` pour compiler les assets.
- Vérifier dans le navigateur.
- Sur écran de bureau : Le Bottom Nav **ne doit pas** être visible (`md:hidden`).
- Sur smartphone (ou en redimensionnant la fenêtre) : Le Bottom Nav **doit** apparaître en bas de l'écran. Le contenu devrait pouvoir défiler au-dessus du dock sans être coupé à la fin (grâce au `pb-24`).

**Étape 3 : Committer**

```bash
git add resources/js/layouts/app/app-sidebar-layout.tsx
git commit -m "feat(layout): intégrer AppBottomNav dans AppSidebarLayout pour les utilisateurs mobiles"
```
