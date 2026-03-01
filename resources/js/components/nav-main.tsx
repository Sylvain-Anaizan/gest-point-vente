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
            <SidebarMenu className="gap-1">
                {items.map((item) => {
                    const isActive = page.url.startsWith(resolveUrl(item.href));

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                className={`
                                    group/button relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300
                                    ${isActive
                                        ? 'bg-primary/10 text-primary font-bold shadow-sm shadow-primary/5'
                                        : 'text-foreground/75 font-medium hover:bg-accent/80 hover:text-foreground hover:pl-4'}
                                `}
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch>
                                    <div className={`
                                        flex items-center justify-center rounded-lg p-1.5 transition-colors duration-300
                                        ${isActive ? 'bg-primary text-primary-foreground' : 'bg-transparent group-hover/button:bg-accent'}
                                    `}>
                                        {item.icon && <item.icon className="size-4" />}
                                    </div>
                                    <span className="text-sm tracking-tight">{item.title}</span>
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full animate-in slide-in-from-left-1 duration-300" />
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
