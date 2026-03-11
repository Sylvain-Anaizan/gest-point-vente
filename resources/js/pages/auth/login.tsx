import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';
import { Mail, Lock, Loader2, LogIn, ShieldCheck, ArrowLeft } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
}: LoginProps) {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const roleParam = urlParams.get('role');
    const roleTitle = roleParam === 'admin' ? 'Administrateur' : roleParam === 'employé' ? 'Staff Vente' : '';

    return (
        <div className="min-h-screen w-full bg-[#030712] text-slate-200 selection:bg-primary/20 selection:text-primary overflow-hidden font-sans relative flex items-center justify-center p-6">
            <Head title={`Connexion ${roleTitle} - Gest Anaizan`} />

            {/* Background Layer - Consistency with Welcome */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-slate-950 to-slate-950" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150" />

                {/* Dynamic Blobs */}
                <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px] animate-[pulse_10s_ease-in-out_infinite]" />
                <div className="absolute bottom-[-5%] left-[5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] animate-[pulse_15s_ease-in-out_infinite_delay-2000]" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
            </div>

            <main className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-slate-950/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-700">
                {/* Visual Side (Hidden on mobile) */}
                <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-r border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[size:400%_400%] animate-[shimmer_8s_linear_infinite]" />

                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity group">
                            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 group-hover:scale-105 transition-transform">
                                <img src="/favicon.svg" alt="Logo" className="h-6 w-6 object-contain" />
                            </div>
                            <span className="text-lg font-black tracking-tighter text-white">GEST<span className="text-primary italic">ANAIZAN</span></span>
                        </Link>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Environnement Sécurisé</span>
                        </div>
                        <h2 className="text-5xl font-black text-white leading-tight">
                            {roleTitle ? (
                                <>Accès <br /><span className="text-primary">{roleTitle}</span></>
                            ) : (
                                <>Système de <br /><span className="text-primary">Gestion Maître</span></>
                            )}
                        </h2>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                            Identifiez-vous pour accéder à vos outils métier et suivre vos indicateurs de performance en temps réel.
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-6">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-10 w-10 rounded-full border-2 border-[#030712] bg-slate-800 flex items-center justify-center overflow-hidden">
                                    <div className="h-full w-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">ST</div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Validé par +50 magasins</p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white/[0.01]">
                    <div className="mb-10 lg:hidden text-center">
                        <div className="inline-flex p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-4">
                            <img src="/favicon.svg" alt="Logo" className="h-8 w-8 object-contain" />
                        </div>
                        <h2 className="text-2xl font-black text-white">Gest Anaizan</h2>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Connection</h1>
                        <p className="text-slate-500 font-medium font-sm">Saisissez vos identifiants de session.</p>
                    </div>

                    {status && (
                        <div className="mb-8 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold text-center">
                            {status}
                        </div>
                    )}

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                            Identifiant (Email)
                                        </Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="email"
                                                className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl focus:bg-white/[0.08] focus:border-primary/50 focus:ring-primary/20 transition-all font-medium"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                autoComplete="email"
                                                placeholder="votre@email.com"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between ml-1">
                                            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                Code d'accès
                                            </Label>
                                            {canResetPassword && (
                                                <Link
                                                    href={request().url}
                                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                                                >
                                                    Oublié ?
                                                </Link>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="password"
                                                className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl focus:bg-white/[0.08] focus:border-primary/50 focus:ring-primary/20 transition-all font-medium"
                                                type="password"
                                                name="password"
                                                required
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3 cursor-pointer group">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            className="h-5 w-5 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <label
                                            htmlFor="remember"
                                            className="text-xs font-bold text-slate-400 group-hover:text-slate-300 transition-colors cursor-pointer select-none"
                                        >
                                            Se souvenire de moi
                                        </label>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-15 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Se connecter <LogIn className="h-4 w-4" />
                                        </span>
                                    )}
                                </Button>
                            </>
                        )}
                    </Form>

                    <div className="mt-12 flex justify-center">
                        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors">
                            <ArrowLeft className="h-3 w-3" /> Retour au portail
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}