import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group flex items-center gap-3 px-3 py-6 rounded-xl transition-all duration-500 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground border border-white/5 hover:border-sidebar-border shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-lg bg-background/40 backdrop-blur-md active:scale-95 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center"
                            data-test="sidebar-menu-button"
                        >
                            <div className="flex-1 overflow-hidden">
                                <UserInfo user={auth.user} />
                            </div>
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted/20 group-hover:bg-primary/20 group-data-[state=open]:rotate-180 transition-all duration-500">
                                <ChevronsUpDown className="size-3 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-2xl p-2 bg-popover/80 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-300"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                    ? 'left'
                                    : 'top'
                        }
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
