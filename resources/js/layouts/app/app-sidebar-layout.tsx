import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { AppBottomNav } from '@/components/app-bottom-nav';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    showBottomNav = true,
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[]; showBottomNav?: boolean }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className={`overflow-x-hidden p-2 md:p-6 md:pb-6 ${showBottomNav ? 'pb-24' : 'pb-6'}`}>
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            {showBottomNav && <AppBottomNav />}
        </AppShell>
    );
}
