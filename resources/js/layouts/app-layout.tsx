import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    showBottomNav?: boolean;
}

export default ({ children, breadcrumbs, showBottomNav = true, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} showBottomNav={showBottomNav} {...props}>
        {children}
        <Toaster />
    </AppLayoutTemplate>
);
