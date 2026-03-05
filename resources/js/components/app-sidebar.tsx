import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
import ClientController from '@/actions/App/Http/Controllers/ClientController';
import TailleController from '@/actions/App/Http/Controllers/TailleController';
import ProduitController from '@/actions/App/Http/Controllers/ProduitController';
import BoutiqueController from '@/actions/App/Http/Controllers/BoutiqueController';
import UniteController from '@/actions/App/Http/Controllers/UniteController';
import { Link, usePage } from '@inertiajs/react';
import {

    LayoutGrid,
    Store,
    Tag,
    Ruler,
    Users,
    ShoppingBag,
    ReceiptText,
    PackageSearch,
    UserCheck,
    Settings2,
    Truck,
} from 'lucide-react';
import AppLogo from './app-logo';
import POSController from '@/actions/App/Http/Controllers/POSController';
import VenteController from '@/actions/App/Http/Controllers/VenteController';
import EmployeController from '@/actions/App/Http/Controllers/EmployeController';
import RapportController from '@/actions/App/Http/Controllers/RapportController';
import MouvementStockController from '@/actions/App/Http/Controllers/MouvementStockController';
import { ArrowLeftRight, PieChart } from 'lucide-react';

const navigationGroups = [
    {
        title: 'Tableau de bord',
        items: [
            { title: 'Vue d\'ensemble', href: dashboard(), icon: LayoutGrid },
            { title: 'Point de Vente (POS)', href: POSController.index.url(), icon: ShoppingBag },
            { title: 'Rapports & Analyses', href: RapportController.index.url(), icon: PieChart },
        ]
    },
    {
        title: 'Commerce & Ventes',
        items: [
            { title: 'Ventes & Factures', href: VenteController.index.url(), icon: ReceiptText },
            { title: 'Produits & Stocks', href: ProduitController.index.url(), icon: PackageSearch },
            { title: 'Mouvements stock', href: MouvementStockController.index.url(), icon: ArrowLeftRight },
            { title: 'Clients', href: ClientController.index.url(), icon: Users },
            { title: 'Suivi Commandes', href: '/commandes', icon: Truck },
        ]
    },
    {
        title: 'Administration',
        items: [
            { title: 'Boutiques', href: BoutiqueController.index.url(), icon: Store },
            { title: 'Catégories', href: CategoryController.index.url(), icon: Tag },
            { title: 'Tailles', href: TailleController.index.url(), icon: Ruler },
            { title: 'Unités de mesure', href: UniteController.index.url(), icon: Ruler },
            { title: 'Équipe & Staff', href: EmployeController.index.url(), icon: UserCheck },
        ]
    },
    {
        title: 'Configuration',
        items: [
            { title: 'Paramètres', href: '/settings/profile', icon: Settings2 },
        ]
    }
];

export function AppSidebar() {
    const { auth } = usePage().props as unknown as { auth: { user: { name: string; email: string; role: string; avatar?: string } } };
    const user = auth.user;

    const adminOnly = ['Boutiques', 'Catégories', 'Tailles', 'Unités de mesure', 'Équipe & Staff'];

    return (
        <Sidebar collapsible="icon" variant="floating" className="border-r border-white/5 bg-background/50 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-500">
            <SidebarHeader className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-primary/5 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center transition-all duration-300 group/logo">
                            <Link href={dashboard()} prefetch className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/30 group-hover/logo:scale-105 group-data-[collapsible=icon]:scale-90 transition-transform duration-500 shrink-0">
                                    <AppLogo />
                                </div>
                                <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate font-black tracking-tighter text-lg bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                        Gest <span className="text-primary italic ">Anaizan</span>
                                    </span>
                                    <span className="truncate text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 font-bold font-mono">
                                        Version 1.0
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-0 py-2 scrollbar-hide">
                {navigationGroups.map((group) => {
                    const filteredItems = group.items.filter(item => {
                        if (adminOnly.includes(item.title)) {
                            return user?.role === 'admin';
                        }
                        return true;
                    });

                    return (
                        <NavMain
                            key={group.title}
                            items={filteredItems}
                            title={group.title}
                        />
                    );
                })}
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-border/50 bg-accent/5 backdrop-blur-md">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
