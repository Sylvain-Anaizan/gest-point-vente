import { dashboard, login, register } from '@/routes';
import { type ShablueData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Package,
    Users,
    TrendingUp,
    Shield,
    Zap,
    Clock,
    LayoutDashboard,
    Lock,
    Store
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<ShablueData>().props;

    return (
        <div className="min-h-screen bg-background selection:bg-primary/10 selection:text-primary">
            <Head title="Gest Anaizan - Portail de Gestion" />

            {/* Arrière-plan Complexe & Premium */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/95 to-primary/5 dark:from-background dark:via-background/98 dark:to-primary/10" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse delay-700" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            {/* Header Flottant */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="p-2.5 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <img src="/storage/anaizan.png" alt="Logo" className="h-8 w-8 object-contain" />
                        </div>
                        <div className="hidden sm:block">
                            <h2 className="text-lg font-extrabold tracking-tighter text-foreground">
                                GEST <span className="text-primary italic">ANAIZAN</span>
                            </h2>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Smart Management System</p>
                        </div>
                    </div>

                    <nav className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="group flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="group flex items-center gap-2 rounded-xl border border-border/50 bg-background/40 px-5 py-2.5 text-sm font-semibold hover:bg-accent hover:border-primary/50 transition-all"
                            >
                                <Lock className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                Connexion
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20 relative">
                {/* Hero Minimalist et Impactant */}
                <div className="text-center space-y-6 mb-24 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary animate-in fade-in slide-in-from-top-4 duration-500">
                        <Zap className="h-3.5 w-3.5 fill-current" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Next-Gen Operations</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        Propulsez votre <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/40">Business au Sommet.</span>
                    </h1>

                    <p className="text-lg text-muted-foreground leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        La solution tout-en-un pour la gestion de stocks, le suivi des ventes en temps réel <br className="hidden md:block" />
                        et l'optimisation de vos boutiques Anaizan.
                    </p>
                </div>

                {/* Portail de Sélection de Rôle - DESIGN PREMIUM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32 max-w-5xl mx-auto">
                    {/* Carte Admin */}
                    <div className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/10 rounded-[2rem] blur opacity-20 group-hover:opacity-100 transition duration-500" />
                        <div className="relative h-full bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2rem] p-10 flex flex-col items-center text-center transition-all duration-500 group-hover:-translate-y-2">
                            <div className="mb-8 p-6 bg-primary/10 rounded-3xl relative">
                                <Shield className="h-12 w-12 text-primary" />
                                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                            </div>

                            <h3 className="text-2xl font-bold mb-4 tracking-tight">Portail Administration</h3>
                            <p className="text-sm text-muted-foreground font-medium mb-10 leading-relaxed">
                                Gérez vos boutiques, supervisez votre staff et analysez
                                vos rapports de performance consolidés en un seul endroit.
                            </p>

                            <div className="mt-auto grid grid-cols-2 gap-3 w-full">
                                <Link
                                    href={`${login()}?role=admin`}
                                    className="flex items-center justify-center rounded-2xl border border-primary/20 py-4 text-sm font-bold hover:bg-primary/5 transition-all active:scale-95"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href={`${register()}?role=admin`}
                                    className="flex items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 py-4 text-sm font-bold text-primary hover:bg-primary/20 transition-all active:scale-95"
                                >
                                    S'inscrire
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Carte Employé */}
                    <div className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/60 rounded-[2rem] blur opacity-10 group-hover:opacity-40 transition duration-500" />
                        <div className="relative h-full bg-primary/[0.03] backdrop-blur-xl border border-primary/20 rounded-[2rem] p-10 flex flex-col items-center text-center transition-all duration-500 group-hover:-translate-y-2">
                            <div className="mb-8 p-6 bg-primary rounded-3xl shadow-xl shadow-primary/30 relative overflow-hidden group-hover:scale-110 transition-transform">
                                <Store className="h-12 w-12 text-primary-foreground relative z-10" />
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                            </div>

                            <h3 className="text-2xl font-bold mb-4 tracking-tight">Espace Vente & Staff</h3>
                            <p className="text-sm text-muted-foreground font-medium mb-10 leading-relaxed">
                                Accédez rapidement au point de vente (POS), gérez votre
                                inventaire local et suivez vos objectifs personnels.
                            </p>

                            <div className="mt-auto grid grid-cols-2 gap-3 w-full">
                                <Link
                                    href={`${login()}?role=employé`}
                                    className="flex items-center justify-center rounded-2xl border border-primary/20 bg-background/50 py-4 text-sm font-bold text-foreground hover:bg-background transition-all active:scale-95"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href={`${register()}?role=employé`}
                                    className="flex items-center justify-center rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
                                >
                                    Inscription
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features de Confiance */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
                    {[
                        { icon: Package, title: 'Inventaire HD', desc: 'Gestion visuelle et précise' },
                        { icon: TrendingUp, title: 'Analytique', desc: 'Graphiques en temps réel' },
                        { icon: Users, title: 'RH Integré', desc: 'Gestion simplifiée des rôles' },
                        { icon: Clock, title: 'Flux direct', desc: 'Performance sans latence' },
                    ].map((feature, i) => (
                        <div key={i} className="p-6 rounded-2xl border border-border/50 bg-card/20 hover:bg-card/40 transition-colors">
                            <feature.icon className="h-5 w-5 text-primary mb-3" />
                            <h4 className="text-sm font-bold mb-1">{feature.title}</h4>
                            <p className="text-xs text-muted-foreground">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="border-t border-border/40 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-muted-foreground font-medium">
                        © {new Date().getFullYear()} ANAIZAN MALI • Excellence Opérationnelle
                    </p>
                    <div className="flex gap-8">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Sécurité 256-bit</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Mali Digital Hub</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
