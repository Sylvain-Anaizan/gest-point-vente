import { dashboard, login, register } from '@/routes';
import { type ShablueData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<ShablueData>().props;

    return (
        <>
            <Head title="Gest Anaizan Master" />

            <div className="flex min-h-screen flex-col items-center bg-[#f5f5f5] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">

                {/* HEADER */}
                <header className=" w-full max-w-3xl flex items-center justify-between">
                    <img
                        src="/storage/anaizan.png"
                        alt="Anaizan Mali Logo"
                        className="h-64 object-contain"
                    />

                    <nav className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-md border px-5 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Accéder au Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-md border px-5 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    Connexion
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="rounded-md border px-5 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        Inscription
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                {/* MAIN CARD */}
                <main className="bg-white dark:bg-[#161615] shadow-lg rounded-xl max-w-3xl w-full p-10">
                    <h1 className="text-2xl font-semibold mb-4 text-center">
                        Bienvenue sur <span className="text-blue-600">Gest Anaizan Master</span>
                    </h1>

                    <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                        La plateforme interne de gestion opérationnelle d’Anaizan Mali.
                    </p>

                    {!auth.user ? (
                        <div className="flex flex-col items-center gap-3">
                            <Link
                                href={login()}
                                className="w-full max-w-xs text-center rounded-md bg-blue-600 text-white py-2 hover:bg-blue-700"
                            >
                                Se connecter
                            </Link>

                            {canRegister && (
                                <Link
                                    href={register()}
                                    className="w-full max-w-xs text-center rounded-md border py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    Créer un compte
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-md bg-blue-600 text-white px-6 py-2 hover:bg-blue-700"
                            >
                                Ouvrir le Dashboard
                            </Link>
                        </div>
                    )}
                </main>

                <footer className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                    © {new Date().getFullYear()} Anaizan Mali • Gestion interne
                </footer>
            </div>
        </>
    );
}
