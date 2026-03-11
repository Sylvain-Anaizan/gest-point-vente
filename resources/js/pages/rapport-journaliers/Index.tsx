import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus, Calendar, User, Pencil, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Pagination from '@/components/ui/pagination-custom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import RapportJournalierController from '@/actions/App/Http/Controllers/RapportJournalierController';

interface Rapport {
    id: number;
    user_id: number;
    date_rapport: string;
    contenu: string;
    created_at: string;
    user?: {
        name: string;
    };
}

interface PageProps {
    auth: {
        user: {
            id: number;
            [key: string]: unknown;
        };
    };
    [key: string]: unknown;
}

export default function Index({ rapports }: {
    rapports: {
        data: Rapport[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        from: number | null;
        to: number | null;
        total: number;
    }
}) {
    const { auth } = usePage<PageProps>().props;

    return (
        <AppLayout breadcrumbs={[{ title: 'Rapports Journaliers', href: '/rapport-journaliers' }]}>
            <Head title="Rapports Journaliers" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Rapports Journaliers</h2>
                        <p className="text-muted-foreground mt-1">Consultez ou rédigez votre compte redu de la journée.</p>
                    </div>
                    <Button asChild>
                        <Link href="/rapport-journaliers/create" className="gap-2">
                            <Plus className="h-4 w-4" />
                            <span>Nouveau Rapport</span>
                        </Link>
                    </Button>
                </div>

                <div className="space-y-8">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {!rapports.data || rapports.data.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-muted-foreground bg-accent/30 rounded-xl border border-dashed">
                                Aucun rapport trouvé. Rédigez votre premier rapport !
                            </div>
                        ) : (
                            rapports.data.map((rapport) => (
                                <Card key={rapport.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                    <CardHeader className="bg-muted/50 pb-4">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                <Link
                                                    href={RapportJournalierController.show.url(rapport.id)}
                                                    className="hover:underline hover:text-primary transition-colors"
                                                >
                                                    {format(new Date(rapport.date_rapport), 'EEEE d MMMM yyyy', { locale: fr })}
                                                </Link>
                                            </CardTitle>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={RapportJournalierController.show.url(rapport.id)}
                                                    className="text-muted-foreground hover:text-primary transition-colors"
                                                    title="Voir le rapport"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                {rapport.user_id === auth.user.id && (
                                                    <Link
                                                        href={RapportJournalierController.edit.url(rapport.id)}
                                                        className="text-muted-foreground hover:text-primary transition-colors"
                                                        title="Modifier le rapport"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                        {rapport.user && (
                                            <CardDescription className="flex items-center gap-1 mt-2 font-medium text-foreground/80">
                                                <User className="h-3 w-3" />
                                                {rapport.user.name}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="pt-4 pb-4">
                                        <div
                                            className="prose prose-sm dark:prose-invert max-w-none line-clamp-4 text-muted-foreground"
                                            dangerouslySetInnerHTML={{ __html: rapport.contenu }}
                                        />
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-center">
                        <Pagination
                            links={rapports.links}
                            meta={{
                                current_page: rapports.current_page,
                                from: (rapports as any).from,
                                last_page: rapports.last_page,
                                per_page: (rapports as any).per_page,
                                to: (rapports as any).to,
                                total: rapports.total
                            }}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
