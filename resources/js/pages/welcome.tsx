import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import {
    ArrowRight,
    Shield,
    Zap,
    LayoutDashboard,
    Lock,
    Store,
    Activity,
    LineChart,
    Package
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-[#030712] text-slate-200 selection:bg-primary/20 selection:text-primary overflow-x-hidden font-sans">
            <Head title="Gest Anaizan - Portail de Gestion Intelligent" />

            {/* Background Layer - Ultra Premium */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-slate-950 to-slate-950" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150" />

                {/* Dynamic Blobs */}
                <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px] animate-[pulse_8s_ease-in-out_infinite]" />
                <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] animate-[pulse_12s_ease-in-out_infinite_delay-1000]" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
            </div>

            {/* Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4 group">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-primary/20 rounded-xl blur-lg group-hover:bg-primary/30 transition-all" />
                            <div className="relative p-2.5 bg-slate-900/80 border border-white/10 rounded-xl group-hover:scale-105 transition-all duration-500 shadow-2xl">
                                <img src="/storage/anaizan.png" alt="Logo" className="h-7 w-7 object-contain" />
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <h2 className="text-xl font-black tracking-[-0.05em] text-white">
                                GEST<span className="text-primary italic">ANAIZAN</span>
                            </h2>
                            <div className="flex items-center gap-1.5">
                                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-black">Powered by AI</p>
                            </div>
                        </div>
                    </div>

                    <nav>
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] hover:-translate-y-0.5 transition-all active:scale-95"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Accéder au Dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                            >
                                <Lock className="h-4 w-4 text-primary" />
                                Connexion
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24 relative">
                {/* Hero Section */}
                <div className="text-center space-y-8 mb-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary animate-in fade-in zoom-in duration-700">
                        <Zap className="h-3 w-3 fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-[.25em]">Version 2.0 • Excellence Opérationnelle</span>
                    </div>

                    <h1 className="text-6xl lg:text-8xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[0.95] animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Pilotez votre <br />
                        <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#fff_0%,#475569_100%)]">Écosystème</span> <br />
                        <span className="text-primary italic">Anaizan.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        L'interface de gestion unifiée la plus avancée du Mali.
                        Simplifiez votre logistique, décuplez votre rentabilité.
                    </p>
                </div>

                {/* Login Portal Cards */}
                {!auth.user && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-32 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                        {/* Admin Card */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-blue-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-30 transition duration-700" />
                            <div className="relative h-full bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center text-center transition-all duration-700 group-hover:-translate-y-3 group-hover:bg-slate-900/60 shadow-2xl">
                                <div className="mb-8 relative">
                                    <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative h-20 w-20 flex items-center justify-center bg-primary/10 rounded-[2rem] border border-primary/20 rotate-6 group-hover:rotate-12 transition-transform duration-500">
                                        <Shield className="h-10 w-10 text-primary" />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-white mb-4">Administration</h3>
                                <p className="text-sm text-slate-400 font-medium mb-12 leading-relaxed h-12">
                                    Supervision globale, analyses de données massives
                                    et gestion stratégique multi-boutiques.
                                </p>

                                <Link
                                    href={`${login()}?role=admin`}
                                    className="w-full mt-auto py-5 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                                >
                                    Accès Stratégique
                                </Link>
                            </div>
                        </div>

                        {/* Staff Card */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-orange-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-30 transition duration-700" />
                            <div className="relative h-full bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center text-center transition-all duration-700 group-hover:-translate-y-3 group-hover:bg-slate-900/60 shadow-2xl">
                                <div className="mb-8 relative">
                                    <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative h-20 w-20 flex items-center justify-center bg-primary rounded-[2rem] border border-white/10 -rotate-6 group-hover:-rotate-12 transition-transform duration-500 shadow-xl shadow-primary/30">
                                        <Store className="h-10 w-10 text-primary-foreground" />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-white mb-4">Point de Vente</h3>
                                <p className="text-sm text-slate-400 font-medium mb-12 leading-relaxed h-12">
                                    Optimisez vos ventes quotidiennes, gérez vos
                                    stocks en local et suivez vos performances.
                                </p>

                                <Link
                                    href={`${login()}?role=employé`}
                                    className="w-full mt-auto py-5 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)]"
                                >
                                    Accès Opérationnel
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Micro Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {[
                        { icon: Activity, title: 'Temps Réel', desc: 'Sychronisation instantanée' },
                        { icon: LineChart, title: 'Analytique', desc: 'Visualisation de croissance' },
                        { icon: Package, title: 'Logistique', desc: 'Gestion de flux intelligents' },
                        { icon: Shield, title: 'Sécurité', desc: 'Cryptage de niveau bancaire' },
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all"
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            <feature.icon className="h-6 w-6 text-primary mb-4 group-hover:scale-110 transition-transform" />
                            <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">{feature.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="border-t border-white/5 py-12 mt-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                            © {new Date().getFullYear()} ANAIZAN MALI
                        </p>
                        <p className="text-[10px] text-slate-600 font-medium">BAMAKO • Excellence Tech</p>
                    </div>

                    <div className="flex justify-center gap-8">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700">AES Connect</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700">Mali Hub</span>
                    </div>

                    <div className="flex flex-col md:items-end gap-2">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_#7c3aed]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Cluster: Stable</span>
                        </div>
                        <p className="text-[9px] text-slate-600 font-medium tracking-tighter">Uptime: 99.998% • Latency: 14ms</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
