import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from '@/lib/utils';
import {
    Pagination as ShadcnPagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface LinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: LinkItem[];
    meta?: {
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
    };
    className?: string;
}

/**
 * Standard Shadcn UI Pagination wrapper for Inertia.js
 */
export default function Pagination({ links, meta, className }: PaginationProps) {
    if (links.length <= 3 && !meta) return null;

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 w-full px-2 py-4", className)}>
            {/* Standard Results Summary */}
            {meta && (
                <div className="text-sm text-muted-foreground">
                    Affichage de <span className="font-medium text-foreground">{meta.from || 0}</span> à <span className="font-medium text-foreground">{meta.to || 0}</span> sur <span className="font-medium text-foreground">{meta.total}</span> résultats
                </div>
            )}

            {/* Shadcn UI Pagination */}
            <ShadcnPagination className="justify-center sm:justify-end mx-0 w-auto">
                <PaginationContent>
                    {links.map((link, i) => {
                        const isPrevious = i === 0;
                        const isNext = i === links.length - 1;
                        const isDots = link.label.includes('...');

                        if (isDots) {
                            return (
                                <PaginationItem key={i}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }

                        if (isPrevious) {
                            return (
                                <PaginationItem key={i}>
                                    {link.url ? (
                                        <PaginationPrevious asChild>
                                            <Link href={link.url} preserveScroll preserveState className="flex items-center gap-1">
                                                <ChevronLeft className="h-4 w-4" />
                                                <span>Précédent</span>
                                            </Link>
                                        </PaginationPrevious>
                                    ) : (
                                        <PaginationPrevious className="opacity-50 pointer-events-none" />
                                    )}
                                </PaginationItem>
                            );
                        }

                        if (isNext) {
                            return (
                                <PaginationItem key={i}>
                                    {link.url ? (
                                        <PaginationNext asChild>
                                            <Link href={link.url} preserveScroll preserveState className="flex items-center gap-1">
                                                <span>Suivant</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        </PaginationNext>
                                    ) : (
                                        <PaginationNext className="opacity-50 pointer-events-none" />
                                    )}
                                </PaginationItem>
                            );
                        }

                        return (
                            <PaginationItem key={i}>
                                {link.url ? (
                                    <PaginationLink asChild isActive={link.active}>
                                        <Link href={link.url} preserveScroll preserveState>
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Link>
                                    </PaginationLink>
                                ) : (
                                    <PaginationLink isActive={link.active}>
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        );
                    })}
                </PaginationContent>
            </ShadcnPagination>
        </div>
    );
}
