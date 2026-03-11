import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, type ReactNode, useRef } from 'react';
import { Toaster, toast } from 'sonner';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    showBottomNav?: boolean;
}

export default function AppLayout({ children, breadcrumbs, showBottomNav = true, ...props }: AppLayoutProps) {
    const { props: inertiaProps } = usePage();
    const flash = inertiaProps.flash as any;
    const lowStockCount = inertiaProps.lowStockCount as number;

    // Tracking refs to avoid duplicate toasts (especially in React Strict Mode)
    const lastFlashRef = useRef<string | null>(null);
    const stockAlertShownRef = useRef(false);

    useEffect(() => {
        // Create a unique key for the current flash messages
        const flashKey = JSON.stringify(flash);

        // Only show if the flash has changed and is not empty
        if (flash && flashKey !== lastFlashRef.current) {
            if (flash.success) {
                toast.success(flash.success);
            }
            if (flash.error) {
                toast.error(flash.error);
            }
            if (flash.warning) {
                toast.warning(flash.warning);
            }
            if (flash.info) {
                toast.info(flash.info);
            }
            lastFlashRef.current = flashKey;
        }
    }, [flash]);

    useEffect(() => {
        // Show stock alert only once per full page load/mount
        if (lowStockCount > 0 && !stockAlertShownRef.current) {
            toast.error(`Attention : ${lowStockCount} produits sont en stock critique !`, {
                description: "Veuillez consulter l'inventaire pour réapprovisionner.",
                duration: 6000,
                action: {
                    label: "Voir",
                    onClick: () => window.location.href = "/produits"
                }
            });
            stockAlertShownRef.current = true;
        }
    }, [lowStockCount]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} showBottomNav={showBottomNav} {...props}>
            {children}
            <Toaster position="top-right" closeButton richColors />
        </AppLayoutTemplate>
    );
}
