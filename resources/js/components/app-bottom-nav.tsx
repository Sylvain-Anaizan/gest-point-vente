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
import { useSidebar } from '@/components/ui/sidebar';

export function AppBottomNav() {
    const { auth } = usePage().props as unknown as {
        auth: { user: { permissions: string[] } };
    };
    const user = auth.user;
    const { toggleSidebar } = useSidebar();
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
    ];

    return (
        <div className="bg-background/80 border-border/50 pb-safe fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t p-2 backdrop-blur-lg md:hidden">
            {navItems.map((item) => {
                if (
                    item.permission &&
                    !user?.permissions?.includes(item.permission)
                )
                    return null;

                const itemHref = typeof item.href === 'string' ? item.href : item.href.url;
                const isActive = url.startsWith(itemHref);

                return (
                    <Link
                        key={item.title}
                        href={itemHref}
                        className={`flex flex-col items-center justify-center rounded-xl p-2 transition-colors ${isActive
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

            <button
                onClick={toggleSidebar}
                className="flex flex-col items-center justify-center rounded-xl p-2 transition-colors text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            >
                <Menu className="h-5 w-5" />
                <span className="mt-1 text-[10px] font-medium">Menu</span>
            </button>
        </div>
    );
}
