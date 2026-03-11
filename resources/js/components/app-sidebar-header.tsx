import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Monitor, Moon, Sun, AlertTriangle } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { appearance, updateAppearance } = useAppearance();
    const { props: inertiaProps } = usePage();
    const lowStockCount = (inertiaProps.lowStockCount as number) || 0;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 dark:bg-background/95 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-2">
                {lowStockCount > 0 && (
                    <Link
                        href="/produits"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all duration-300 animate-in fade-in slide-in-from-right-4"
                        title="Produits en stock faible"
                    >
                        <AlertTriangle className="h-4 w-4 animate-pulse" />
                        <span className="text-xs font-black">{lowStockCount} en alerte</span>
                    </Link>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md transition-all duration-300 hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary">
                            <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Changer de thème</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 bg-popover/80 backdrop-blur-xl border-white/10 rounded-xl">
                        <DropdownMenuItem
                            onClick={() => updateAppearance('light')}
                            className={cn("flex items-center gap-2 cursor-pointer transition-colors", appearance === 'light' && "bg-accent")}
                        >
                            <Sun className="h-4 w-4" />
                            <span>Clair</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => updateAppearance('dark')}
                            className={cn("flex items-center gap-2 cursor-pointer transition-colors", appearance === 'dark' && "bg-accent")}
                        >
                            <Moon className="h-4 w-4" />
                            <span>Sombre</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => updateAppearance('system')}
                            className={cn("flex items-center gap-2 cursor-pointer transition-colors", appearance === 'system' && "bg-accent")}
                        >
                            <Monitor className="h-4 w-4" />
                            <span>Système</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
