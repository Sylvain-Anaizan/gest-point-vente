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
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {

    LayoutGrid,
    Package,
    Tag,
    Ruler,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';
import POSController from '@/actions/App/Http/Controllers/POSController';
import VenteController from '@/actions/App/Http/Controllers/VenteController';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Produits',
        href: ProduitController.index.url(),
        icon: Package,
    },

    {
        title: 'POS',
        href: POSController.index.url(),
        icon: Package,
    },
    {
        title: 'Ventes',
        href: VenteController.index.url(),
        icon: Package,
    },
    {
        title: 'Clients',
        href: ClientController.index.url(),
        icon: Users,
    },
    {
        title: 'Catégories',
        href: CategoryController.index.url(),
        icon: Tag,
    },
    {
        title: 'Tailles',
        href: TailleController.index.url(),
        icon: Ruler,
    },
];

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Repository',
//         href: 'https://github.com/laravel/react-starter-kit',
//         icon: Folder,
//     },
//     {
//         title: 'Documentation',
//         href: 'https://laravel.com/docs/starter-kits#react',
//         icon: BookOpen,
//     },
// ];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
