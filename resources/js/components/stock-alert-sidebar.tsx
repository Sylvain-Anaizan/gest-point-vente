import { AlertTriangle, Package, ExternalLink, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface LowStockProduct {
    id: number;
    nom: string;
    quantite: number;
    category: { nom: string };
}

export function StockAlertSidebar({ products }: { products: LowStockProduct[] }) {
    if (products.length === 0) return null;

    return (
        <Card className="border-orange-200 dark:border-orange-900/40 bg-orange-50/10 dark:bg-orange-950/10 overflow-hidden">
            <div className="p-4 border-b border-orange-100 dark:border-orange-900/30 flex items-center justify-between bg-orange-500/5">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 animate-pulse" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-orange-700 dark:text-orange-400">Stock Critique</h3>
                </div>
                <Badge variant="outline" className="bg-orange-500 text-white border-0 font-black text-[10px]">
                    {products.length}
                </Badge>
            </div>
            <CardContent className="p-0">
                <ScrollArea className="h-[280px]">
                    <div className="divide-y divide-orange-100 dark:divide-orange-900/20">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/produits/${product.id}/edit`}
                                className="flex items-center justify-between p-4 hover:bg-orange-500/5 transition-colors group"
                            >
                                <div className="min-w-0 pr-4">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-3 w-3 text-orange-400" />
                                        <p className="font-bold text-xs truncate group-hover:text-orange-600 transition-colors">{product.nom}</p>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase mt-0.5">{product.category.nom}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Badge variant={product.quantite === 0 ? "destructive" : "outline"} className={cn(
                                        "text-[10px] font-black h-5",
                                        product.quantite > 0 && "border-orange-200 text-orange-700 bg-orange-50 dark:bg-orange-950"
                                    )}>
                                        {product.quantite} rest.
                                    </Badge>
                                    <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-3 bg-orange-50/50 dark:bg-orange-950/20 border-t border-orange-100 dark:border-orange-900/30 text-center">
                    <Link href="/produits" className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 flex items-center justify-center gap-1">
                        Inventaire complet <ExternalLink className="h-2 w-2" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
