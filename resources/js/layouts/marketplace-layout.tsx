import { Link, usePage } from '@inertiajs/react';
import { ShoppingCart, Search, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SharedData } from '@/types';

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<SharedData>().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="font-bold text-xl flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground p-1 rounded-lg">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                        <span>GestAnaizan</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link href="/" className="transition-colors hover:text-primary">Accueil</Link>
                        <Link href="/catalog" className="transition-colors hover:text-primary">Catalogue</Link>
                    </nav>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden md:flex items-center flex-1 max-w-sm relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher un produit..."
                            className="pl-9 w-full bg-muted/50"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Cart */}
                        <Button variant="ghost" size="icon" className="relative" asChild>
                            <Link href="/cart">
                                <ShoppingCart className="h-5 w-5" />
                                {(usePage<SharedData>().props as any).cartCount > 0 && (
                                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                                        {(usePage<SharedData>().props as any).cartCount}
                                    </Badge>
                                )}
                            </Link>
                        </Button>

                        {/* User Menu */}
                        {auth.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <User className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard">Mon Compte</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/logout" method="post" as="button" className="w-full text-left">Déconnexion</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Button variant="ghost" asChild>
                                    <Link href="/login">Connexion</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/register">S'inscrire</Link>
                                </Button>
                            </div>
                        )}

                        {/* Mobile Menu Trigger */}
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <div className="flex flex-col gap-4 mt-8">
                                    <Link href="/" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>Accueil</Link>
                                    <Link href="/catalog" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>Catalogue</Link>
                                    {!auth.user && (
                                        <>
                                            <Link href="/login" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>Connexion</Link>
                                            <Link href="/register" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>S'inscrire</Link>
                                        </>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t py-6 md:py-0">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 md:h-24">
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        © 2024 GestAnaizan. Tous droits réservés.
                    </p>
                </div>
            </footer>
        </div>
    );
}
