import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({
    items = [],
    title
}: {
    items: NavItem[];
    title?: string;
}) {
    const page = usePage();

    if (items.length === 0) return null;

    return (
        <SidebarGroup className="px-3 py-2">
            {title && (
                <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2 mb-2">
                    {title}
                </SidebarGroupLabel>
            )}
            <SidebarMenu className="gap-1.5">
                {items.map((item) => {
                    const isActive = page.url.startsWith(resolveUrl(item.href));

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                className={`
                                    group/button relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-500
                                    group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center
                                    ${isActive
                                        ? 'bg-gradient-to-r from-primary/15 via-primary/[0.08] to-transparent text-primary font-bold shadow-[0_4px_12px_-4px_rgba(var(--primary),0.2)]'
                                        : 'text-foreground/70 font-medium hover:bg-accent/40 hover:text-foreground hover:scale-[1.02] active:scale-[0.98]'}
                                `}
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                                    <div className={`
                                        flex items-center justify-center rounded-lg p-1.5 transition-all duration-500 shadow-sm
                                        ${isActive
                                            ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground scale-110 group-data-[collapsible=icon]:scale-100'
                                            : 'bg-background/50 border border-border/50 text-muted-foreground group-hover/button:text-primary group-hover/button:border-primary/30 group-hover/button:bg-primary/5'}
                                    `}>
                                        {item.icon && <item.icon className="size-4 transition-transform duration-500 group-hover/button:rotate-3" />}
                                    </div>
                                    <span className="text-sm tracking-tight transition-colors duration-300 font-sans group-data-[collapsible=icon]:hidden">
                                        {item.title}
                                    </span>
                                    {isActive && (
                                        <div className="absolute left-[-4px] group-data-[collapsible=icon]:left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary),0.5)] animate-in slide-in-from-left-2 fade-in duration-500" />
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
